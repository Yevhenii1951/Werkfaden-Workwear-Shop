import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  addCheckoutCart,
  seedCheckout,
  SYSTEM_PROVIDER_ID,
} from "../helpers/seed-checkout"
import { registerAndLoginCustomer } from "../helpers/customer-auth"

jest.setTimeout(120 * 1000)

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    let storeHeaders: { headers: Record<string, string> }

    const createCustomerOrder = async (email: string, token: string, cartId: string) => {
      const customerHeaders = {
        headers: { ...storeHeaders.headers, authorization: `Bearer ${token}` },
      }

      await api.post(`/store/carts/${cartId}/customer`, {}, customerHeaders)
      const { data: collection } = await api.post(
        "/store/payment-collections",
        { cart_id: cartId },
        customerHeaders
      )
      await api.post(
        `/store/payment-collections/${collection.payment_collection.id}/payment-sessions`,
        { provider_id: SYSTEM_PROVIDER_ID },
        customerHeaders
      )
      const { data } = await api.post(`/store/carts/${cartId}/complete`, {}, customerHeaders)
      expect(data.type).toBe("order")
      expect(data.order.email).toBe(email)
      return data.order.id as string
    }

    it("allows a customer to read their order, denies another customer's order and rejects admin access", async () => {
      const checkout = await seedCheckout({ container: getContainer(), api })
      storeHeaders = checkout.storeHeaders

      const guestHeaders = {
        headers: { ...storeHeaders.headers, cookie: "" },
      }
      const guestCart = await addCheckoutCart(
        { api, storeHeaders: guestHeaders },
        checkout,
        "guest@example.com"
      )
      const { data: guestCollection } = await api.post(
        "/store/payment-collections",
        { cart_id: guestCart.id },
        guestHeaders
      )
      await api.post(
        `/store/payment-collections/${guestCollection.payment_collection.id}/payment-sessions`,
        { provider_id: SYSTEM_PROVIDER_ID },
        guestHeaders
      )
      const { data: guestCompletion } = await api.post(
        `/store/carts/${guestCart.id}/complete`,
        {},
        guestHeaders
      )
      const query = getContainer().resolve(ContainerRegistrationKeys.QUERY)
      const { data: [guestOrderRecord] } = await query.graph({
        entity: "order",
        fields: ["id", "customer_id"],
        filters: { id: guestCompletion.order.id },
      })
      const { data: [guestCustomer] } = await query.graph({
        entity: "customer",
        fields: ["id", "has_account"],
        filters: { id: guestOrderRecord.customer_id as string },
      })
      expect(guestCustomer.has_account).toBe(false)
      const guestReceipt = await api.get(
        `/store/orders/${guestCompletion.order.id}`,
        guestHeaders
      )
      expect(guestReceipt.data.order.id).toBe(guestCompletion.order.id)

      const emailA = "customer-a@example.com"
      const emailB = "customer-b@example.com"
      const tokenA = await registerAndLoginCustomer(api, storeHeaders, emailA)
      const tokenB = await registerAndLoginCustomer(api, storeHeaders, emailB)
      const failedLogin = await api.post(
        "/auth/customer/emailpass",
        { email: emailA, password: "incorrect-password" },
        { headers: storeHeaders.headers, validateStatus: () => true }
      )
      expect(failedLogin.status).toBe(401)

      const headersA = {
        headers: { ...storeHeaders.headers, authorization: `Bearer ${tokenA}` },
      }
      const cartA = checkout.cart
      const cartB = await addCheckoutCart(
        { api, storeHeaders },
        checkout,
        emailB
      )
      const orderA = await createCustomerOrder(emailA, tokenA, cartA.id)
      const orderB = await createCustomerOrder(emailB, tokenB, cartB.id)

      const ownOrder = await api.get(`/store/orders/${orderA}`, headersA)
      expect(ownOrder.data.order.id).toBe(orderA)

      const ownHistory = await api.get("/store/orders", headersA)
      expect(ownHistory.data.orders.map((order: { id: string }) => order.id)).toEqual([
        orderA,
      ])

      const otherOrder = await api.get(`/store/orders/${orderB}`, {
        headers: headersA.headers,
        validateStatus: () => true,
      })
      expect(otherOrder.status).toBe(401)

      const anonymousOrder = await api.get(`/store/orders/${orderB}`, {
        headers: guestHeaders.headers,
        validateStatus: () => true,
      })
      expect(anonymousOrder.status).toBe(401)

      const anonymousHistory = await api.get("/store/orders", {
        headers: guestHeaders.headers,
        validateStatus: () => true,
      })
      expect(anonymousHistory.status).toBe(401)

      const invalidTokenOrder = await api.get(`/store/orders/${orderA}`, {
        headers: {
          ...storeHeaders.headers,
          authorization: "Bearer invalid-token",
        },
        validateStatus: () => true,
      })
      expect(invalidTokenOrder.status).toBe(401)

      const adminRequest = await api.get("/admin/products", {
        headers: headersA.headers,
        validateStatus: () => true,
      })
      expect(adminRequest.status).toBe(401)

    })
  },
})

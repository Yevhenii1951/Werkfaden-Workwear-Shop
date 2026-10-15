import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import {
  ContainerRegistrationKeys,
  Modules,
  PaymentSessionStatus,
} from "@medusajs/framework/utils"
import {
  addCheckoutCart,
  seedCheckout,
  STRIPE_PROVIDER_ID,
  SYSTEM_PROVIDER_ID,
} from "../helpers/seed-checkout"

jest.setTimeout(120 * 1000)

medusaIntegrationTestRunner({
  env: {
    STRIPE_API_KEY: "sk_test_dummy",
    STRIPE_WEBHOOK_SECRET: "whsec_dummy",
  },
  testSuite: ({ api, getContainer }) => {
    let container: ReturnType<typeof getContainer>
    let storeHeaders: { headers: Record<string, string> }

    const query = () => container.resolve(ContainerRegistrationKeys.QUERY)

    const seed = async (options: { manageInventory?: boolean } = {}) => {
      const result = await seedCheckout({ container, api }, options)
      storeHeaders = result.storeHeaders
      return result
    }

    const createSession = async (cartId: string, providerId: string) => {
      const { data } = await api.post(
        "/store/payment-collections",
        { cart_id: cartId },
        storeHeaders
      )
      await api.post(
        `/store/payment-collections/${data.payment_collection.id}/payment-sessions`,
        { provider_id: providerId },
        storeHeaders
      )
    }

    const orderCount = async () => {
      const { data } = await query().graph({ entity: "order", fields: ["id"] })
      return data.length
    }

    beforeAll(() => {
      container = getContainer()
    })

    afterEach(() => {
      // The payment provider service is a long-lived container singleton, so a
      // jest.spyOn on it would otherwise leak into later tests in this file.
      jest.restoreAllMocks()
    })

    describe("WW-006 sandbox payment", () => {
      it("creates exactly one order and returns it on a retried confirmation", async () => {
        const { cart } = await seed()
        await createSession(cart.id, SYSTEM_PROVIDER_ID)

        const first = (await api.post(`/store/carts/${cart.id}/complete`, {}, storeHeaders)).data
        expect(first.type).toBe("order")
        expect(first.order).toEqual(
          expect.objectContaining({ id: expect.any(String), currency_code: "eur" })
        )

        const retried = (await api.post(`/store/carts/${cart.id}/complete`, {}, storeHeaders)).data
        expect(retried.type).toBe("order")
        expect(retried.order.id).toBe(first.order.id)

        expect(await orderCount()).toBe(1)
      })

      it("does not create an order when the provider refuses to authorize", async () => {
        const { cart } = await seed()

        const providerService = (container.resolve(Modules.PAYMENT) as unknown as {
          paymentProviderService_: {
            createSession: (...args: unknown[]) => Promise<unknown>
            authorizePayment: (...args: unknown[]) => Promise<unknown>
          }
        }).paymentProviderService_

        jest
          .spyOn(providerService, "createSession")
          .mockResolvedValue({ id: "session_test", status: PaymentSessionStatus.PENDING, data: {} })
        jest
          .spyOn(providerService, "authorizePayment")
          .mockResolvedValue({ status: PaymentSessionStatus.ERROR, data: {} })

        await createSession(cart.id, STRIPE_PROVIDER_ID)

        const failed = await api.post(
          `/store/carts/${cart.id}/complete`,
          {},
          { headers: storeHeaders.headers, validateStatus: () => true }
        )

        expect(failed.status).toBe(400)
        expect(failed.data.type).toBe("not_allowed")
        expect(await orderCount()).toBe(0)
      })

      it("gives the last unit to one buyer only and never drives stock negative", async () => {
        const checkout = await seed({ manageInventory: true })
        const rival = await addCheckoutCart(
          { api, storeHeaders },
          checkout,
          "buyer-b@example.com"
        )

        await createSession(checkout.cart.id, SYSTEM_PROVIDER_ID)
        await createSession(rival.id, SYSTEM_PROVIDER_ID)

        const won = await api.post(`/store/carts/${checkout.cart.id}/complete`, {}, storeHeaders)
        expect(won.data.type).toBe("order")

        const lost = await api.post(
          `/store/carts/${rival.id}/complete`,
          {},
          { headers: storeHeaders.headers, validateStatus: () => true }
        )
        expect(lost.status).toBe(400)
        expect(lost.data.type).not.toBe("order")
        expect(await orderCount()).toBe(1)

        const { data: levels } = await query().graph({
          entity: "inventory_level",
          fields: ["stocked_quantity", "reserved_quantity"],
        })
        expect(levels).toHaveLength(1)
        expect(levels[0].stocked_quantity).toBeGreaterThanOrEqual(0)
        expect(levels[0].reserved_quantity).toBeLessThanOrEqual(levels[0].stocked_quantity)
      })
    })
  },
})

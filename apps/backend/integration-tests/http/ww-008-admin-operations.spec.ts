import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { SYSTEM_PROVIDER_ID, seedCheckout, type CheckoutSeed } from "../helpers/seed-checkout"
import { adminHeaders, registerAndLoginAdmin } from "../helpers/admin-auth"

jest.setTimeout(120 * 1000)

medusaIntegrationTestRunner({
  env: {
    STRIPE_API_KEY: "sk_test_dummy",
    STRIPE_WEBHOOK_SECRET: "whsec_dummy",
  },
  testSuite: ({ api, getContainer }) => {
    let container: ReturnType<typeof getContainer>

    const query = () => container.resolve(ContainerRegistrationKeys.QUERY)

    const inventoryLevel = async (inventoryItemId: string) => {
      const { data } = await query().graph({
        entity: "inventory_level",
        fields: ["stocked_quantity", "reserved_quantity"],
        filters: { inventory_item_id: inventoryItemId },
      })
      expect(data).toHaveLength(1)
      return data[0] as { stocked_quantity: number; reserved_quantity: number }
    }

    const placeOrder = async (checkout: CheckoutSeed): Promise<{ id: string }> => {
      const headers = checkout.storeHeaders
      const { data: collection } = await api.post(
        "/store/payment-collections",
        { cart_id: checkout.cart.id },
        headers
      )
      await api.post(
        `/store/payment-collections/${collection.payment_collection.id}/payment-sessions`,
        { provider_id: SYSTEM_PROVIDER_ID },
        headers
      )
      const { data } = await api.post(`/store/carts/${checkout.cart.id}/complete`, {}, headers)
      return data.order
    }

    const orderRecord = async (orderId: string) => {
      const {
        data: [order],
      } = await query().graph({
        entity: "order",
        fields: [
          "id",
          "items.id",
          "payment_collections.payments.id",
          "payment_collections.payments.captures.raw_amount",
          "payment_collections.payments.refunds.raw_amount",
        ],
        filters: { id: orderId },
      })
      return order as {
        id: string
        items: { id: string }[]
        payment_collections: { payments: { id: string }[] }[]
      }
    }

    beforeAll(() => {
      container = getContainer()
    })

    it("rejects admin operations without a valid admin session", async () => {
      const anonymousOrders = await api.get("/admin/orders", { validateStatus: () => true })
      expect(anonymousOrders.status).toBe(401)

      const anonymousProducts = await api.get("/admin/products", { validateStatus: () => true })
      expect(anonymousProducts.status).toBe(401)

      const forged = await api.get("/admin/orders", {
        headers: { authorization: "Bearer invalid-token" },
        validateStatus: () => true,
      })
      expect(forged.status).toBe(401)

      const anonymousWrite = await api.post(
        "/admin/products/prod_missing/variants/var_missing",
        { prices: [{ currency_code: "eur", amount: 1 }] },
        { validateStatus: () => true }
      )
      expect(anonymousWrite.status).toBe(401)
    })

    it("operator edits a variant price and storefront pricing reflects it", async () => {
      const token = await registerAndLoginAdmin({ container, api }, "operator-fr8@werkfaden.test")
      const checkout = await seedCheckout({ container, api })

      const before = await api.get(
        `/store/products/${checkout.productId}?region_id=${checkout.regionId}`,
        checkout.storeHeaders
      )
      const beforeAmount =
        before.data.product.variants[0].calculated_price.calculated_amount

      const update = await api.post(
        `/admin/products/${checkout.productId}/variants/${checkout.variantId}`,
        { prices: [{ currency_code: "eur", amount: 4990 }] },
        adminHeaders(token)
      )
      expect(update.status).toBe(200)

      const after = await api.get(
        `/store/products/${checkout.productId}?region_id=${checkout.regionId}`,
        checkout.storeHeaders
      )
      const afterAmount = after.data.product.variants[0].calculated_price.calculated_amount

      expect(afterAmount).toBe(4990)
      expect(afterAmount).not.toBe(beforeAmount)
    })

    it("operator edits stock and the storefront availability reflects it", async () => {
      const token = await registerAndLoginAdmin({ container, api }, "operator-stock@werkfaden.test")
      const checkout = await seedCheckout({ container, api }, { manageInventory: true })

      const addToCart = (quantity: number) =>
        api.post(
          "/store/carts",
          {
            region_id: checkout.regionId,
            sales_channel_id: checkout.salesChannelId,
            email: "stock@example.com",
            items: [{ variant_id: checkout.variantId, quantity }],
          },
          { ...checkout.storeHeaders, validateStatus: () => true }
        )

      const adminLevel = (stockedQuantity: number) =>
        api.post(
          `/admin/inventory-items/${checkout.inventoryItemId}/location-levels/${checkout.locationId}`,
          { stocked_quantity: stockedQuantity },
          adminHeaders(token)
        )

      expect((await inventoryLevel(checkout.inventoryItemId!)).stocked_quantity).toBe(1)

      expect((await adminLevel(0)).status).toBe(200)
      expect((await addToCart(1)).status).toBe(400)

      expect((await adminLevel(5)).status).toBe(200)
      expect((await addToCart(3)).status).toBe(200)
      expect((await addToCart(6)).status).toBe(400)

      expect((await inventoryLevel(checkout.inventoryItemId!)).stocked_quantity).toBe(5)
    })

    it("fulfillment releases the reservation and subtracts the stocked quantity", async () => {
      const token = await registerAndLoginAdmin({ container, api }, "operator-fulfill@werkfaden.test")
      const checkout = await seedCheckout({ container, api }, { manageInventory: true })
      const order = await placeOrder(checkout)

      const afterOrder = await inventoryLevel(checkout.inventoryItemId!)
      expect(afterOrder.stocked_quantity).toBe(1)
      expect(afterOrder.reserved_quantity).toBe(1)

      const record = await orderRecord(order.id)
      const lineItemId = record.items[0].id

      const fulfillment = await api.post(
        `/admin/orders/${order.id}/fulfillments`,
        { items: [{ id: lineItemId, quantity: 1 }] },
        adminHeaders(token)
      )
      expect(fulfillment.status).toBe(200)

      const afterFulfillment = await inventoryLevel(checkout.inventoryItemId!)
      expect(afterFulfillment.stocked_quantity).toBe(0)
      expect(afterFulfillment.reserved_quantity).toBe(0)
    })

    it("cancelling an unfulfilled order releases the reservation without changing stock", async () => {
      const token = await registerAndLoginAdmin({ container, api }, "operator-cancel@werkfaden.test")
      const checkout = await seedCheckout({ container, api }, { manageInventory: true })
      const order = await placeOrder(checkout)

      const cancel = await api.post(
        `/admin/orders/${order.id}/cancel`,
        {},
        adminHeaders(token)
      )
      expect(cancel.status).toBe(200)

      const level = await inventoryLevel(checkout.inventoryItemId!)
      expect(level.stocked_quantity).toBe(1)
      expect(level.reserved_quantity).toBe(0)
    })

    it("refunds a captured sandbox payment without touching stock", async () => {
      const token = await registerAndLoginAdmin({ container, api }, "operator-refund@werkfaden.test")
      const checkout = await seedCheckout({ container, api }, { manageInventory: true })
      const order = await placeOrder(checkout)

      const record = await orderRecord(order.id)
      const paymentId = record.payment_collections[0].payments[0].id

      const captured = await api.post(
        `/admin/payments/${paymentId}/capture`,
        {},
        adminHeaders(token)
      )
      expect(captured.status).toBe(200)

      const refund = await api.post(
        `/admin/payments/${paymentId}/refund`,
        { amount: 1000 },
        adminHeaders(token)
      )
      expect(refund.status).toBe(200)
      expect(refund.data.payment.refunds).toHaveLength(1)

      const level = await inventoryLevel(checkout.inventoryItemId!)
      expect(level.stocked_quantity).toBe(1)
      expect(level.reserved_quantity).toBe(1)
    })

    it("rejects a refund before the payment is captured", async () => {
      const token = await registerAndLoginAdmin(
        { container, api },
        "operator-refund-early@werkfaden.test"
      )
      const checkout = await seedCheckout({ container, api }, { manageInventory: true })
      const order = await placeOrder(checkout)

      const record = await orderRecord(order.id)
      const paymentId = record.payment_collections[0].payments[0].id

      const refund = await api.post(
        `/admin/payments/${paymentId}/refund`,
        { amount: 1000 },
        { ...adminHeaders(token), validateStatus: () => true }
      )
      expect(refund.status).toBeGreaterThanOrEqual(400)

      const { data } = await query().graph({
        entity: "payment",
        fields: ["id", "refunds.id"],
        filters: { id: paymentId },
      })
      expect(data[0].refunds ?? []).toHaveLength(0)
    })
  },
})

import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import {
  ContainerRegistrationKeys,
  Modules,
  PaymentActions,
} from "@medusajs/framework/utils"
import { processPaymentWorkflow } from "@medusajs/medusa/core-flows"
import {
  addCheckoutCart,
  seedCheckout,
  SYSTEM_PROVIDER_ID,
} from "../helpers/seed-checkout"

jest.setTimeout(120 * 1000)

medusaIntegrationTestRunner({
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

    const paymentSessionId = async (cartId: string) => {
      const { data } = await query().graph({
        entity: "cart_payment_collection",
        fields: ["payment_collection.payment_sessions.id", "payment_collection.payment_sessions.provider_id"],
        filters: { cart_id: cartId },
      })
      const sessions = data[0]?.payment_collection?.payment_sessions ?? []
      const session = sessions.find(
        (entry) => entry?.provider_id === SYSTEM_PROVIDER_ID
      )
      if (!session) {
        throw new Error("no payment session for the cart")
      }
      return session.id as string
    }

    const orderCount = async () => {
      const { data } = await query().graph({ entity: "order", fields: ["id"] })
      return data.length
    }

    const paymentCount = async () => {
      const { data } = await query().graph({ entity: "payment", fields: ["id"] })
      return data.length
    }

    const complete = async (cartId: string) =>
      api.post(
        `/store/carts/${cartId}/complete`,
        {},
        { headers: storeHeaders.headers, validateStatus: () => true }
      )

    const deliverPaymentEvent = async (sessionId: string, amount: number) =>
      processPaymentWorkflow(container).run({
        input: {
          action: PaymentActions.AUTHORIZED,
          data: { session_id: sessionId, amount },
        },
      })

    beforeAll(() => {
      container = getContainer()
    })

    describe("WW-025 payment idempotency", () => {
      it("gives the last unit to exactly one of two simultaneous buyers", async () => {
        const checkout = await seed({ manageInventory: true })
        const rival = await addCheckoutCart(
          { api, storeHeaders },
          checkout,
          "race-buyer@example.com"
        )

        await createSession(checkout.cart.id, SYSTEM_PROVIDER_ID)
        await createSession(rival.id, SYSTEM_PROVIDER_ID)

        const results = await Promise.all([complete(checkout.cart.id), complete(rival.id)])

        const winners = results.filter(
          (result) => result.status === 200 && result.data.type === "order"
        )
        const rejected = results.filter((result) => result.status >= 400)

        expect(winners).toHaveLength(1)
        expect(rejected).toHaveLength(1)
        expect(await orderCount()).toBe(1)

        const { data: levels } = await query().graph({
          entity: "inventory_level",
          fields: ["stocked_quantity", "reserved_quantity"],
        })
        expect(levels).toHaveLength(1)
        expect(levels[0].stocked_quantity).toBeGreaterThanOrEqual(0)
        expect(levels[0].reserved_quantity).toBeLessThanOrEqual(levels[0].stocked_quantity)
      })

      it("keeps one order and one payment when the same payment event arrives repeatedly", async () => {
        const { cart } = await seed()
        await createSession(cart.id, SYSTEM_PROVIDER_ID)
        const sessionId = await paymentSessionId(cart.id)

        const first = await complete(cart.id)
        expect(first.status).toBe(200)
        expect(first.data.type).toBe("order")

        const amount = first.data.order.total
        const repeats = [
          await deliverPaymentEvent(sessionId, amount),
          await deliverPaymentEvent(sessionId, amount),
        ]
        expect(repeats).toHaveLength(2)

        const concurrent = await Promise.allSettled([
          deliverPaymentEvent(sessionId, amount),
          deliverPaymentEvent(sessionId, amount),
        ])
        expect(concurrent).toHaveLength(2)

        expect(await orderCount()).toBe(1)
        expect(await paymentCount()).toBe(1)
      })
    })
  },
})

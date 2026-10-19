import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { randomUUID } from "crypto"
import { seedCheckout } from "../helpers/seed-checkout"
import { adminHeaders, registerAndLoginAdmin } from "../helpers/admin-auth"

const INTEGRATION_TEST_TIMEOUT_MS = 120_000

jest.setTimeout(INTEGRATION_TEST_TIMEOUT_MS)

const runId = randomUUID().slice(0, 8)

type Headers = { headers: Record<string, string> }

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    const createQuote = async (
      checkout: Awaited<ReturnType<typeof seedCheckout>>,
      overrides: {
        name?: string
        email?: string
        quantity?: number
        variantId?: string
        productId?: string
        validateStatus?: (status: number) => boolean
      } = {}
    ) =>
      api.post(
        "/store/quotes",
        {
          contact_name: overrides.name ?? "Erika Musterfrau",
          contact_email: overrides.email ?? "bestellung@example.de",
          company: "Musterfirma GmbH",
          comment: "Bitte Angebot für die Sommersaison.",
          items: [
            {
              product_id: overrides.productId ?? checkout.productId,
              variant_id: overrides.variantId ?? checkout.variantId,
              quantity: overrides.quantity ?? 24,
            },
          ],
        },
        {
          ...checkout.storeHeaders,
          validateStatus: overrides.validateStatus,
        }
      )

    const tokenHeaders = (
      checkout: Awaited<ReturnType<typeof seedCheckout>>,
      token: string
    ): Headers => ({
      headers: {
        ...checkout.storeHeaders.headers,
        "x-quote-token": token,
      },
    })

    it("accepts an anonymous request and stores the resolved items", async () => {
      const checkout = await seedCheckout({ container: getContainer(), api })

      const created = await createQuote(checkout)

      expect(created.status).toBe(201)
      const { id, status, access_token } = created.data.quote_request
      expect(status).toBe("submitted")
      expect(typeof access_token).toBe("string")
      expect(access_token.length).toBeGreaterThan(20)

      const detail = await api.get(
        `/store/quotes/${id}`,
        tokenHeaders(checkout, access_token)
      )
      const request = detail.data.quote_request
      expect(request.id).toBe(id)
      expect(request.items).toHaveLength(1)
      expect(request.items[0].quantity).toBe(24)
      expect(request.items[0].title).toContain("Test Product")
      expect(request).not.toHaveProperty("access_token_hash")
    })

    it("hides a request from callers without the token or an owner session", async () => {
      const checkout = await seedCheckout({ container: getContainer(), api })
      const created = await createQuote(checkout)
      const id = created.data.quote_request.id

      const noToken = await api.get(`/store/quotes/${id}`, {
        ...checkout.storeHeaders,
        validateStatus: () => true,
      })
      expect([401, 404]).toContain(noToken.status)

      const wrongToken = await api.get(
        `/store/quotes/${id}`,
        {
          ...tokenHeaders(checkout, "not-a-real-token"),
          validateStatus: () => true,
        }
      )
      expect(wrongToken.status).toBe(404)

      const unknown = await api.get(
        `/store/quotes/quote_does_not_exist`,
        {
          ...tokenHeaders(checkout, "whatever"),
          validateStatus: () => true,
        }
      )
      expect(unknown.status).toBe(404)
    })

    it("rejects an unknown or mismatched variant", async () => {
      const checkout = await seedCheckout({ container: getContainer(), api })

      const unknown = await createQuote(checkout, {
        variantId: "variant_does_not_exist",
        validateStatus: () => true,
      })
      expect(unknown.status).toBe(400)

      const mismatched = await createQuote(checkout, {
        productId: "prod_other",
        validateStatus: () => true,
      })
      expect(mismatched.status).toBe(400)
    })

    it("lets an operator quote a request but not accept it", async () => {
      const checkout = await seedCheckout({ container: getContainer(), api })
      const created = await createQuote(checkout)
      const id = created.data.quote_request.id

      const token = await registerAndLoginAdmin(
        { container: getContainer(), api },
        `operator-quote-${runId}@werkfaden.test`
      )

      const quoted = await api.post(
        `/admin/quotes/${id}/status`,
        { status: "quoted", offered_total: 250.5 },
        adminHeaders(token)
      )
      const request = quoted.data.quote_request
      expect(request.status).toBe("quoted")
      expect(request.offered_total_minor).toBe(25050)
      expect(request.quoted_at).toBeTruthy()

      const acceptForbidden = await api.post(
        `/admin/quotes/${id}/status`,
        { status: "accepted" },
        { ...adminHeaders(token), validateStatus: () => true }
      )
      expect(acceptForbidden.status).toBeGreaterThanOrEqual(400)

      const closed = await api.post(
        `/admin/quotes/${id}/status`,
        { status: "closed" },
        adminHeaders(token)
      )
      expect(closed.data.quote_request.status).toBe("closed")

      const reopen = await api.post(
        `/admin/quotes/${id}/status`,
        { status: "quoted", offered_total: 10 },
        { ...adminHeaders(token), validateStatus: () => true }
      )
      expect(reopen.status).toBeGreaterThanOrEqual(400)
    })

    it("rejects an out-of-range offer total", async () => {
      const checkout = await seedCheckout({ container: getContainer(), api })
      const created = await createQuote(checkout)
      const id = created.data.quote_request.id

      const token = await registerAndLoginAdmin(
        { container: getContainer(), api },
        `operator-offer-${runId}@werkfaden.test`
      )

      const tooLow = await api.post(
        `/admin/quotes/${id}/status`,
        { status: "quoted", offered_total: 0.5 },
        { ...adminHeaders(token), validateStatus: () => true }
      )
      expect(tooLow.status).toBe(400)

      const missing = await api.post(
        `/admin/quotes/${id}/status`,
        { status: "quoted" },
        { ...adminHeaders(token), validateStatus: () => true }
      )
      expect(missing.status).toBe(400)
    })

    it("accepts a quoted request, issues a single-use code and applies it to a cart", async () => {
      const checkout = await seedCheckout({ container: getContainer(), api })
      const created = await createQuote(checkout)
      const id = created.data.quote_request.id
      const accessToken = created.data.quote_request.access_token

      const operator = await registerAndLoginAdmin(
        { container: getContainer(), api },
        `operator-accept-${runId}@werkfaden.test`
      )
      await api.post(
        `/admin/quotes/${id}/status`,
        { status: "quoted", offered_total: 10 },
        adminHeaders(operator)
      )

      const accepted = await api.post(
        `/store/quotes/${id}/accept`,
        {},
        tokenHeaders(checkout, accessToken)
      )
      const promotionCode = accepted.data.promotion_code
      expect(accepted.data.quote_request.status).toBe("accepted")
      expect(promotionCode).toMatch(/^ANGEBOT-[A-HJ-NP-Z2-9]{8}$/)

      const secondAccept = await api.post(
        `/store/quotes/${id}/accept`,
        {},
        { ...tokenHeaders(checkout, accessToken), validateStatus: () => true }
      )
      expect(secondAccept.status).toBeGreaterThanOrEqual(400)

      const before = (
        await api.get(`/store/carts/${checkout.cart.id}`, checkout.storeHeaders)
      ).data.cart
      const applied = await api.post(
        `/store/carts/${checkout.cart.id}/promotions`,
        { promo_codes: [promotionCode] },
        checkout.storeHeaders
      )
      expect(applied.data.cart.promotions).toEqual(
        expect.arrayContaining([expect.objectContaining({ code: promotionCode })])
      )
      expect(applied.data.cart.total).toBeLessThan(before.total)
    })

    it("refuses to accept a request that was never quoted", async () => {
      const checkout = await seedCheckout({ container: getContainer(), api })
      const created = await createQuote(checkout)
      const id = created.data.quote_request.id
      const accessToken = created.data.quote_request.access_token

      const response = await api.post(
        `/store/quotes/${id}/accept`,
        {},
        { ...tokenHeaders(checkout, accessToken), validateStatus: () => true }
      )

      expect(response.status).toBeGreaterThanOrEqual(400)
    })
  },
})

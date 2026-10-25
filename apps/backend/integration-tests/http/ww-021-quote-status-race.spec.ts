import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { randomUUID } from "crypto"
import { seedCheckout } from "../helpers/seed-checkout"
import { adminHeaders, registerAndLoginAdmin } from "../helpers/admin-auth"

const INTEGRATION_TEST_TIMEOUT_MS = 120_000
const BARRIER_TIMEOUT_MS = 15_000
const BARRIER_POLL_MS = 50

jest.setTimeout(INTEGRATION_TEST_TIMEOUT_MS)

const runId = randomUUID().slice(0, 8)

type Headers = { headers: Record<string, string> }
type Row = { count: number }
type QuoteRow = {
  status: string
  offered_total_minor: number | null
  promotion_code: string | null
}

/**
 * An operator decision used to be a read-then-write: two decisions that
 * overlapped both validated the status they had read and both wrote, so the
 * later one silently replaced the earlier one. In the worst case a buyer's
 * accept left a "rejected" row carrying a live discount code.
 *
 * These specs force the overlap with a row lock, so the losing writer really
 * was blocked while it re-read the status.
 */
medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    const knex = () => getContainer().resolve(ContainerRegistrationKeys.PG_CONNECTION)

    const createSubmittedRequest = async () => {
      const checkout = await seedCheckout({ container: getContainer(), api })
      const created = await api.post(
        "/store/quotes",
        {
          contact_name: "Erika Musterfrau",
          contact_email: "angebot@example.de",
          company: "Musterfirma GmbH",
          items: [
            {
              product_id: checkout.productId,
              variant_id: checkout.variantId,
              quantity: 12,
            },
          ],
        },
        checkout.storeHeaders
      )

      const operator = await registerAndLoginAdmin(
        { container: getContainer(), api },
        `operator-ww021-${runId}-${created.data.quote_request.id.slice(-6)}@werkfaden.test`
      )

      return {
        id: created.data.quote_request.id as string,
        accessToken: created.data.quote_request.access_token as string,
        storeHeaders: checkout.storeHeaders,
        operator: adminHeaders(operator),
      }
    }

    const setStatus = (
      quote: { id: string; operator: Headers },
      body: { status: string; offered_total?: number }
    ) =>
      api.post(`/admin/quotes/${quote.id}/status`, body, {
        headers: quote.operator.headers,
        validateStatus: () => true,
      })

    const accept = (
      quote: { id: string; accessToken: string; storeHeaders: Headers }
    ) =>
      api.post(
        `/store/quotes/${quote.id}/accept`,
        {},
        {
          headers: {
            ...quote.storeHeaders.headers,
            "x-quote-token": quote.accessToken,
          },
          validateStatus: () => true,
        }
      )

    const readQuote = async (id: string): Promise<QuoteRow | undefined> => {
      const response = await knex().raw<{ rows: QuoteRow[] }>(
        "select status, offered_total_minor, promotion_code from quote_request where id = ?",
        [id]
      )
      return response.rows[0]
    }

    const countOfferPromotions = async (): Promise<number> => {
      const response = await knex().raw<{ rows: Row[] }>(
        "select count(*)::int as count from promotion where code like ? and deleted_at is null",
        ["ANGEBOT-%"]
      )
      return response.rows[0]?.count ?? 0
    }

    const countBlockedQuoteUpdates = async (): Promise<number> => {
      const response = await knex().raw<{ rows: Row[] }>(
        `select count(*)::int as count
         from pg_stat_activity
         where wait_event_type = 'Lock'
           and datname = current_database()
           and query ilike '%update%'
           and query ilike '%quote_request%'`
      )
      return response.rows[0]?.count ?? 0
    }

    const waitForBlockedQuoteUpdates = async (
      expected: number
    ): Promise<number> => {
      const deadline = Date.now() + BARRIER_TIMEOUT_MS
      let blocked = 0

      while (Date.now() < deadline) {
        blocked = await countBlockedQuoteUpdates()
        if (blocked >= expected) {
          return blocked
        }
        await new Promise((resolve) => setTimeout(resolve, BARRIER_POLL_MS))
      }

      return blocked
    }

    /**
     * Holds the quote row, starts the writers, waits until both are blocked on
     * that row and only then lets them through. Without the lock the first
     * writer would finish before the second one reads.
     */
    const raceOnQuoteRow = async <T>(
      quoteId: string,
      writers: () => Promise<[T, T]>
    ): Promise<{ responses: [T, T]; blocked: number }> => {
      const transaction = await knex().transaction()
      let committed = false

      try {
        await transaction.raw("select id from quote_request where id = ? for update", [
          quoteId,
        ])

        const responses = writers()
        const blocked = await waitForBlockedQuoteUpdates(2)

        await transaction.commit()
        committed = true

        return { responses: await responses, blocked }
      } finally {
        if (!committed) {
          await transaction.rollback()
        }
      }
    }

    it("keeps the first operator decision when quote and reject overlap", async () => {
      const quote = await createSubmittedRequest()

      const { responses, blocked } = await raceOnQuoteRow(quote.id, () =>
        Promise.all([
          setStatus(quote, { status: "quoted", offered_total: 250.5 }),
          setStatus(quote, { status: "rejected" }),
        ])
      )

      expect(blocked).toBeGreaterThanOrEqual(2)

      const statuses = responses.map((response) => response.status)
      expect(statuses.filter((status) => status === 200)).toHaveLength(1)
      expect(statuses.filter((status) => status >= 400)).toHaveLength(1)

      const quotingWon = responses[0].status === 200
      const stored = await readQuote(quote.id)

      expect(stored?.status).toBe(quotingWon ? "quoted" : "rejected")
      expect(stored?.offered_total_minor).toBe(quotingWon ? 25050 : null)
      expect(stored?.promotion_code).toBeNull()
    })

    it("does not let a reject overwrite a buyer's accept", async () => {
      const quote = await createSubmittedRequest()
      await setStatus(quote, { status: "quoted", offered_total: 250.5 })
      const promotionsBefore = await countOfferPromotions()

      const { responses, blocked } = await raceOnQuoteRow(quote.id, () =>
        Promise.all([accept(quote), setStatus(quote, { status: "rejected" })])
      )

      expect(blocked).toBeGreaterThanOrEqual(2)

      const acceptWon = responses[0].status === 200
      expect(responses[1].status).toBe(acceptWon ? 400 : 200)
      expect(responses.filter((response) => response.status === 200)).toHaveLength(1)

      const stored = await readQuote(quote.id)

      if (acceptWon) {
        expect(stored?.status).toBe("accepted")
        expect(stored?.promotion_code).toMatch(/^ANGEBOT-[A-HJ-NP-Z2-9]{8}$/)
        expect(await countOfferPromotions()).toBe(promotionsBefore + 1)
      } else {
        // The decision that won is the reject: no code may exist for it.
        expect(stored?.status).toBe("rejected")
        expect(stored?.promotion_code).toBeNull()
        expect(responses[0].status).toBe(400)
        expect(await countOfferPromotions()).toBe(promotionsBefore)
      }
    })

    it("leaves no code behind when the reject gets the row first", async () => {
      const quote = await createSubmittedRequest()
      await setStatus(quote, { status: "quoted", offered_total: 250.5 })
      const promotionsBefore = await countOfferPromotions()

      const { responses, blocked } = await raceOnQuoteRow(quote.id, () =>
        Promise.all([setStatus(quote, { status: "rejected" }), accept(quote)])
      )

      expect(blocked).toBeGreaterThanOrEqual(2)

      const rejectWon = responses[0].status === 200
      const stored = await readQuote(quote.id)

      if (rejectWon) {
        expect(stored?.status).toBe("rejected")
        expect(stored?.promotion_code).toBeNull()
        expect(responses[1].status).toBe(400)
        expect(await countOfferPromotions()).toBe(promotionsBefore)
      } else {
        expect(stored?.status).toBe("accepted")
        expect(stored?.promotion_code).toMatch(/^ANGEBOT-[A-HJ-NP-Z2-9]{8}$/)
        expect(responses[1].status).toBe(200)
        expect(await countOfferPromotions()).toBe(promotionsBefore + 1)
      }

      expect(stored?.offered_total_minor).toBe(25050)
    })

    it("refuses to accept a quote an operator rejected", async () => {
      const quote = await createSubmittedRequest()
      await setStatus(quote, { status: "quoted", offered_total: 250.5 })

      const rejected = await setStatus(quote, { status: "rejected" })
      expect(rejected.status).toBe(200)

      const accepted = await accept(quote)
      expect(accepted.status).toBe(400)

      const stored = await readQuote(quote.id)
      expect(stored?.status).toBe("rejected")
      expect(stored?.promotion_code).toBeNull()
    })
  },
})

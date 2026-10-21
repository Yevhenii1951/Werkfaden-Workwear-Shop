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

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    // The container is only available once the suite runs, not while it is
    // being defined.
    const knex = () =>
      getContainer().resolve(ContainerRegistrationKeys.PG_CONNECTION)

    const createQuotedRequest = async () => {
      const checkout = await seedCheckout({ container: getContainer(), api })
      const created = await api.post(
        "/store/quotes",
        {
          contact_name: "Erika Musterfrau",
          contact_email: "bestellung@example.de",
          company: "Musterfirma GmbH",
          items: [
            {
              product_id: checkout.productId,
              variant_id: checkout.variantId,
              quantity: 24,
            },
          ],
        },
        checkout.storeHeaders
      )

      const id = created.data.quote_request.id
      const accessToken = created.data.quote_request.access_token

      const operator = await registerAndLoginAdmin(
        { container: getContainer(), api },
        `operator-ww016-${runId}@werkfaden.test`
      )
      await api.post(
        `/admin/quotes/${id}/status`,
        { status: "quoted", offered_total: 250.5 },
        adminHeaders(operator)
      )

      return {
        id,
        accessToken,
        storeHeaders: checkout.storeHeaders,
      }
    }

    const acceptRequest = (id: string, accessToken: string, storeHeaders: Headers) =>
      api.post(
        `/store/quotes/${id}/accept`,
        {},
        {
          headers: {
            ...storeHeaders.headers,
            "x-quote-token": accessToken,
          },
          validateStatus: () => true,
        }
      )

    const countOfferPromotions = async (): Promise<number> => {
      const response = await knex().raw<{ rows: Row[] }>(
        "select count(*)::int as count from promotion where code like ? and deleted_at is null",
        ["ANGEBOT-%"]
      )
      return response.rows[0]?.count ?? 0
    }

    // Sessions that wait for the row lock of the quote request are the proof
    // that both accepts really overlapped instead of running one after another.
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

    const waitForBlockedQuoteUpdates = async (expected: number): Promise<number> => {
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

    it("issues exactly one code when a quote is accepted twice in a row", async () => {
      const quote = await createQuotedRequest()
      const promotionsBefore = await countOfferPromotions()

      const accepted = await acceptRequest(quote.id, quote.accessToken, quote.storeHeaders)
      expect(accepted.status).toBe(200)
      expect(accepted.data.promotion_code).toMatch(/^ANGEBOT-[A-HJ-NP-Z2-9]{8}$/)

      const rejected = await acceptRequest(quote.id, quote.accessToken, quote.storeHeaders)
      expect(rejected.status).toBe(400)

      expect(await countOfferPromotions()).toBe(promotionsBefore + 1)
    })

    it("lets only one of two concurrent accepts win", async () => {
      const quote = await createQuotedRequest()
      const promotionsBefore = await countOfferPromotions()

      // The row lock keeps the quote on "quoted" until both requests tried to
      // write it, so the race is exercised instead of hoped for.
      const transaction = await knex().transaction()
      let committed = false

      try {
        await transaction.raw(
          "select id from quote_request where id = ? for update",
          [quote.id]
        )

        const responses = Promise.all([
          acceptRequest(quote.id, quote.accessToken, quote.storeHeaders),
          acceptRequest(quote.id, quote.accessToken, quote.storeHeaders),
        ])

        const blocked = await waitForBlockedQuoteUpdates(2)
        await transaction.commit()
        committed = true

        const [first, second] = await responses

        expect(blocked).toBeGreaterThanOrEqual(2)

        const statuses = [first.status, second.status]
        expect(statuses.filter((status) => status === 200)).toHaveLength(1)
        expect(statuses.filter((status) => status === 400)).toHaveLength(1)

        const winner = first.status === 200 ? first : second
        const loser = first.status === 200 ? second : first
        const winnerCode = winner.data.promotion_code
        expect(winnerCode).toMatch(/^ANGEBOT-[A-HJ-NP-Z2-9]{8}$/)
        expect(winner.data.quote_request.status).toBe("accepted")
        expect(winner.data.quote_request.promotion_code).toBe(winnerCode)
        expect(loser.data.promotion_code).toBeUndefined()

        const stored = await knex().raw<{
          rows: { promotion_code: string | null }[]
        }>("select promotion_code from quote_request where id = ?", [quote.id])
        expect(stored.rows[0]?.promotion_code).toBe(winnerCode)

        expect(await countOfferPromotions()).toBe(promotionsBefore + 1)
      } finally {
        if (!committed) {
          await transaction.rollback()
        }
      }
    })

    it("gives the quote back when the offer code cannot be created", async () => {
      const quote = await createQuotedRequest()
      const promotionsBefore = await countOfferPromotions()

      // A currency without a region makes the promotion step fail - after the
      // quote was already reserved.
      await knex().raw(
        "update quote_request set currency_code = ? where id = ?",
        ["XXX", quote.id]
      )

      const failed = await acceptRequest(quote.id, quote.accessToken, quote.storeHeaders)
      expect(failed.status).toBe(404)

      const released = await knex().raw<{
        rows: {
          status: string
          promotion_code: string | null
          accepted_at: Date | null
        }[]
      }>(
        "select status, promotion_code, accepted_at from quote_request where id = ?",
        [quote.id]
      )
      expect(released.rows[0]?.status).toBe("quoted")
      expect(released.rows[0]?.promotion_code).toBeNull()
      expect(released.rows[0]?.accepted_at).toBeNull()
      expect(await countOfferPromotions()).toBe(promotionsBefore)

      // The buyer can accept again once the quote works again.
      await knex().raw(
        "update quote_request set currency_code = ? where id = ?",
        ["eur", quote.id]
      )
      const accepted = await acceptRequest(quote.id, quote.accessToken, quote.storeHeaders)
      expect(accepted.status).toBe(200)
      expect(accepted.data.promotion_code).toMatch(/^ANGEBOT-[A-HJ-NP-Z2-9]{8}$/)
      expect(await countOfferPromotions()).toBe(promotionsBefore + 1)
    })
  },
})

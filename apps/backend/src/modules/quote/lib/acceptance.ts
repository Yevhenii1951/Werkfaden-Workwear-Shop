import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type { MedusaContainer } from "@medusajs/framework/types"
import { QuoteRequestStatus } from "../models/quote-request"

/**
 * Accepting a quoted request hands out a single-use code for a money amount.
 * Two accepts that overlap in time must not both succeed, so the status change
 * is a compare-and-set: the row is only moved to "accepted" while it still is
 * "quoted". The request that wins the row issues the code, every other
 * request is rejected and creates no promotion.
 */
const ACCEPT_QUOTE_SQL = `
  update quote_request
  set status = ?,
      promotion_code = ?,
      accepted_at = ?,
      updated_at = ?
  where id = ?
    and status = ?
    and deleted_at is null
  returning id
`

/**
 * Compensation for a failed acceptance: the quote goes back to "quoted" so the
 * buyer can try again. Only a row that still carries our own code is released,
 * a quote that was accepted in the meantime stays untouched.
 */
const RELEASE_QUOTE_SQL = `
  update quote_request
  set status = ?,
      promotion_code = null,
      accepted_at = null,
      updated_at = ?
  where id = ?
    and status = ?
    and promotion_code = ?
    and deleted_at is null
`

type RawResponse<TRow> = { rows: TRow[] }

export type QuoteAcceptance = {
  id: string
  promotionCode: string
  acceptedAt: Date
}

/**
 * Moves a quoted request to "accepted" if - and only if - it still is
 * "quoted". Returns false when another acceptance won the race.
 */
export async function acceptQuotedRequest(
  container: MedusaContainer,
  input: QuoteAcceptance
): Promise<boolean> {
  const knex = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const response = await knex.raw<RawResponse<{ id: string }>>(
    ACCEPT_QUOTE_SQL,
    [
      QuoteRequestStatus.ACCEPTED,
      input.promotionCode,
      input.acceptedAt,
      input.acceptedAt,
      input.id,
      QuoteRequestStatus.QUOTED,
    ]
  )

  return response.rows.length > 0
}

/**
 * Gives a reserved quote back to the buyer after a failed workflow.
 */
export async function releaseQuoteAcceptance(
  container: MedusaContainer,
  input: { id: string; promotionCode: string }
): Promise<void> {
  const knex = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  await knex.raw(RELEASE_QUOTE_SQL, [
    QuoteRequestStatus.QUOTED,
    new Date(),
    input.id,
    QuoteRequestStatus.ACCEPTED,
    input.promotionCode,
  ])
}

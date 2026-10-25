import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type { MedusaContainer } from "@medusajs/framework/types"
import { QuoteRequestStatus } from "../models/quote-request"

/**
 * An operator decision must not overwrite a decision that landed in the
 * meantime: the status is written as a compare-and-set from the status the
 * caller validated against. Read-then-write let an operator reject win against
 * a buyer's accept, leaving a "rejected" row with a live 250 € code.
 */
const TRANSITION_SQL = `
  update quote_request
  set status = ?,
      updated_at = ?
  where id = ?
    and status = ?
    and deleted_at is null
  returning id
`

/**
 * Same transition, but carrying the offer fields a "quoted" status owns, so a
 * rollback can put the previous offer back instead of clearing it.
 */
const TRANSITION_WITH_OFFER_SQL = `
  update quote_request
  set status = ?,
      offered_total_minor = ?,
      quoted_at = ?,
      updated_at = ?
  where id = ?
    and status = ?
    and deleted_at is null
  returning id
`

type RawResponse<TRow> = { rows: TRow[] }

export type QuoteStatusTransition = {
  id: string
  from: QuoteRequestStatus
  to: QuoteRequestStatus
  offeredTotalMinor?: number
  quotedAt?: Date | null
}

/**
 * Moves a quote from `from` to `to` only while it still is on `from`.
 * Returns false when another writer got there first.
 */
export async function transitionQuoteStatus(
  container: MedusaContainer,
  input: QuoteStatusTransition
): Promise<boolean> {
  const knex = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const now = new Date()

  const response = await knex.raw<RawResponse<{ id: string }>>(
    input.offeredTotalMinor === undefined
      ? TRANSITION_SQL
      : TRANSITION_WITH_OFFER_SQL,
    input.offeredTotalMinor === undefined
      ? [input.to, now, input.id, input.from]
      : [
          input.to,
          input.offeredTotalMinor,
          input.quotedAt ?? now,
          now,
          input.id,
          input.from,
        ]
  )

  return response.rows.length > 0
}

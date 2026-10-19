import { z } from "@medusajs/framework/zod"
import { QuoteRequestStatus } from "../models/quote-request"

export const MAX_COMMENT_LENGTH = 1000
export const MAX_QUANTITY = 100000
export const MAX_ITEMS = 50

// Operator-entered offer bounds, in minor units (cents). Demo policy: the
// offer must cover at least 1,00 € and stay below 100 000,00 €.
export const MIN_OFFER_MINOR = 100
export const MAX_OFFER_MINOR = 10_000_000

export const QuoteItemInputSchema = z.object({
  product_id: z.string().trim().min(1).max(120),
  variant_id: z.string().trim().min(1).max(120),
  quantity: z.coerce.number().int().positive().max(MAX_QUANTITY),
})

export const QuoteRequestInputSchema = z.object({
  contact_name: z.string().trim().min(1).max(120),
  contact_email: z.string().trim().email().max(200),
  company: z.string().trim().max(160).optional(),
  comment: z.string().trim().max(MAX_COMMENT_LENGTH).optional(),
  items: z.array(QuoteItemInputSchema).min(1).max(MAX_ITEMS),
})

export type QuoteRequestInput = z.infer<typeof QuoteRequestInputSchema>

export function parseQuoteRequestInput(value: unknown): QuoteRequestInput {
  return QuoteRequestInputSchema.parse(value)
}

// The operator enters the offered total in major units (e.g. 249.9 → 249,90 €).
export const QuoteOfferSchema = z.object({
  offered_total: z.coerce.number().positive(),
})

export type QuoteOffer = z.infer<typeof QuoteOfferSchema>

export function offerToMinor(offeredTotalMajor: number): number {
  return Math.round(offeredTotalMajor * 100)
}

export function isValidOfferMinor(minor: number): boolean {
  return (
    Number.isInteger(minor) && minor >= MIN_OFFER_MINOR && minor <= MAX_OFFER_MINOR
  )
}

const STATUS_TRANSITIONS: Record<QuoteRequestStatus, QuoteRequestStatus[]> = {
  [QuoteRequestStatus.DRAFT]: [
    QuoteRequestStatus.SUBMITTED,
    QuoteRequestStatus.CLOSED,
  ],
  [QuoteRequestStatus.SUBMITTED]: [
    QuoteRequestStatus.QUOTED,
    QuoteRequestStatus.REJECTED,
    QuoteRequestStatus.CLOSED,
  ],
  [QuoteRequestStatus.QUOTED]: [
    QuoteRequestStatus.ACCEPTED,
    QuoteRequestStatus.REJECTED,
    QuoteRequestStatus.CLOSED,
  ],
  [QuoteRequestStatus.ACCEPTED]: [QuoteRequestStatus.CLOSED],
  [QuoteRequestStatus.REJECTED]: [QuoteRequestStatus.CLOSED],
  [QuoteRequestStatus.CLOSED]: [],
}

export function isQuoteStatus(value: string): value is QuoteRequestStatus {
  return (Object.values(QuoteRequestStatus) as string[]).includes(value)
}

export function canTransition(
  from: QuoteRequestStatus,
  to: QuoteRequestStatus
): boolean {
  return STATUS_TRANSITIONS[from]?.includes(to) ?? false
}

// Statuses an operator may set through the admin route. `accepted` is produced
// only by the buyer's accept action, never by an operator.
export const OPERATOR_STATUSES: QuoteRequestStatus[] = [
  QuoteRequestStatus.QUOTED,
  QuoteRequestStatus.REJECTED,
  QuoteRequestStatus.CLOSED,
]

export function isOperatorStatus(value: QuoteRequestStatus): boolean {
  return OPERATOR_STATUSES.includes(value)
}

export function resolveCustomerId(auth?: {
  actor_id?: string
  actor_type?: string
}): string | null {
  return auth?.actor_type === "customer" ? (auth.actor_id ?? null) : null
}

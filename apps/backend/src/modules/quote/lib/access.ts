import { MedusaError } from "@medusajs/framework/utils"
import { accessTokenMatches } from "./tokens"

export const QUOTE_TOKEN_HEADER = "x-quote-token"

type QuoteAccessAuth =
  | { actor_id?: string; actor_type?: string }
  | undefined

type AccessControlledQuote = {
  customer_id: string | null
  access_token_hash: string
}

// A quote is reachable either as its owner (authenticated customer) or with the
// one-time access token handed out on creation for anonymous visitors.
export function assertQuoteAccess(
  request: AccessControlledQuote,
  auth: QuoteAccessAuth,
  token: string | undefined
): void {
  const isOwner =
    !!request.customer_id &&
    auth?.actor_type === "customer" &&
    auth.actor_id === request.customer_id

  if (isOwner) {
    return
  }

  if (token && accessTokenMatches(token, request.access_token_hash)) {
    return
  }

  throw new MedusaError(
    MedusaError.Types.NOT_FOUND,
    "Quote request not found."
  )
}

export function readQuoteToken(headers: Record<string, unknown>): string | undefined {
  const value = headers[QUOTE_TOKEN_HEADER]
  if (Array.isArray(value)) {
    return typeof value[0] === "string" ? value[0] : undefined
  }
  return typeof value === "string" ? value : undefined
}

export function toPublicQuoteRequest<T extends { access_token_hash?: string }>(
  request: T
): Omit<T, "access_token_hash"> {
  const { access_token_hash: _hidden, ...rest } = request
  return rest
}

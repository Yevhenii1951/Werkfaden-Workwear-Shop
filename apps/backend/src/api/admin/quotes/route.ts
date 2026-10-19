import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { QUOTE_MODULE } from "../../../modules/quote"
import QuoteModuleService from "../../../modules/quote/service"
import { QuoteRequestStatus } from "../../../modules/quote/models/quote-request"
import { toPublicQuoteRequest } from "../../../modules/quote/lib/access"

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

function parsePageParam(value: unknown, fallback: number): number {
  const parsed = Number(Array.isArray(value) ? value[0] : value)
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : fallback
}

function parseStatusFilter(value: unknown): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== "string" || !raw) {
    return undefined
  }
  return (Object.values(QuoteRequestStatus) as string[]).includes(raw)
    ? raw
    : undefined
}

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const service = req.scope.resolve<QuoteModuleService>(QUOTE_MODULE)

  const limit = Math.min(
    parsePageParam(req.query.limit, DEFAULT_LIMIT) || DEFAULT_LIMIT,
    MAX_LIMIT
  )
  const offset = parsePageParam(req.query.offset, 0)
  const status = parseStatusFilter(req.query.status)

  const [quote_requests, count] = await service.listAndCountQuoteRequests(
    status ? { status: status as QuoteRequestStatus } : {},
    { order: { created_at: "DESC" }, skip: offset, take: limit, relations: ["items"] }
  )

  res.json({
    quote_requests: quote_requests.map(toPublicQuoteRequest),
    count,
    offset,
    limit,
  })
}

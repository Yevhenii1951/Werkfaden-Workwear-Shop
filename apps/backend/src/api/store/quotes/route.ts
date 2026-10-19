import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
  MedusaStoreRequest,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { QUOTE_MODULE } from "../../../modules/quote"
import QuoteModuleService from "../../../modules/quote/service"
import {
  parseQuoteRequestInput,
  resolveCustomerId,
} from "../../../modules/quote/lib/validation"
import { generateAccessToken, hashAccessToken } from "../../../modules/quote/lib/tokens"
import { toPublicQuoteRequest } from "../../../modules/quote/lib/access"
import { createQuoteRequestWorkflow } from "../../../workflows/create-quote-request"

async function resolveStoreCurrency(
  scope: MedusaStoreRequest["scope"]
): Promise<string> {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "currency_code"],
  })
  const region = regions[0]
  if (!region) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "No region is configured for this store."
    )
  }
  return region.currency_code
}

export async function POST(
  req: MedusaStoreRequest,
  res: MedusaResponse
): Promise<void> {
  const input = parseQuoteRequestInput(req.body)
  const currencyCode = await resolveStoreCurrency(req.scope)
  const accessToken = generateAccessToken()

  const { result } = await createQuoteRequestWorkflow(req.scope).run({
    input: {
      ...input,
      customer_id: resolveCustomerId(req.auth_context),
      access_token_hash: hashAccessToken(accessToken),
      currency_code: currencyCode,
    },
  })

  res.status(201).json({
    quote_request: {
      id: result.id,
      status: result.status,
      access_token: accessToken,
    },
  })
}

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const customerId = req.auth_context?.actor_id
  if (!customerId) {
    throw new MedusaError(
      MedusaError.Types.UNAUTHORIZED,
      "Authentication is required to list quote requests."
    )
  }

  const service = req.scope.resolve<QuoteModuleService>(QUOTE_MODULE)
  const [quote_requests, count] = await service.listAndCountQuoteRequests(
    { customer_id: customerId },
    { order: { created_at: "DESC" }, relations: ["items"] }
  )

  res.json({
    quote_requests: quote_requests.map(toPublicQuoteRequest),
    count,
  })
}

import {
  MedusaResponse,
  MedusaStoreRequest,
} from "@medusajs/framework/http"
import { QUOTE_MODULE } from "../../../../../modules/quote"
import QuoteModuleService from "../../../../../modules/quote/service"
import {
  assertQuoteAccess,
  readQuoteToken,
  toPublicQuoteRequest,
} from "../../../../../modules/quote/lib/access"
import { acceptQuoteRequestWorkflow } from "../../../../../workflows/accept-quote-request"

export async function POST(
  req: MedusaStoreRequest,
  res: MedusaResponse
): Promise<void> {
  const service = req.scope.resolve<QuoteModuleService>(QUOTE_MODULE)
  const request = await service.retrieveQuoteRequest(req.params.id)

  assertQuoteAccess(request, req.auth_context, readQuoteToken(req.headers))

  const { result } = await acceptQuoteRequestWorkflow(req.scope).run({
    input: { id: req.params.id },
  })

  res.json({
    quote_request: toPublicQuoteRequest(result.request),
    promotion_code: result.code,
  })
}

import {
  MedusaResponse,
  MedusaStoreRequest,
} from "@medusajs/framework/http"
import { QUOTE_MODULE } from "../../../../modules/quote"
import QuoteModuleService from "../../../../modules/quote/service"
import {
  assertQuoteAccess,
  readQuoteToken,
  toPublicQuoteRequest,
} from "../../../../modules/quote/lib/access"

export async function GET(
  req: MedusaStoreRequest,
  res: MedusaResponse
): Promise<void> {
  const service = req.scope.resolve<QuoteModuleService>(QUOTE_MODULE)
  const request = await service.retrieveQuoteRequest(req.params.id, {
    relations: ["items"],
  })

  assertQuoteAccess(request, req.auth_context, readQuoteToken(req.headers))

  res.json({ quote_request: toPublicQuoteRequest(request) })
}

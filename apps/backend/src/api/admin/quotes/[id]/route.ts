import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { QUOTE_MODULE } from "../../../../modules/quote"
import QuoteModuleService from "../../../../modules/quote/service"
import { toPublicQuoteRequest } from "../../../../modules/quote/lib/access"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const service = req.scope.resolve<QuoteModuleService>(QUOTE_MODULE)

  const quote_request = await service.retrieveQuoteRequest(req.params.id, {
    relations: ["items"],
  })

  res.json({ quote_request: toPublicQuoteRequest(quote_request) })
}

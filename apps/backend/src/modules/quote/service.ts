import { MedusaService } from "@medusajs/framework/utils"
import QuoteRequest, { QuoteRequestItem } from "./models/quote-request"

class QuoteModuleService extends MedusaService({
  QuoteRequest,
  QuoteRequestItem,
}) {}

export default QuoteModuleService

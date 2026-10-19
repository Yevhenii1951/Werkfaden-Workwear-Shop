import { z } from "@medusajs/framework/zod"
import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { QuoteRequestStatus } from "../../../../../modules/quote/models/quote-request"
import { toPublicQuoteRequest } from "../../../../../modules/quote/lib/access"
import { updateQuoteStatusWorkflow } from "../../../../../workflows/update-quote-request-status"

export const UpdateQuoteStatusSchema = z.object({
  status: z.enum([
    QuoteRequestStatus.QUOTED,
    QuoteRequestStatus.REJECTED,
    QuoteRequestStatus.CLOSED,
  ]),
  offered_total: z.coerce.number().positive().optional(),
})

type UpdateQuoteStatusBody = z.infer<typeof UpdateQuoteStatusSchema>

export async function POST(
  req: AuthenticatedMedusaRequest<UpdateQuoteStatusBody>,
  res: MedusaResponse
): Promise<void> {
  const { result } = await updateQuoteStatusWorkflow(req.scope).run({
    input: {
      id: req.params.id,
      status: req.validatedBody.status,
      offered_total: req.validatedBody.offered_total,
    },
  })

  res.json({ quote_request: toPublicQuoteRequest(result) })
}

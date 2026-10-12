import { z } from "@medusajs/framework/zod"
import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { PersonalizationRequestStatus } from "../../../../../modules/personalization/models/personalization-request"
import { updatePersonalizationRequestStatusWorkflow } from "../../../../../workflows/update-personalization-request-status"

export const UpdatePersonalizationRequestStatusSchema = z.object({
  status: z.enum(PersonalizationRequestStatus),
})

type UpdatePersonalizationRequestStatusBody = z.infer<
  typeof UpdatePersonalizationRequestStatusSchema
>

export async function POST(
  req: AuthenticatedMedusaRequest<UpdatePersonalizationRequestStatusBody>,
  res: MedusaResponse
): Promise<void> {
  const { result } = await updatePersonalizationRequestStatusWorkflow(
    req.scope
  ).run({
    input: {
      id: req.params.id,
      status: req.validatedBody.status,
    },
  })

  res.json({ personalization_request: result })
}

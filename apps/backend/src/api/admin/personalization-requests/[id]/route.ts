import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { PERSONALIZATION_MODULE } from "../../../../modules/personalization"
import PersonalizationModuleService from "../../../../modules/personalization/service"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const service = req.scope.resolve<PersonalizationModuleService>(
    PERSONALIZATION_MODULE
  )

  const personalization_request = await service.retrievePersonalizationRequest(
    req.params.id
  )

  res.json({ personalization_request })
}

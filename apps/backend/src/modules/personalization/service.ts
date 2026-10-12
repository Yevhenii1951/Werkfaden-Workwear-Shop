import { MedusaService } from "@medusajs/framework/utils"
import PersonalizationRequest from "./models/personalization-request"

class PersonalizationModuleService extends MedusaService({
  PersonalizationRequest,
}) {}

export default PersonalizationModuleService

import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { PERSONALIZATION_MODULE } from "../../../../../modules/personalization"
import PersonalizationModuleService from "../../../../../modules/personalization/service"
import {
  isLogoFormat,
  logoFileExtension,
  logoMimeType,
} from "../../../../../modules/personalization/lib/validation"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const service = req.scope.resolve<PersonalizationModuleService>(
    PERSONALIZATION_MODULE
  )

  const request = await service.retrievePersonalizationRequest(req.params.id)

  const fileService = req.scope.resolve(Modules.FILE)
  const stream = await fileService.getDownloadStream(request.file_id)

  const format = isLogoFormat(request.logo_format) ? request.logo_format : null
  const contentType = format ? logoMimeType(format) : "application/octet-stream"
  const extension = format ? logoFileExtension(format) : "bin"

  res.setHeader("Content-Type", contentType)
  res.setHeader("Content-Disposition", `inline; filename="logo.${extension}"`)
  res.setHeader("Cache-Control", "private, no-store")

  stream.on("error", () => {
    if (!res.headersSent) {
      res.status(404).end()
    } else {
      res.end()
    }
  })

  stream.pipe(res)
}

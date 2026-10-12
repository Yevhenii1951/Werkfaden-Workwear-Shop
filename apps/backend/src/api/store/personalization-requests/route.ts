import { randomUUID } from "crypto"
import {
  MedusaResponse,
  MedusaStoreRequest,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import {
  deleteFilesWorkflow,
  uploadFilesWorkflow,
} from "@medusajs/medusa/core-flows"
import { decodeLogoRaster } from "../../../modules/personalization/lib/image"
import {
  MAX_LOGO_BYTES,
  detectImageType,
  logoMimeType,
  logoStorageFilename,
  parsePersonalizationRequestInput,
  resolveCustomerId,
} from "../../../modules/personalization/lib/validation"
import { createPersonalizationRequestWorkflow } from "../../../workflows/create-personalization-request"

export async function POST(
  req: MedusaStoreRequest,
  res: MedusaResponse
): Promise<void> {
  const file = req.file

  if (!file) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "A logo file is required."
    )
  }

  if (file.size > MAX_LOGO_BYTES || file.buffer.length > MAX_LOGO_BYTES) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Logo must be at most 5 MiB."
    )
  }

  if (!detectImageType(file.buffer)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Logo must be a PNG, JPEG or WebP image."
    )
  }

  const format = await decodeLogoRaster(file.buffer)
  const input = parsePersonalizationRequestInput(req.body)

  const { result: uploaded } = await uploadFilesWorkflow(req.scope).run({
    input: {
      files: [
        {
          filename: logoStorageFilename(format, randomUUID()),
          mimeType: logoMimeType(format),
          content: file.buffer.toString("base64"),
          access: "private",
        },
      ],
    },
  })

  const uploadedFile = uploaded[0]

  try {
    const { result: request } = await createPersonalizationRequestWorkflow(
      req.scope
    ).run({
      input: {
        ...input,
        customer_id: resolveCustomerId(req.auth_context),
        file_id: uploadedFile.id,
        logo_format: format,
      },
    })

    res.status(201).json({
      personalization_request: {
        id: request.id,
        status: request.status,
      },
    })
  } catch (error) {
    await deleteFilesWorkflow(req.scope)
      .run({ input: { ids: [uploadedFile.id] } })
      .catch(() => undefined)

    throw error
  }
}

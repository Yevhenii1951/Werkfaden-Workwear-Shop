import { MedusaError } from "@medusajs/framework/utils"
import sharp from "sharp"
import { LogoFormat } from "./validation"

const SHARP_FORMAT_TO_LOGO: Record<string, LogoFormat | undefined> = {
  png: "png",
  jpeg: "jpeg",
  webp: "webp",
}

export async function decodeLogoRaster(buffer: Buffer): Promise<LogoFormat> {
  let format: LogoFormat | undefined

  try {
    const metadata = await sharp(buffer, { failOn: "error" }).metadata()
    format = metadata.format ? SHARP_FORMAT_TO_LOGO[metadata.format] : undefined

    if (format) {
      await sharp(buffer, { failOn: "error" }).raw().toBuffer()
    }
  } catch {
    format = undefined
  }

  if (!format) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Logo must be a valid PNG, JPEG or WebP image."
    )
  }

  return format
}

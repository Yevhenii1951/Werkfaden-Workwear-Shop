import { MedusaError } from "@medusajs/framework/utils"
import sharp from "sharp"
import { LogoFormat } from "./validation"

const SHARP_FORMAT_TO_LOGO: Record<string, LogoFormat | undefined> = {
  png: "png",
  jpeg: "jpeg",
  webp: "webp",
}

/**
 * The upload limit is 5 MiB of *file*, which says nothing about the decoded
 * raster: a solid-colour PNG of 50 megapixels fits into a few kilobytes and
 * still expands to ~150 MB in memory. 40 MP is far above what a print logo
 * needs (A4 at 300 dpi is ~8.7 MP) and keeps the worst case bounded.
 */
export const MAX_LOGO_PIXELS = 40_000_000

export async function decodeLogoRaster(buffer: Buffer): Promise<LogoFormat> {
  let format: LogoFormat | undefined

  try {
    const image = sharp(buffer, {
      failOn: "error",
      limitInputPixels: MAX_LOGO_PIXELS,
      sequentialRead: true,
    })
    const metadata = await image.metadata()
    format = metadata.format ? SHARP_FORMAT_TO_LOGO[metadata.format] : undefined

    if (format) {
      // Decoding is the expensive part; it must happen under the pixel limit
      // and not only after the (cheap) metadata read.
      await image.raw().toBuffer()
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

import { MedusaError } from "@medusajs/framework/utils"
import sharp from "sharp"
import { MAX_LOGO_PIXELS, decodeLogoRaster } from "../image"

async function makeImage(
  format: "png" | "jpeg" | "webp",
  width = 4,
  height = 4
): Promise<Buffer> {
  return sharp({
    create: { width, height, channels: 3, background: "#ffffff" },
  })
    .toFormat(format)
    .toBuffer()
}

describe("decodeLogoRaster", () => {
  it("decodes the supported raster formats", async () => {
    await expect(decodeLogoRaster(await makeImage("png"))).resolves.toBe("png")
    await expect(decodeLogoRaster(await makeImage("jpeg"))).resolves.toBe("jpeg")
    await expect(decodeLogoRaster(await makeImage("webp"))).resolves.toBe("webp")
  })

  it("rejects a non-image buffer", async () => {
    await expect(
      decodeLogoRaster(Buffer.from("definitely not an image"))
    ).rejects.toBeInstanceOf(MedusaError)
  })

  it("keeps a normal print-resolution logo well below the pixel limit", async () => {
    // A5 at 300 dpi, the largest thing a workwear logo realistically is.
    const a5 = await makeImage("png", 1748, 2480)
    expect(1748 * 2480).toBeLessThan(MAX_LOGO_PIXELS)
    await expect(decodeLogoRaster(a5)).resolves.toBe("png")
  })

  it("rejects a small file that decodes to more pixels than allowed", async () => {
    // Compresses to a few kilobytes, decodes to ~150 MB: the attack the file
    // size limit alone does not stop.
    const decompressionBomb = await makeImage("png", 7000, 7000)
    expect(decompressionBomb.length).toBeLessThan(1024 * 1024)
    expect(7000 * 7000).toBeGreaterThan(MAX_LOGO_PIXELS)

    await expect(decodeLogoRaster(decompressionBomb)).rejects.toBeInstanceOf(
      MedusaError
    )
  })
})

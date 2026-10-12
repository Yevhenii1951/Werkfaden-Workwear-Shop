import { MedusaError } from "@medusajs/framework/utils"
import sharp from "sharp"
import { decodeLogoRaster } from "../image"

async function makeImage(
  format: "png" | "jpeg" | "webp"
): Promise<Buffer> {
  return sharp({
    create: { width: 4, height: 4, channels: 3, background: "#ffffff" },
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
})

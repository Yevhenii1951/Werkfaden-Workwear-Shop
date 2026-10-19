import {
  divideRoundHalfUp,
  estimateEmbroidery,
  resolveQuantityBand,
  resolveStitchBand,
} from "../estimate"
import { EstimateEmbroiderySchema } from "../validation"
import {
  MAX_QUANTITY,
  MAX_STITCH_COUNT,
  QUANTITY_BANDS,
  STITCH_BANDS,
} from "../rate-table"

describe("divideRoundHalfUp", () => {
  it("rounds a half up and stays exact otherwise", () => {
    expect(divideRoundHalfUp(261, 100)).toBe(3)
    expect(divideRoundHalfUp(250, 100)).toBe(3)
    expect(divideRoundHalfUp(249, 100)).toBe(2)
    expect(divideRoundHalfUp(2614999, 1000000)).toBe(3)
  })
})

describe("band resolution", () => {
  it("maps stitch counts to the documented bands at the edges", () => {
    expect(resolveStitchBand(1).id).toBe("bis-4000")
    expect(resolveStitchBand(4000).id).toBe("bis-4000")
    expect(resolveStitchBand(4001).id).toBe("4001-8000")
    expect(resolveStitchBand(8000).id).toBe("4001-8000")
    expect(resolveStitchBand(8001).id).toBe("8001-12000")
    expect(resolveStitchBand(12000).id).toBe("8001-12000")
    expect(resolveStitchBand(12001).id).toBe("ueber-12000")
    expect(resolveStitchBand(MAX_STITCH_COUNT).id).toBe("ueber-12000")
  })

  it("maps quantities to the documented bands at the edges", () => {
    expect(resolveQuantityBand(1).id).toBe("1-9")
    expect(resolveQuantityBand(9).id).toBe("1-9")
    expect(resolveQuantityBand(10).id).toBe("10-49")
    expect(resolveQuantityBand(49).id).toBe("10-49")
    expect(resolveQuantityBand(50).id).toBe("50-199")
    expect(resolveQuantityBand(199).id).toBe("50-199")
    expect(resolveQuantityBand(200).id).toBe("ab-200")
    expect(resolveQuantityBand(MAX_QUANTITY).id).toBe("ab-200")
  })

  it("throws for non-positive values below the first band", () => {
    expect(() => resolveStitchBand(0)).toThrow(RangeError)
    expect(() => resolveQuantityBand(0)).toThrow(RangeError)
  })

  it("declares contiguous bands", () => {
    const stitchStarts = STITCH_BANDS.map((band) => band.min)
    const quantityStarts = QUANTITY_BANDS.map((band) => band.min)
    expect(stitchStarts).toEqual([1, 4001, 8001, 12001])
    expect(quantityStarts).toEqual([1, 10, 50, 200])
    expect(STITCH_BANDS.at(-1)?.max).toBeNull()
    expect(QUANTITY_BANDS.at(-1)?.max).toBeNull()
  })
})

describe("estimateEmbroidery", () => {
  it("computes a deterministic unit and total for a small order", () => {
    const estimate = estimateEmbroidery({
      position: "chest",
      garment: "tshirt",
      stitch_count: 3000,
      quantity: 5,
    })

    expect(estimate.unit_surcharge).toBe(2.9)
    expect(estimate.total).toBe(14.5)
    expect(estimate.quantity_band).toBe("1–9 Stück")
    expect(estimate.stitch_band).toBe("bis 4.000 Stiche")
    expect(estimate.currency_code).toBe("eur")
  })

  it("applies the garment and quantity factors and rounds to the cent", () => {
    const estimate = estimateEmbroidery({
      position: "chest",
      garment: "jacket",
      stitch_count: 6000,
      quantity: 25,
    })

    // 3.6 * 1.25 * 0.9 = 4.05
    expect(estimate.unit_surcharge).toBe(4.05)
    expect(estimate.quantity_factor).toBe(0.9)
    // 4.05 * 25 = 101.25
    expect(estimate.total).toBe(101.25)
  })

  it("derives the total from the rounded unit price (unit * qty)", () => {
    const estimate = estimateEmbroidery({
      position: "back",
      garment: "sweatshirt",
      stitch_count: 9000,
      quantity: 3,
    })

    // 6.3 * 1.1 = 6.93
    expect(estimate.unit_surcharge).toBe(6.93)
    expect(estimate.total).toBe(20.79)
  })

  it("rounds a half-cent up exactly once (no float drift)", () => {
    // 7.8 * 1.25 * 0.7 = 6.825 -> 6.83 (half-up), then * 200
    const estimate = estimateEmbroidery({
      position: "back",
      garment: "jacket",
      stitch_count: 12001,
      quantity: 200,
    })

    expect(estimate.unit_surcharge).toBe(6.83)
    expect(estimate.total).toBe(1366)
  })

  it("stays exact at the maximum quantity and stitch count", () => {
    const estimate = estimateEmbroidery({
      position: "sleeve",
      garment: "polo",
      stitch_count: MAX_STITCH_COUNT,
      quantity: MAX_QUANTITY,
    })

    // 4.1 * 1 * 0.7 = 2.87
    expect(estimate.unit_surcharge).toBe(2.87)
    expect(estimate.total).toBe(287000)
  })

  it("scales linearly with quantity inside a band", () => {
    const one = estimateEmbroidery({
      position: "sleeve",
      garment: "polo",
      stitch_count: 1000,
      quantity: 1,
    })
    const five = estimateEmbroidery({
      position: "sleeve",
      garment: "polo",
      stitch_count: 1000,
      quantity: 5,
    })

    expect(one.unit_surcharge).toBe(2.2)
    expect(one.quantity_factor).toBe(1)
    expect(five.total).toBe(11)
  })
})

describe("EstimateEmbroiderySchema", () => {
  const valid = {
    position: "chest",
    garment: "polo",
    stitch_count: 5000,
    quantity: 20,
  }

  it("coerces numeric strings and accepts a valid body", () => {
    const parsed = EstimateEmbroiderySchema.parse({
      ...valid,
      stitch_count: "5000",
      quantity: "20",
    })

    expect(parsed.stitch_count).toBe(5000)
    expect(parsed.quantity).toBe(20)
  })

  it("rejects an unknown position, garment, or out-of-range numbers", () => {
    expect(() =>
      EstimateEmbroiderySchema.parse({ ...valid, position: "kragen" })
    ).toThrow()
    expect(() =>
      EstimateEmbroiderySchema.parse({ ...valid, garment: "mantel" })
    ).toThrow()
    expect(() =>
      EstimateEmbroiderySchema.parse({ ...valid, stitch_count: 0 })
    ).toThrow()
    expect(() =>
      EstimateEmbroiderySchema.parse({ ...valid, stitch_count: MAX_STITCH_COUNT + 1 })
    ).toThrow()
    expect(() =>
      EstimateEmbroiderySchema.parse({ ...valid, quantity: 0 })
    ).toThrow()
    expect(() =>
      EstimateEmbroiderySchema.parse({ ...valid, quantity: MAX_QUANTITY + 1 })
    ).toThrow()
    expect(() =>
      EstimateEmbroiderySchema.parse({ ...valid, quantity: 1.5 })
    ).toThrow()
  })

  it("rejects unknown fields so a client cannot send a price", () => {
    expect(() =>
      EstimateEmbroiderySchema.parse({
        ...valid,
        unit_surcharge: 0.01,
        total: 0.2,
        currency_code: "usd",
      })
    ).toThrow()
  })
})

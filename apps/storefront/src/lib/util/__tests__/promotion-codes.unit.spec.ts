import {
  getUnappliedPromotionCode,
  parsePromotionCodes,
} from "../promotion-codes"

describe("parsePromotionCodes", () => {
  it("trims and returns an array of non-empty codes", () => {
    expect(parsePromotionCodes([" WERKFADEN10 ", "WERKFADEN5"])).toEqual([
      "WERKFADEN10",
      "WERKFADEN5",
    ])
  })

  it("rejects malformed action input", () => {
    expect(parsePromotionCodes("WERKFADEN10")).toBeNull()
    expect(parsePromotionCodes([" "])).toBeNull()
  })
})

describe("getUnappliedPromotionCode", () => {
  it("accepts applied codes without regard to letter case or surrounding spaces", () => {
    expect(
      getUnappliedPromotionCode([{ code: "WERKFADEN10" }], [" werkfaden10 "])
    ).toBeUndefined()
  })

  it("returns a code that Medusa did not apply", () => {
    expect(
      getUnappliedPromotionCode([{ code: "WERKFADEN10" }], [
        "WERKFADEN10",
        "UNKNOWN",
      ])
    ).toBe("UNKNOWN")
  })

  it("treats missing promotion codes as unapplied", () => {
    expect(getUnappliedPromotionCode(undefined, ["WERKFADEN10"])).toBe(
      "WERKFADEN10"
    )
  })
})

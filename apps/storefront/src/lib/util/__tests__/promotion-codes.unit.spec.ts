import { getUnappliedPromotionCode } from "../promotion-codes"

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

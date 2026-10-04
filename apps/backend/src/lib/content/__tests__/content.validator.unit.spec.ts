import { validateContentPackage } from "../validate"

describe("content package validator", () => {
  it("validates the local docs/content package", () => {
    const res = validateContentPackage()
    if (!res.ok) {
      throw new Error(`Content validation failed:\n${res.errors.join("\n")}`)
    }
    expect(res.ok).toBe(true)
    expect(res.stats?.productCount).toBe(25)
    expect(res.stats?.skuCount).toBe(150)
    expect(res.stats?.faqCount).toBe(18)
  })

  it("forbids SVG/PDF/AI/EPS references", () => {
    const res = validateContentPackage()
    expect(res.errors).not.toEqual(
      expect.arrayContaining([
        expect.stringMatching(/SVG|PDF|AI|EPS/),
      ])
    )
  })
})

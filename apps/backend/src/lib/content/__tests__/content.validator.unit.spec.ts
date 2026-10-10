import { validateCatalogIntegrity, validateContentPackage } from "../validate"

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

describe("catalog integrity", () => {
  const categories = [
    { slug: "t-shirts", category_id: "t-shirts" },
    { slug: "jacken-westen", category_id: "jacken-westen" },
  ]

  it("accepts a consistent catalog", () => {
    const products = [
      { slug: "team-t-shirt-basic", category_id: "t-shirts" },
      { slug: "softshell-jacke", category_id: "jacken-westen" },
    ]
    expect(validateCatalogIntegrity(products, categories)).toEqual([])
  })

  it("rejects a product pointing at an unknown category", () => {
    const products = [{ slug: "team-t-shirt-basic", category_id: "hoodies" }]
    expect(validateCatalogIntegrity(products, categories)).toContain(
      'products.json: product "team-t-shirt-basic" references unknown category "hoodies"'
    )
  })

  it("rejects a category without an id", () => {
    const products = [{ slug: "team-t-shirt-basic", category_id: "t-shirts" }]
    const errors = validateCatalogIntegrity(products, [{ slug: "t-shirts" }])
    expect(errors).toContain(
      'categories.json: category "t-shirts" missing category_id or id'
    )
  })

  it("rejects duplicate category ids", () => {
    const products = [{ slug: "team-t-shirt-basic", category_id: "t-shirts" }]
    const errors = validateCatalogIntegrity(products, [
      { slug: "t-shirts", category_id: "t-shirts" },
      { slug: "t-shirts-alt", category_id: "t-shirts" },
    ])
    expect(errors).toContain('categories.json: duplicate category id "t-shirts"')
  })

  it("rejects duplicate category slugs", () => {
    const products = [{ slug: "team-t-shirt-basic", category_id: "t-shirts" }]
    const errors = validateCatalogIntegrity(products, [
      { slug: "t-shirts", category_id: "t-shirts" },
      { slug: "t-shirts", category_id: "t-shirts-2" },
    ])
    expect(errors).toContain(
      'categories.json: duplicate category slug "t-shirts"'
    )
  })
})

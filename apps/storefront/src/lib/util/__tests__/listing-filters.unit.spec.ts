import { HttpTypes } from "@medusajs/types"

import {
  filterProductsByListing,
  parseListingFilters,
} from "../listing-filters"

const product = (
  variants: Array<{
    calculated_price?: { calculated_amount: number } | null
    inventory_quantity?: number
    manage_inventory?: boolean
    allow_backorder?: boolean
  }>
): HttpTypes.StoreProduct =>
  ({ id: "prod_test", variants } as unknown as HttpTypes.StoreProduct)

const withParams = (params: Record<string, string>) =>
  parseListingFilters(new URLSearchParams(params))

describe("parseListingFilters", () => {
  it("reads valid values", () => {
    const filters = withParams({
      priceMin: "20",
      priceMax: "80",
      inStock: "1",
      sortBy: "price_asc",
      page: "3",
      optionValueIds: "optval_a",
    })

    expect(filters.priceMinEur).toBe(20)
    expect(filters.priceMaxEur).toBe(80)
    expect(filters.inStock).toBe(true)
    expect(filters.sortBy).toBe("price_asc")
    expect(filters.page).toBe(3)
    expect(filters.optionValueIds).toEqual(["optval_a"])
  })

  it("falls back to safe defaults for missing params", () => {
    const filters = withParams({})

    expect(filters.priceMinEur).toBeUndefined()
    expect(filters.priceMaxEur).toBeUndefined()
    expect(filters.inStock).toBe(false)
    expect(filters.sortBy).toBe("created_at")
    expect(filters.page).toBe(1)
    expect(filters.optionValueIds).toEqual([])
  })

  it("drops invalid prices", () => {
    expect(withParams({ priceMin: "abc" }).priceMinEur).toBeUndefined()
    expect(withParams({ priceMin: "-5" }).priceMinEur).toBeUndefined()
    expect(withParams({ priceMax: "9999999" }).priceMaxEur).toBeUndefined()
    expect(withParams({ priceMin: "12.5" }).priceMinEur).toBeUndefined()
    expect(withParams({ priceMin: "" }).priceMinEur).toBeUndefined()
  })

  it("accepts the zero boundary", () => {
    expect(withParams({ priceMin: "0" }).priceMinEur).toBe(0)
  })

  it("ignores a reversed price range", () => {
    const filters = withParams({ priceMin: "80", priceMax: "20" })
    expect(filters.priceMinEur).toBeUndefined()
    expect(filters.priceMaxEur).toBeUndefined()
  })

  it("rejects unknown sort values and out-of-range pages", () => {
    expect(withParams({ sortBy: "cheapest" }).sortBy).toBe("created_at")
    expect(withParams({ page: "0" }).page).toBe(1)
    expect(withParams({ page: "-2" }).page).toBe(1)
    expect(withParams({ page: "abc" }).page).toBe(1)
    expect(withParams({ page: "5000" }).page).toBe(1)
  })

  it("drops empty and oversized option value ids", () => {
    const filters = parseListingFilters(
      new URLSearchParams({
        optionValueIds: "optval_a",
      })
    )
    expect(filters.optionValueIds).toEqual(["optval_a"])

    const objectForm = parseListingFilters({
      optionValueIds: ["", "optval_b", "x".repeat(200)],
    })
    expect(objectForm.optionValueIds).toEqual(["optval_b"])
  })
})

describe("filterProductsByListing", () => {
  const baseFilters = parseListingFilters(new URLSearchParams({}))

  it("keeps products with stock when filtering for availability", () => {
    const filters = { ...baseFilters, inStock: true }
    const inStock = product([{ inventory_quantity: 3 }])
    const soldOut = product([{ inventory_quantity: 0 }])
    const unlimited = product([{ manage_inventory: false }])

    expect(filterProductsByListing([inStock, soldOut, unlimited], filters)).toEqual([
      inStock,
      unlimited,
    ])
  })

  it("filters by price range at the boundaries", () => {
    const filters = { ...baseFilters, priceMinEur: 20, priceMaxEur: 30 }
    const atMin = product([{ calculated_price: { calculated_amount: 20 } }])
    const atMax = product([{ calculated_price: { calculated_amount: 30 } }])
    const above = product([{ calculated_price: { calculated_amount: 30.01 } }])
    const below = product([{ calculated_price: { calculated_amount: 19.99 } }])

    expect(
      filterProductsByListing([atMin, atMax, above, below], filters)
    ).toEqual([atMin, atMax])
  })

  it("excludes products without a price when a price filter is active", () => {
    const filters = { ...baseFilters, priceMinEur: 10 }
    const noPrice = product([{ inventory_quantity: 5 }])
    expect(filterProductsByListing([noPrice], filters)).toEqual([])
  })

  it("matches a product when any variant falls inside the range", () => {
    const filters = { ...baseFilters, priceMinEur: 50, priceMaxEur: 60 }
    const mixed = product([
      { calculated_price: { calculated_amount: 10 } },
      { calculated_price: { calculated_amount: 55 } },
    ])
    expect(filterProductsByListing([mixed], filters)).toEqual([mixed])
  })
})

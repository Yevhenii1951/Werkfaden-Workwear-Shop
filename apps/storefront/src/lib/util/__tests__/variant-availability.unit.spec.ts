import { HttpTypes } from "@medusajs/types"

import {
  findExactVariant,
  isOptionValueAvailable,
  isVariantInStock,
  variantMatchesOptions,
} from "../variant-availability"

const variant = (
  options: Record<string, string>,
  inventory?: {
    manage_inventory?: boolean
    allow_backorder?: boolean
    inventory_quantity?: number
  }
): HttpTypes.StoreProductVariant =>
  ({
    id: `var_${Math.random().toString(36).slice(2)}`,
    options: Object.entries(options).map(([optionId, value]) => ({
      id: `opt_${optionId}`,
      option_id: optionId,
      value,
    })),
    ...inventory,
  } as unknown as HttpTypes.StoreProductVariant)

describe("isVariantInStock", () => {
  it("rejects a managed, sold-out variant (reject path)", () => {
    const soldOut = variant({ Size: "M" }, { manage_inventory: true, inventory_quantity: 0 })
    expect(isVariantInStock(soldOut)).toBe(false)
  })

  it("accepts a managed variant with stock", () => {
    const inStock = variant({ Size: "M" }, { manage_inventory: true, inventory_quantity: 4 })
    expect(isVariantInStock(inStock)).toBe(true)
  })

  it("accepts a backorder variant even without stock", () => {
    const backorder = variant(
      { Size: "M" },
      { manage_inventory: true, allow_backorder: true, inventory_quantity: 0 }
    )
    expect(isVariantInStock(backorder)).toBe(true)
  })

  it("accepts an unmanaged variant", () => {
    const unmanaged = variant({ Size: "M" }, { manage_inventory: false })
    expect(isVariantInStock(unmanaged)).toBe(true)
  })

  it("accepts a variant with undefined inventory as available", () => {
    expect(isVariantInStock(variant({ Size: "M" }))).toBe(true)
  })
})

describe("findExactVariant", () => {
  const variants = [
    variant({ Size: "M", Color: "Navy" }),
    variant({ Size: "L", Color: "Navy" }),
  ]

  it("returns the variant when all options are selected", () => {
    const found = findExactVariant(variants, { Size: "M", Color: "Navy" })
    expect(found).toBe(variants[0])
  })

  it("returns undefined for a partial selection", () => {
    expect(findExactVariant(variants, { Size: "M" })).toBeUndefined()
  })

  it("returns undefined when the combination does not exist", () => {
    expect(
      findExactVariant(variants, { Size: "XL", Color: "Navy" })
    ).toBeUndefined()
  })
})

describe("variantMatchesOptions", () => {
  const mNavy = variant({ Size: "M", Color: "Navy" })

  it("matches on a subset of options", () => {
    expect(variantMatchesOptions(mNavy, { Size: "M" })).toBe(true)
  })

  it("rejects a differing value", () => {
    expect(variantMatchesOptions(mNavy, { Size: "L" })).toBe(false)
  })
})

describe("isOptionValueAvailable", () => {
  it("considers a value available when one in-stock variant matches", () => {
    const variants = [
      variant({ Size: "M", Color: "Navy" }, { manage_inventory: true, inventory_quantity: 3 }),
      variant({ Size: "L", Color: "Navy" }, { manage_inventory: true, inventory_quantity: 0 }),
    ]
    expect(
      isOptionValueAvailable(variants, { Color: "Navy" }, "Size", "M")
    ).toBe(true)
  })

  it("marks a value unavailable when only sold-out variants match", () => {
    const variants = [
      variant({ Size: "M", Color: "Red" }, { manage_inventory: true, inventory_quantity: 0 }),
    ]
    expect(
      isOptionValueAvailable(variants, { Color: "Red" }, "Size", "M")
    ).toBe(false)
  })

  it("ignores other unselected option values", () => {
    const variants = [
      variant({ Size: "S", Color: "Navy" }, { manage_inventory: true, inventory_quantity: 2 }),
    ]
    expect(
      isOptionValueAvailable(variants, { Color: "Navy" }, "Size", "S")
    ).toBe(true)
  })
})
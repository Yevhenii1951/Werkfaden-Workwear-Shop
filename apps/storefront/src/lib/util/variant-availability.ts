import type { HttpTypes } from "@medusajs/types"

type Variant = HttpTypes.StoreProductVariant
type SelectedOptions = Record<string, string | undefined>

const optionsKeyOf = (variant: Variant): Record<string, string> =>
  (variant.options ?? []).reduce<Record<string, string>>((acc, option) => {
    if (option.option_id) acc[option.option_id] = option.value
    return acc
  }, {})

const providedOptions = (options: SelectedOptions) =>
  Object.entries(options).filter(
    ([, value]) => value !== undefined
  )

export const isVariantInStock = (variant: Variant | undefined): boolean => {
  if (!variant) return false
  if (!variant.manage_inventory) return true
  if (variant.allow_backorder) return true
  return (variant.inventory_quantity ?? 0) > 0
}

export const variantMatchesOptions = (
  variant: Variant,
  options: SelectedOptions
): boolean => {
  const variantOptions = optionsKeyOf(variant)
  return providedOptions(options).every(
    ([id, value]) => variantOptions[id] === value
  )
}

export const findExactVariant = (
  variants: Variant[],
  options: SelectedOptions
): Variant | undefined =>
  variants.find((variant) => {
    const variantOptions = optionsKeyOf(variant)
    const provided = providedOptions(options)
    if (provided.length !== Object.keys(variantOptions).length) return false
    return provided.every(([id, value]) => variantOptions[id] === value)
  })

export const isOptionValueAvailable = (
  variants: Variant[],
  options: SelectedOptions,
  optionId: string,
  value: string
): boolean =>
  variants.some(
    (variant) =>
      isVariantInStock(variant) &&
      variantMatchesOptions(variant, { ...options, [optionId]: value })
  )
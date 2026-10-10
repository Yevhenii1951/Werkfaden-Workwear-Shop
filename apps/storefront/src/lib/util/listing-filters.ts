import { HttpTypes } from "@medusajs/types"
import { z } from "zod"

import type { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { OptionValueIds, parseOptionValueIds } from "./product-option-filters"

export const PRICE_MIN_QUERY_KEY = "priceMin"
export const PRICE_MAX_QUERY_KEY = "priceMax"
export const IN_STOCK_QUERY_KEY = "inStock"
export const SORT_QUERY_KEY = "sortBy"
export const PAGE_QUERY_KEY = "page"

export const MAX_OPTION_VALUES = 20
export const MAX_OPTION_VALUE_LENGTH = 120
export const MAX_PRICE_EUR = 100_000
export const MAX_PAGE = 1000

const SORT_OPTIONS = ["created_at", "price_asc", "price_desc"] as const

const priceEurSchema = z.coerce.number().int().min(0).max(MAX_PRICE_EUR)
const optionValueSchema = z.string().min(1).max(MAX_OPTION_VALUE_LENGTH)
const sortSchema = z.enum(SORT_OPTIONS)
const pageSchema = z.coerce.number().int().min(1).max(MAX_PAGE)

export type ListingFilters = {
  optionValueIds: OptionValueIds
  priceMinEur?: number
  priceMaxEur?: number
  inStock: boolean
  sortBy: SortOptions
  page: number
}

type RawParam = string | string[] | undefined
type SearchParamsLike = URLSearchParams | Record<string, RawParam>

const readRaw = (searchParams: SearchParamsLike, key: string): string | undefined => {
  if (typeof (searchParams as URLSearchParams).get === "function") {
    return (searchParams as URLSearchParams).get(key) ?? undefined
  }
  const value = (searchParams as Record<string, RawParam>)[key]
  return Array.isArray(value) ? value[0] : value
}

const parsePriceEur = (raw: string | undefined): number | undefined => {
  if (raw == null || raw === "") {
    return undefined
  }
  const parsed = priceEurSchema.safeParse(raw)
  return parsed.success ? parsed.data : undefined
}

export const parseListingFilters = (searchParams: SearchParamsLike): ListingFilters => {
  const optionValueIds = parseOptionValueIds(searchParams as Record<string, RawParam>)
    .filter((id) => optionValueSchema.safeParse(id).success)
    .slice(0, MAX_OPTION_VALUES)

  let priceMinEur = parsePriceEur(readRaw(searchParams, PRICE_MIN_QUERY_KEY))
  let priceMaxEur = parsePriceEur(readRaw(searchParams, PRICE_MAX_QUERY_KEY))
  if (priceMinEur != null && priceMaxEur != null && priceMinEur > priceMaxEur) {
    priceMinEur = undefined
    priceMaxEur = undefined
  }

  const inStock = readRaw(searchParams, IN_STOCK_QUERY_KEY) === "1"

  const sort = sortSchema.safeParse(readRaw(searchParams, SORT_QUERY_KEY))
  const page = pageSchema.safeParse(readRaw(searchParams, PAGE_QUERY_KEY))

  return {
    optionValueIds,
    priceMinEur,
    priceMaxEur,
    inStock,
    sortBy: sort.success ? sort.data : "created_at",
    page: page.success ? page.data : 1,
  }
}

type ListingVariant = HttpTypes.StoreProductVariant & {
  calculated_price?: { calculated_amount?: number | null } | null
  inventory_quantity?: number | null
  manage_inventory?: boolean | null
  allow_backorder?: boolean | null
}

const variantAmounts = (product: HttpTypes.StoreProduct): number[] =>
  (product.variants ?? [])
    .map((variant) => (variant as ListingVariant).calculated_price?.calculated_amount)
    .filter((amount): amount is number => typeof amount === "number")

const isVariantAvailable = (variant: HttpTypes.StoreProductVariant): boolean => {
  const listingVariant = variant as ListingVariant
  if (listingVariant.manage_inventory === false) {
    return true
  }
  if (listingVariant.allow_backorder === true) {
    return true
  }
  return (listingVariant.inventory_quantity ?? 0) > 0
}

export const productMatchesFilters = (
  product: HttpTypes.StoreProduct,
  filters: ListingFilters
): boolean => {
  if (filters.inStock && !(product.variants ?? []).some(isVariantAvailable)) {
    return false
  }

  if (filters.priceMinEur == null && filters.priceMaxEur == null) {
    return true
  }

  const amounts = variantAmounts(product)
  if (!amounts.length) {
    return false
  }

  const minBound = filters.priceMinEur != null ? filters.priceMinEur : -Infinity
  const maxBound = filters.priceMaxEur != null ? filters.priceMaxEur : Infinity

  return Math.min(...amounts) <= maxBound && Math.max(...amounts) >= minBound
}

export const filterProductsByListing = (
  products: HttpTypes.StoreProduct[],
  filters: ListingFilters
): HttpTypes.StoreProduct[] => products.filter((product) => productMatchesFilters(product, filters))

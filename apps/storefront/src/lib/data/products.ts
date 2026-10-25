"use server"

import { sdk } from "@lib/config"
import {
  filterProductsByListing,
  ListingFilters,
} from "@lib/util/listing-filters"
import { OptionValueIds } from "@lib/util/product-option-filters"
import { sortProducts } from "@lib/util/sort-products"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"

type ProductListQueryParams = (HttpTypes.FindParams &
  HttpTypes.StoreProductListParams) & {
  options?: string[]
  option_value_id?: string | string[]
}

/** One page of the store API; the listing walks pages until the catalog ends. */
const LISTING_PAGE_SIZE = 100

/**
 * A hard stop so a broken `count` cannot turn the listing into an endless loop.
 * Above this size the catalog needs server-side filtering, not a bigger loop.
 */
const MAX_LISTING_PRODUCTS = 5_000

export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
}: {
  pageParam?: number
  queryParams?: ProductListQueryParams
  countryCode?: string
  regionId?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: ProductListQueryParams
}> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = _pageParam === 1 ? 0 : (_pageParam - 1) * limit

  let region: HttpTypes.StoreRegion | undefined | null

  if (countryCode) {
    region = await getRegion(countryCode)
  } else {
    region = await retrieveRegion(regionId!)
  }

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("products")),
  }

  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
      `/store/products`,
      {
        method: "GET",
        query: {
          limit,
          offset,
          region_id: region?.id,
          fields:
            "*options,*variants.calculated_price,+variants.inventory_quantity,*variants.images,*variants.options,+metadata,+tags,",
          ...queryParams,
        },
        headers,
        next,
        cache: "force-cache",
      }
    )
    .then(({ products, count }) => {
      const nextPage = count > offset + limit ? pageParam + 1 : null

      return {
        response: {
          products,
          count,
        },
        nextPage: nextPage,
        queryParams,
      }
    })
}

/**
 * The store API only offers offset/limit; price, availability and option
 * filters run after the fetch, so the listing needs the whole catalog and not
 * the first page. Every request goes through the Next data cache with the
 * `products` tag, so this walk happens once per revalidation, not per visitor.
 */
const listAllProducts = async ({
  queryParams,
  countryCode,
}: {
  queryParams?: ProductListQueryParams
  countryCode: string
}): Promise<HttpTypes.StoreProduct[]> => {
  const products: HttpTypes.StoreProduct[] = []

  for (let pageParam = 1; ; pageParam++) {
    const { response, nextPage } = await listProducts({
      pageParam,
      queryParams: { ...queryParams, limit: LISTING_PAGE_SIZE },
      countryCode,
    })

    products.push(...response.products)

    if (!nextPage) {
      return products
    }

    if (products.length >= MAX_LISTING_PRODUCTS) {
      throw new Error(
        `The catalog listing is capped at ${MAX_LISTING_PRODUCTS} products. A larger catalog needs server-side filtering instead of this walk.`
      )
    }
  }
}

/**
 * Fetches the whole catalog, then filters, sorts and paginates in memory so the
 * active filters decide the page count. The returned `count` is the filtered
 * count, not the backend total.
 */
export const listProductsWithSort = async ({
  page = 0,
  queryParams,
  sortBy = "created_at",
  countryCode,
  optionValueIds,
  filters,
}: {
  page?: number
  queryParams?: ProductListQueryParams
  sortBy?: SortOptions
  countryCode: string
  optionValueIds?: OptionValueIds
  filters?: ListingFilters
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: ProductListQueryParams
}> => {
  const limit = queryParams?.limit || 12
  const optionFilters = Array.from(
    new Set((optionValueIds || []).filter(Boolean))
  )

  const products = await listAllProducts({
    queryParams: {
      ...queryParams,
      ...(optionFilters.length ? { option_value_id: optionFilters } : {}),
    },
    countryCode,
  })

  const listingProducts = filters
    ? filterProductsByListing(products, filters)
    : products
  const sortedProducts = sortProducts(listingProducts, sortBy)

  const pageParam = (page - 1) * limit

  const filteredCount = listingProducts.length

  const nextPage = filteredCount > pageParam + limit ? page + 1 : null

  const paginatedProducts = sortedProducts.slice(pageParam, pageParam + limit)

  return {
    response: {
      products: paginatedProducts,
      count: filteredCount,
    },
    nextPage,
    queryParams,
  }
}

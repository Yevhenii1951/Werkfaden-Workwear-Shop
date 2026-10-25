const fetchMock = jest.fn()
const getRegionMock = jest.fn()

// `lib/data/*` marks itself server-only; the guard is a bundler hint, not a
// runtime dependency, so a unit test can neutralise it.
jest.mock("server-only", () => ({}))

jest.mock("@lib/config", () => ({
  sdk: { client: { fetch: (...args: unknown[]) => fetchMock(...args) } },
}))

jest.mock("../regions", () => ({
  getRegion: (...args: unknown[]) => getRegionMock(...args),
  retrieveRegion: jest.fn(),
}))

// eslint-disable-next-line import/first
import { listProductsWithSort } from "../products"

const REGION = { id: "reg_test", currency_code: "eur", countries: [] }

type FakeProduct = {
  id: string
  created_at: string
  variants: { calculated_price: { calculated_amount: number } }[]
}

const catalog = (size: number): FakeProduct[] =>
  Array.from({ length: size }, (_, index) => ({
    id: `prod_${String(index).padStart(3, "0")}`,
    created_at: new Date(2026, 0, 1 + index).toISOString(),
    variants: [{ calculated_price: { calculated_amount: 10 + index } }],
  }))

/**
 * Answers /store/products the way the store API does: it honours offset and
 * limit and reports the true total in `count`.
 */
const serveCatalog = (products: FakeProduct[]) => {
  fetchMock.mockImplementation(
    (_url: string, options: { query: { offset: number; limit: number } }) => {
      const { offset = 0, limit = 20 } = options.query
      return Promise.resolve({
        products: products.slice(offset, offset + limit),
        count: products.length,
      })
    }
  )
}

describe("listProductsWithSort", () => {
  beforeEach(() => {
    fetchMock.mockReset()
    getRegionMock.mockReset()
    getRegionMock.mockResolvedValue(REGION)
  })

  it("walks every page of the catalog instead of stopping at the first hundred", async () => {
    serveCatalog(catalog(130))

    const seen = new Set<string>()
    for (let page = 1; page <= 11; page++) {
      const { response } = await listProductsWithSort({ page, countryCode: "de" })
      expect(response.count).toBe(130)
      response.products.forEach((product) => seen.add(product.id))
    }

    // With the old first-page-of-100 fetch the last 30 products were unreachable.
    expect(seen.size).toBe(130)
    expect(seen.has("prod_129")).toBe(true)
  })

  it("counts the filtered catalog, not the backend total", async () => {
    serveCatalog(catalog(130))

    const filtered = await listProductsWithSort({
      page: 1,
      countryCode: "de",
      filters: {
        optionValueIds: [],
        priceMinEur: 130,
        priceMaxEur: 139,
        inStock: false,
        sortBy: "created_at",
        page: 1,
      },
    })

    expect(filtered.response.count).toBe(10)
    expect(filtered.response.products).toHaveLength(10)
  })

  it("stops after one request when the catalog fits into a page", async () => {
    serveCatalog(catalog(25))

    const result = await listProductsWithSort({ page: 1, countryCode: "de" })

    expect(result.response.count).toBe(25)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0][1].query.limit).toBe(100)
  })
})

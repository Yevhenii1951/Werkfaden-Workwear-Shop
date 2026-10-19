import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { Modules } from "@medusajs/framework/utils"
import { seedCheckout } from "../helpers/seed-checkout"

jest.setTimeout(120 * 1000)

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    beforeAll(async () => {
      const search = getContainer().resolve(Modules.SEARCH)
      const deadline = Date.now() + 30_000

      while (Date.now() < deadline) {
        const productIndex = (await search.listIndexes()).find(
          (index) => index.name === "product"
        )

        if (productIndex?.status === "ready") {
          return
        }

        if (productIndex?.status === "error") {
          throw new Error("Product search index failed during startup seeding.")
        }

        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      throw new Error("Timed out waiting for the product search index to be ready.")
    })

    const ingestProduct = async (productId: string) => {
      const search = getContainer().resolve(Modules.SEARCH)
      await search.ingest({
        name: "product.created",
        data: [{ id: productId }],
      } as never)
    }

    const searchByTitle = async (
      headers: { headers: Record<string, string> },
      q: string
    ) => {
      return api.post(
        "/store/search",
        {
          entity: "product",
          filters: { q },
          pagination: { take: 20 },
        },
        { ...headers, validateStatus: () => true }
      )
    }

    it("returns an ingested product as a hit for an anonymous title search", async () => {
      const checkout = await seedCheckout({ container: getContainer(), api })
      await ingestProduct(checkout.productId)

      const { data, status } = await searchByTitle(checkout.storeHeaders, "Test Product")

      expect(status).toBe(200)
      const hits = data.results[0].hits
      expect(hits.length).toBeGreaterThan(0)
      expect(hits[0].document.id).toBe(checkout.productId)
      expect(hits[0].document.title).toBe("Test Product")
    })

    it("does not surface the product for an unrelated query", async () => {
      const checkout = await seedCheckout({ container: getContainer(), api })
      await ingestProduct(checkout.productId)

      const { data } = await searchByTitle(checkout.storeHeaders, "Vollkornbrot")
      expect(data.results[0].hits).toHaveLength(0)
    })

    it("answers a not-found for an index that is not exposed", async () => {
      const checkout = await seedCheckout({ container: getContainer(), api })

      const { status, data } = await api.post(
        "/store/search",
        { entity: "customer", pagination: { take: 5 } },
        { ...checkout.storeHeaders, validateStatus: () => true }
      )

      expect(status).toBe(404)
      expect(data.type).toBe("not_found")
    })

    it("rejects a request without a publishable key", async () => {
      const { status, data } = await api.post(
        "/store/search",
        {
          entity: "product",
          filters: { q: "Test" },
        },
        { validateStatus: () => true }
      )

      expect(status).toBe(400)
      expect(data.message).toMatch(/publishable/i)
    })

    it("rejects a malformed body", async () => {
      const checkout = await seedCheckout({ container: getContainer(), api })

      const { status } = await api.post(
        "/store/search",
        { pagination: { take: 5 } },
        { ...checkout.storeHeaders, validateStatus: () => true }
      )

      expect(status).toBe(400)
    })
  },
})

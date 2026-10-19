import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { seedCheckout } from "../helpers/seed-checkout"

const INTEGRATION_TEST_TIMEOUT_MS = 120_000

jest.setTimeout(INTEGRATION_TEST_TIMEOUT_MS)

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    it("returns a server-derived estimate for a valid configuration", async () => {
      const { storeHeaders } = await seedCheckout({ container: getContainer(), api })

      const response = await api.post(
        "/store/embroidery/estimate",
        {
          position: "chest",
          garment: "jacket",
          stitch_count: 6000,
          quantity: 25,
        },
        storeHeaders
      )

      expect(response.status).toBe(200)
      const estimate = response.data.estimate
      // 3.60 base * 1.25 garment * 0.90 quantity = 4.05; total = 4.05 * 25
      expect(estimate.unit_surcharge).toBe(4.05)
      expect(estimate.total).toBe(101.25)
      expect(estimate.currency_code).toBe("eur")
      expect(estimate.stitch_band).toBe("4.001–8.000 Stiche")
      expect(estimate.quantity_band).toBe("10–49 Stück")
      expect(estimate.quantity_factor).toBe(0.9)
    })

    it("is deterministic and rejects any client-supplied price", async () => {
      const { storeHeaders } = await seedCheckout({ container: getContainer(), api })

      const body = {
        position: "back",
        garment: "tshirt",
        stitch_count: 3000,
        quantity: 5,
      }

      const first = await api.post("/store/embroidery/estimate", body, storeHeaders)
      const second = await api.post("/store/embroidery/estimate", body, storeHeaders)

      expect(first.data.estimate.unit_surcharge).toBe(4.2)
      expect(first.data.estimate.total).toBe(21)
      expect(second.data.estimate).toEqual(first.data.estimate)

      // The request schema is strict; a client cannot smuggle a price or currency.
      const forged = await api.post(
        "/store/embroidery/estimate",
        { ...body, unit_surcharge: 0.01, total: 0.05, currency_code: "usd" },
        { ...storeHeaders, validateStatus: () => true }
      )
      expect(forged.status).toBe(400)
    })

    it("rejects malformed or out-of-range input", async () => {
      const { storeHeaders } = await seedCheckout({ container: getContainer(), api })
      const rejects = { ...storeHeaders, validateStatus: () => true }

      const unknownPosition = await api.post(
        "/store/embroidery/estimate",
        { position: "kragen", garment: "polo", stitch_count: 5000, quantity: 10 },
        rejects
      )
      expect(unknownPosition.status).toBe(400)

      const unknownGarment = await api.post(
        "/store/embroidery/estimate",
        { position: "chest", garment: "mantel", stitch_count: 5000, quantity: 10 },
        rejects
      )
      expect(unknownGarment.status).toBe(400)

      const zeroStitches = await api.post(
        "/store/embroidery/estimate",
        { position: "chest", garment: "polo", stitch_count: 0, quantity: 10 },
        rejects
      )
      expect(zeroStitches.status).toBe(400)

      const tooManyStitches = await api.post(
        "/store/embroidery/estimate",
        { position: "chest", garment: "polo", stitch_count: 20001, quantity: 10 },
        rejects
      )
      expect(tooManyStitches.status).toBe(400)

      const fractionalQuantity = await api.post(
        "/store/embroidery/estimate",
        { position: "chest", garment: "polo", stitch_count: 5000, quantity: 1.5 },
        rejects
      )
      expect(fractionalQuantity.status).toBe(400)

      const missingQuantity = await api.post(
        "/store/embroidery/estimate",
        { position: "chest", garment: "polo", stitch_count: 5000 },
        rejects
      )
      expect(missingQuantity.status).toBe(400)
    })
  },
})

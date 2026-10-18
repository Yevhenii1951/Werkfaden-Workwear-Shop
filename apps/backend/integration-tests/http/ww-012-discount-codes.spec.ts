import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { createPromotionsWorkflow } from "@medusajs/medusa/core-flows"
import { randomUUID } from "crypto"
import { seedCheckout } from "../helpers/seed-checkout"

jest.setTimeout(120 * 1000)

const codePrefix = `WW12-${randomUUID().slice(0, 8).toUpperCase()}`

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    const createPromotion = async (
      code: string,
      applicationMethod: {
        type: "fixed" | "percentage"
        value: number
        currency_code: string
      },
      options: {
        limit?: number
        endsAt?: Date
        regionId?: string
      } = {}
    ) => {
      await createPromotionsWorkflow(getContainer()).run({
        input: {
          promotionsData: [
            {
              code,
              type: "standard",
              status: "active",
              limit: options.limit,
              application_method: {
                ...applicationMethod,
                target_type: "items",
                allocation: "across",
              },
              rules: options.regionId
                ? [
                    {
                      attribute: "region.id",
                      operator: "eq",
                      values: [options.regionId],
                    },
                  ]
                : undefined,
              campaign: options.endsAt
                ? {
                    name: `${code} campaign`,
                    campaign_identifier: code,
                    ends_at: options.endsAt,
                  }
                : undefined,
            },
          ],
        },
      })
    }

    const totals = (cart: Record<string, unknown>) => ({
      total: cart.total as number,
      discountTotal: (cart.discount_total as number | undefined) ?? 0,
    })

    const expectCodeNotApplied = (
      response: { data: { cart?: Record<string, unknown> } },
      code: string,
      initial: { total: number; discountTotal: number }
    ) => {
      const cart = response.data.cart
      expect(cart).toBeDefined()
      expect(totals(cart!)).toEqual(initial)
      expect(cart?.promotions ?? []).not.toEqual(
        expect.arrayContaining([expect.objectContaining({ code })])
      )
    }

    it("applies a percentage code server-side and restores totals when removed", async () => {
      const code = `${codePrefix}-PERCENT`
      await createPromotion(code, {
        type: "percentage",
        value: 10,
        currency_code: "eur",
      })
      const checkout = await seedCheckout({ container: getContainer(), api })
      const initial = totals(
        (await api.get(`/store/carts/${checkout.cart.id}`, checkout.storeHeaders)).data.cart
      )

      const applied = await api.post(
        `/store/carts/${checkout.cart.id}/promotions`,
        { promo_codes: [code] },
        checkout.storeHeaders
      )

      expect(applied.data.cart.promotions).toEqual(
        expect.arrayContaining([expect.objectContaining({ code })])
      )
      expect(applied.data.cart.discount_total).toBeGreaterThan(0)
      expect(applied.data.cart.total).toBeLessThan(initial.total)

      const removed = await api.delete(
        `/store/carts/${checkout.cart.id}/promotions`,
        { ...checkout.storeHeaders, data: { promo_codes: [code] } }
      )

      expect(totals(removed.data.cart)).toEqual(initial)
    })

    it("applies a fixed EUR code using the server-calculated discount", async () => {
      const code = `${codePrefix}-FIXED`
      await createPromotion(code, {
        type: "fixed",
        value: 5,
        currency_code: "eur",
      })
      const checkout = await seedCheckout({ container: getContainer(), api })

      const applied = await api.post(
        `/store/carts/${checkout.cart.id}/promotions`,
        { promo_codes: [code] },
        checkout.storeHeaders
      )

      expect(applied.data.cart.discount_total).toBeGreaterThan(0)
      expect(applied.data.cart.total).toBeLessThan(applied.data.cart.original_total)
    })

    it("rejects an unknown code without changing cart totals", async () => {
      const checkout = await seedCheckout({ container: getContainer(), api })
      const initial = totals(
        (await api.get(`/store/carts/${checkout.cart.id}`, checkout.storeHeaders)).data.cart
      )

      const response = await api.post(
        `/store/carts/${checkout.cart.id}/promotions`,
        { promo_codes: [`${codePrefix}-UNKNOWN`] },
        { ...checkout.storeHeaders, validateStatus: () => true }
      )

      expect(response.status).toBeGreaterThanOrEqual(400)
      if (response.data.cart) {
        expect(totals(response.data.cart)).toEqual(initial)
      }
    })

    it("rejects an expired code", async () => {
      const code = `${codePrefix}-EXPIRED`
      await createPromotion(
        code,
        { type: "percentage", value: 10, currency_code: "eur" },
        { endsAt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      )
      const checkout = await seedCheckout({ container: getContainer(), api })
      const initial = totals(
        (await api.get(`/store/carts/${checkout.cart.id}`, checkout.storeHeaders)).data.cart
      )

      const response = await api.post(
        `/store/carts/${checkout.cart.id}/promotions`,
        { promo_codes: [code] },
        { ...checkout.storeHeaders, validateStatus: () => true }
      )

      expectCodeNotApplied(response, code, initial)
    })

    it("rejects a promotion after its usage limit is reached", async () => {
      const code = `${codePrefix}-LIMIT`
      await createPromotion(
        code,
        { type: "percentage", value: 10, currency_code: "eur" },
        { limit: 0 }
      )
      const checkout = await seedCheckout({ container: getContainer(), api })
      const initial = totals(
        (await api.get(`/store/carts/${checkout.cart.id}`, checkout.storeHeaders)).data.cart
      )

      const response = await api.post(
        `/store/carts/${checkout.cart.id}/promotions`,
        { promo_codes: [code] },
        { ...checkout.storeHeaders, validateStatus: () => true }
      )

      expectCodeNotApplied(response, code, initial)
    })

    it("rejects a code restricted to another region", async () => {
      const code = `${codePrefix}-REGION`
      await createPromotion(
        code,
        { type: "percentage", value: 10, currency_code: "eur" },
        { regionId: "reg_not_the_cart_region" }
      )
      const checkout = await seedCheckout({ container: getContainer(), api })
      const initial = totals(
        (await api.get(`/store/carts/${checkout.cart.id}`, checkout.storeHeaders)).data.cart
      )

      const response = await api.post(
        `/store/carts/${checkout.cart.id}/promotions`,
        { promo_codes: [code] },
        { ...checkout.storeHeaders, validateStatus: () => true }
      )

      expectCodeNotApplied(response, code, initial)
    })
  },
})

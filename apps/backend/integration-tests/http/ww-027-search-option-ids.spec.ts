import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type { RemoteQueryFunction } from "@medusajs/framework/types"

import { resolveProductIds } from "../../src/search/helpers/resolve-product-ids"
import { seedCheckout } from "../helpers/seed-checkout"

jest.setTimeout(120 * 1000)

// The product index listens to option events, so an option edit has to lead
// back to the products that use it. Options are linked to products through
// link tables, not through a `product_id` column.
medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    const query = () => getContainer().resolve(ContainerRegistrationKeys.QUERY)

    const productIdsFor = (name: string, id: string) =>
      resolveProductIds(
        { name, data: { id } },
        { container: { query: query() as RemoteQueryFunction } } as never
      )

    const optionIdsOf = async (productId: string) => {
      const { data } = await query().graph({
        entity: "product",
        fields: ["id", "options.id", "options.values.id"],
        filters: { id: [productId] },
      })
      const product = data[0] as {
        options: { id: string; values: { id: string }[] }[]
      }
      return { optionId: product.options[0].id, valueId: product.options[0].values[0].id }
    }

    it("maps an option event to the products that use the option", async () => {
      const seed = await seedCheckout({ container: getContainer(), api })
      const { optionId } = await optionIdsOf(seed.productId)

      await expect(productIdsFor("product-option.created", optionId)).resolves.toEqual([seed.productId])
    })

    it("maps an option value event to the products that use the option", async () => {
      const seed = await seedCheckout({ container: getContainer(), api })
      const { valueId } = await optionIdsOf(seed.productId)

      await expect(productIdsFor("product-option-value.created", valueId)).resolves.toEqual([seed.productId])
    })

    it("passes a product event through unchanged", async () => {
      const seed = await seedCheckout({ container: getContainer(), api })

      await expect(productIdsFor("product.created", seed.productId)).resolves.toEqual([seed.productId])
    })
  },
})

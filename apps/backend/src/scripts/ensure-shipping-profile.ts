import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createShippingProfilesWorkflow } from "@medusajs/medusa/core-flows"

export default async function ensureShipping({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({ entity: "shipping_profile", fields: ["id"] })
  if (data.length) return
  await createShippingProfilesWorkflow(container).run({
    input: { data: [{ name: "Werkfaden Default", type: "default" }] },
  })
}

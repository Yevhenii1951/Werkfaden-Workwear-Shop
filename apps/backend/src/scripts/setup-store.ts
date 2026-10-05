import { writeFileSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import type { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import {
  createApiKeysWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingProfilesWorkflow,
  createStoresWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
} from "@medusajs/medusa/core-flows"

export default async function setupStore({ container }: { container: MedusaContainer }): Promise<void> {
  const databaseUrl = new URL(process.env.DATABASE_URL ?? "")
  if (databaseUrl.hostname !== "127.0.0.1" || databaseUrl.pathname !== "/werkfaden_dev") {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Store bootstrap is restricted to the isolated local werkfaden_dev database")
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const { data: existingChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id"],
    filters: { name: "Werkfaden Demo" },
  })
  if (existingChannels.length) {
    logger.warn("Werkfaden channel already exists. Skipping store bootstrap.")
    return
  }

  const { result: [channel] } = await createSalesChannelsWorkflow(container).run({
    input: { salesChannelsData: [{ name: "Werkfaden Demo", description: "Portfolio sandbox" }] },
  })
  const { result: [key] } = await createApiKeysWorkflow(container).run({
    input: { api_keys: [{ title: "Werkfaden storefront", type: "publishable", created_by: "" }] },
  })
  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: { id: key.id, add: [channel.id] },
  })
  await createStoresWorkflow(container).run({
    input: {
      stores: [{
        name: "Werkfaden Demo",
        supported_currencies: [{ currency_code: "eur", is_default: true }],
        default_sales_channel_id: channel.id,
      }],
    },
  })
  await createRegionsWorkflow(container).run({
    input: {
      regions: [{
        name: "Deutschland (Demo)", currency_code: "eur", countries: ["de"],
        payment_providers: ["pp_system_default"],
      }],
    },
  })
  await createShippingProfilesWorkflow(container).run({
    input: { shipping_profiles: [{ name: "Werkfaden Default", type: "default" }] },
  })

  const envPath = resolve(process.cwd(), "../storefront/.env.local")
  try {
    const envContent = readFileSync(envPath, "utf8")
    if (!/^NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=.*$/m.test(envContent)) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Store created, but storefront env requires manual publishable-key configuration")
    }
    writeFileSync(envPath, envContent.replace(
      /^NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=.*$/m,
      `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${key.token}`,
    ), { mode: 0o600 })
  } catch (e) {
    logger.warn("Storefront env.local not found or not writable; publishable key not written to file")
  }
  logger.info("Local German EUR store configured; storefront key saved privately. Catalog, shipping, tax and Stripe remain pending.")
}

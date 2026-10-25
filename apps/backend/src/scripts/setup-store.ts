import { writeFileSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import type { MedusaContainer } from "@medusajs/framework"
import type { Logger } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  createApiKeysWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingProfilesWorkflow,
  createStoresWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
} from "@medusajs/medusa/core-flows"

import { assertIsolatedLocalDb } from "./lib/isolated-db"

export default async function setupStore({ container }: { container: MedusaContainer }): Promise<void> {
  assertIsolatedLocalDb("Store bootstrap")

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
    input: { data: [{ name: "Werkfaden Default", type: "default" }] },
  })

  if (process.env.SETUP_WRITE_STOREFRONT_KEY === "false") {
    logger.info(`Storefront key not written (SETUP_WRITE_STOREFRONT_KEY=false); set NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${key.token} manually.`)
  } else {
    writePublishableKey(key.token, logger)
  }
  logger.info("Local German EUR store configured. Catalog, shipping, tax and Stripe remain pending.")
}

// A rehearsal database creates its own key; writing it here would break a
// storefront that is already pointed at the dev database.
function writePublishableKey(token: string, logger: Logger): void {
  const envPath = resolve(process.cwd(), "../storefront/.env.local")
  const keyLine = /^NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=.*$/m

  try {
    const envContent = readFileSync(envPath, "utf8")
    if (!keyLine.test(envContent)) {
      logger.warn(`${envPath} has no NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY line; set it to ${token} manually.`)
      return
    }
    writeFileSync(envPath, envContent.replace(keyLine, `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${token}`), { mode: 0o600 })
  } catch {
    logger.warn("Storefront env.local not found or not writable; publishable key not written to file")
  }
}

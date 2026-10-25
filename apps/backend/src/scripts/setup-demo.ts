/**
 * One command for a complete local demo: store, catalog, stock, checkout and
 * promotions, in the order each step needs the previous one.
 *
 *   npm run setup:demo
 *
 * Every step is idempotent and each one re-checks the database target, so the
 * chain can be re-run on an existing demo database without duplicating data.
 */
import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import seedWerkfadenCatalog from "./seed-werkfaden-catalog"
import prepareSearch from "./prepare-search"
import setupCheckout from "./setup-checkout"
import setupInventory from "./setup-inventory"
import setupPromotions from "./setup-promotions"
import setupStore from "./setup-store"

const STEPS: [string, (args: ExecArgs) => Promise<void>][] = [
  ["store", setupStore],
  ["search", prepareSearch],
  ["catalog", seedWerkfadenCatalog],
  ["inventory", setupInventory],
  ["checkout", setupCheckout],
  ["promotions", setupPromotions],
]

export default async function setupDemo(args: ExecArgs): Promise<void> {
  const logger = args.container.resolve(ContainerRegistrationKeys.LOGGER)

  for (const [name, step] of STEPS) {
    logger.info(`Demo setup: ${name}`)
    await step(args)
  }

  logger.info("Demo setup finished. Storefront: npm run storefront:dev")
}

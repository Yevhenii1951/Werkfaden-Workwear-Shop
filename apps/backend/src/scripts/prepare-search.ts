/**
 * A freshly migrated database has search-index records but no filled, active
 * version, and the index is only filled when the application boots. Products
 * created before that first boot cannot be indexed, so every create during a
 * scripted setup logs an indexing error.
 *
 * This step fills the indexes first, which makes `npm run setup:demo` work on a
 * database nobody has served yet, without red errors in the log.
 */
import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

import { assertIsolatedLocalDb } from "./lib/isolated-db"

export default async function prepareSearch({ container }: ExecArgs): Promise<void> {
  assertIsolatedLocalDb("Search index preparation")

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const search = container.resolve(Modules.SEARCH)

  const indexes = await search.listIndexes()
  const pending = indexes.filter((index) => index.status !== "ready")

  if (pending.length === 0) {
    logger.info("Search indexes are ready; nothing to fill.")
    return
  }

  const names = pending.map((index) => index.name)
  const { job_id } = await search.reindex({ index: names })
  logger.info(`Filled search indexes ${names.join(", ")} (job ${job_id}).`)
}

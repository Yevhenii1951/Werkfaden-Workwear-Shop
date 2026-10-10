import * as fs from "fs"
import * as path from "path"
import type { ExecArgs } from "@medusajs/framework/types"
import {
  createInventoryLevelsWorkflow,
  createStockLocationsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"

const LOCATION_NAME = "Werkfaden Lager"

function assertIsolatedDb() {
  const dbUrl = process.env.DATABASE_URL ?? ""
  try {
    const url = new URL(dbUrl)
    if (url.hostname !== "127.0.0.1" || url.pathname !== "/werkfaden_dev") {
      throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Refusing to seed outside isolated werkfaden_dev")
    }
  } catch (e) {
    if (e instanceof MedusaError) throw e
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Invalid DATABASE_URL")
  }
}

function readStockBySku(): Map<string, number> {
  const contentDir = path.resolve(process.cwd(), "..", "..", "docs", "content")
  const products = JSON.parse(fs.readFileSync(path.join(contentDir, "products.json"), "utf8"))
  const stock = new Map<string, number>()
  for (const product of products) {
    for (const variant of product.variants) {
      stock.set(String(variant.sku), Number(variant.stock_quantity) || 0)
    }
  }
  return stock
}

export default async function setupInventory({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  assertIsolatedDb()

  const stockBySku = readStockBySku()

  const { data: channels } = await query.graph({ entity: "sales_channel", fields: ["id", "name"] })
  const salesChannel = channels.find((c: any) => c.name === "Werkfaden Demo") || channels[0]
  if (!salesChannel) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Missing sales channel; run setup-store first")

  const { data: locations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name", "sales_channels.id"],
  })
  type LocationLike = { id: string; name: string; sales_channels?: { id: string }[] | null }
  let location: LocationLike | undefined =
    (locations.find((l: any) => l.name === LOCATION_NAME) as LocationLike | undefined) ??
    (locations[0] as LocationLike | undefined)

  if (!location) {
    const { result } = await createStockLocationsWorkflow(container).run({
      input: { locations: [{ name: LOCATION_NAME }] },
    })
    location = { id: result[0].id, name: result[0].name, sales_channels: [] }
    logger.info(`Created stock location "${LOCATION_NAME}"`)
  }

  const linkedChannelIds = (location.sales_channels ?? []).map((c: any) => c.id)
  if (!linkedChannelIds.includes(salesChannel.id)) {
    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: { id: location.id, add: [salesChannel.id] },
    })
    logger.info(`Linked sales channel "${salesChannel.name}" to "${LOCATION_NAME}"`)
  }

  const { data: items } = await query.graph({ entity: "inventory_item", fields: ["id", "sku"] })
  const { data: levels } = await query.graph({
    entity: "inventory_level",
    fields: ["inventory_item_id"],
    filters: { location_id: location.id },
  })
  const leveledItemIds = new Set(levels.map((level: any) => level.inventory_item_id))

  const toCreate = items
    .filter((item: any) => !leveledItemIds.has(item.id))
    .map((item: any) => ({
      inventory_item_id: item.id as string,
      location_id: location.id as string,
      stocked_quantity: stockBySku.get(item.sku) ?? 0,
    }))

  for (let i = 0; i < toCreate.length; i += 50) {
    await createInventoryLevelsWorkflow(container).run({
      input: { inventory_levels: toCreate.slice(i, i + 50) },
    })
  }

  logger.info(`Created ${toCreate.length} inventory level(s) at "${LOCATION_NAME}"`)
  logger.info("Inventory setup complete")
}

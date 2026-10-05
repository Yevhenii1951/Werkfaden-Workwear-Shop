import * as fs from "fs"
import * as path from "path"
import type { ExecArgs } from "@medusajs/framework/types"
import {
  createCollectionsWorkflow,
  createProductOptionsWorkflow,
  createProductsWorkflow,
} from "@medusajs/medusa/core-flows"
import {
  ContainerRegistrationKeys,
  MedusaError,
  ProductStatus,
} from "@medusajs/framework/utils"

export default async function seedWerkfadenCatalog({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const dbUrl = process.env.DATABASE_URL ?? ""
  try {
    const u = new URL(dbUrl)
    if (u.hostname !== "127.0.0.1" || u.pathname !== "/werkfaden_dev") {
      throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Refusing to seed outside isolated werkfaden_dev")
    }
  } catch (e) {
    if (e instanceof MedusaError) throw e
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Invalid DATABASE_URL")
  }

  const contentDir = path.resolve(process.cwd(), "..", "..", "docs", "content")
  const products = JSON.parse(fs.readFileSync(path.join(contentDir, "products.json"), "utf8"))
  const categories = JSON.parse(fs.readFileSync(path.join(contentDir, "categories.json"), "utf8"))

  const { data: salesChannels } = await query.graph({ entity: "sales_channel", fields: ["id", "name"] })
  const { data: shippingProfiles } = await query.graph({ entity: "shipping_profile", fields: ["id"] })
  const { data: stores } = await query.graph({ entity: "store", fields: ["id", "supported_currencies.currency_code"] })

  const salesChannel = salesChannels.find((s: any) => s.name === "Werkfaden Demo") || salesChannels[0]
  const shippingProfile = shippingProfiles[0]
  if (!salesChannel || !shippingProfile) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Missing channel/profile")

  const currencyCodes = (stores[0]?.supported_currencies ?? [])
    .map((c: any) => c?.currency_code)
    .filter((c: any): c is string => Boolean(c))
  if (!currencyCodes.length) throw new MedusaError(MedusaError.Types.NOT_FOUND, "No currencies")

  const { data: allCat } = await query.graph({ entity: "product_category", fields: ["id", "handle", "name"] })
  const catMap = new Map(allCat.map((c: any) => [(c.handle || "").toLowerCase(), c.id]))

  const { data: existingCols } = await query.graph({ entity: "product_collection", fields: ["id", "title"] })
  const colTitles = Array.from(new Set(products.map((p: any) => String(p.category_id))))
  const missingCols = colTitles.filter((t) => !existingCols.some((ec: any) => ec.title === t))
  if (missingCols.length) {
    await createCollectionsWorkflow(container).run({ input: { collections: missingCols.map((t) => ({ title: t })) } })
  }
  const { data: allCols } = await query.graph({ entity: "product_collection", fields: ["id", "title"] })
  const colMap = new Map(allCols.map((c: any) => [c.title, c.id]))

  const allSizes = Array.from(new Set(products.flatMap((p: any) => p.variants.map((v: any) => String(v.size)))))
  const allColors = Array.from(new Set(products.flatMap((p: any) => p.variants.map((v: any) => String(v.color_name_de)))))
  const { data: existingOpts } = await query.graph({ entity: "product_option", fields: ["id", "title", "values.value"], filters: { is_exclusive: false } })
  const needSize = !existingOpts.some((o: any) => o.title === "Size")
  const needColor = !existingOpts.some((o: any) => o.title === "Color")
  if (needSize || needColor) {
    const opts: any[] = []
    if (needSize) opts.push({ title: "Size", values: allSizes })
    if (needColor) opts.push({ title: "Color", values: allColors })
    await createProductOptionsWorkflow(container).run({ input: { product_options: opts } })
  }
  const { data: optRows } = await query.graph({ entity: "product_option", fields: ["id", "title", "values.value"], filters: { is_exclusive: false } })
  const sizeOpt = optRows.find((o: any) => o.title === "Size")
  const colorOpt = optRows.find((o: any) => o.title === "Color")
  if (!sizeOpt || !colorOpt) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Options missing")

  const { data: already } = await query.graph({ entity: "product", fields: ["handle"] })
  const taken = new Set(already.map((a: any) => a.handle).filter(Boolean))

  const toCreate: any[] = []
  for (const p of products) {
    const handle = String(p.slug)
    if (taken.has(handle)) continue
    const chosenCats: any[] = []
    const ch = catMap.get(String(p.category_id || "").toLowerCase())
    if (ch) chosenCats.push({ id: ch })
    const col = colMap.get(String(p.category_id))
    toCreate.push({
      title: p.name_de,
      handle,
      subtitle: p.subtitle_de,
      description: p.description_de,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      collection_id: col?.id,
      category_ids: chosenCats,
      sales_channels: [{ id: salesChannel.id }],
      options: [{ id: sizeOpt.id }, { id: colorOpt.id }],
      variants: p.variants.map((v: any) => ({
        title: `${v.color_name_de} / ${v.size}`,
        sku: v.sku,
        options: { Size: String(v.size), Color: String(v.color_name_de) },
        prices: currencyCodes.map((cc) => ({ amount: Number(v.price_gross_eur_cents), currency_code: cc })),
        manage_inventory: true,
        allow_backorder: false,
        inventory_quantity: Number(v.stock_quantity),
      })),
    })
  }

  if (!toCreate.length) {
    logger.info("Werkfaden catalog already up to date")
    return
  }
  for (let i = 0; i < toCreate.length; i += 10) {
    const batch = toCreate.slice(i, i + 10)
    await createProductsWorkflow(container).run({ input: { products: batch } })
    logger.info(`Created ${Math.min(i + 10, toCreate.length)}/${toCreate.length} products`)
  }
  logger.info("Werkfaden catalog seed complete")
}

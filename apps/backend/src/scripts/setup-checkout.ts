import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, MedusaError, Modules } from "@medusajs/framework/utils"
import {
  batchLinksWorkflow,
  createLocationFulfillmentSetWorkflow,
  createServiceZonesWorkflow,
  createShippingOptionsWorkflow,
  createTaxRegionsWorkflow,
  updatePricePreferencesWorkflow,
  updateRegionsWorkflow,
} from "@medusajs/medusa/core-flows"

const REGION_NAME = "Deutschland (Demo)"
const LOCATION_NAME = "Werkfaden Lager"
const FULFILLMENT_SET_NAME = "Werkfaden Versand"
const SERVICE_ZONE_NAME = "Deutschland"
const SHIPPING_OPTION_NAME = "Standardversand"
const FULFILLMENT_PROVIDER_ID = "manual_manual"
const SHIPPING_PRICE = 5.9
const FREE_SHIPPING_THRESHOLD = 100
const VAT_RATE = 19

function assertIsolatedDb() {
  const databaseUrl = new URL(process.env.DATABASE_URL ?? "")
  if (databaseUrl.hostname !== "127.0.0.1" || databaseUrl.pathname !== "/werkfaden_dev") {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Checkout bootstrap is restricted to the isolated local werkfaden_dev database",
    )
  }
}

export default async function setupCheckout({ container }: ExecArgs): Promise<void> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  assertIsolatedDb()

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name"],
    filters: { name: REGION_NAME },
  })
  const region = regions[0]
  if (!region) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Missing region "${REGION_NAME}"; run setup-store first`)
  }
  await updateRegionsWorkflow(container).run({
    input: { selector: { id: region.id }, update: { is_tax_inclusive: true } },
  })
  // Catalog prices carry no region price-rule, so the effective tax-inclusive
  // switch for them is the currency-level price preference, not the region one.
  await updatePricePreferencesWorkflow(container).run({
    input: {
      selector: { attribute: "currency_code", value: "eur" },
      update: { is_tax_inclusive: true },
    },
  })

  const { data: taxRegions } = await query.graph({ entity: "tax_region", fields: ["id", "country_code"] })
  if (!taxRegions.some((taxRegion: any) => taxRegion.country_code === "de")) {
    await createTaxRegionsWorkflow(container).run({
      input: [{
        country_code: "de",
        provider_id: "tp_system",
        default_tax_rate: { rate: VAT_RATE, code: "DE_MWST_19", name: "Mehrwertsteuer 19 %" },
      }],
    })
    logger.info(`Created German tax region with ${VAT_RATE} % default rate`)
  } else {
    logger.info("German tax region already exists")
  }

  const { data: locations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name", "fulfillment_providers.id"],
  })
  const location = locations.find((candidate: any) => candidate.name === LOCATION_NAME) ?? locations[0]
  if (!location) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Missing stock location "${LOCATION_NAME}"; run setup-inventory first`)
  }

  const linkedProviderIds = (location.fulfillment_providers ?? []).map((provider: any) => provider.id)
  if (!linkedProviderIds.includes(FULFILLMENT_PROVIDER_ID)) {
    await batchLinksWorkflow(container).run({
      input: {
        create: [{
          [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
          [Modules.FULFILLMENT]: { fulfillment_provider_id: FULFILLMENT_PROVIDER_ID },
        }],
      },
    })
    logger.info(`Enabled fulfillment provider "${FULFILLMENT_PROVIDER_ID}" on "${location.name}"`)
  }

  const { data: fulfillmentSets } = await query.graph({
    entity: "fulfillment_set",
    fields: ["id", "name"],
    filters: { name: FULFILLMENT_SET_NAME },
  })
  let fulfillmentSet = fulfillmentSets[0]
  if (fulfillmentSet) {
    logger.info(`Fulfillment set "${FULFILLMENT_SET_NAME}" already exists`)
  } else {
    await createLocationFulfillmentSetWorkflow(container).run({
      input: {
        location_id: location.id,
        fulfillment_set_data: { name: FULFILLMENT_SET_NAME, type: "shipping" },
      },
    })
    const { data: createdSets } = await query.graph({
      entity: "fulfillment_set",
      fields: ["id", "name"],
      filters: { name: FULFILLMENT_SET_NAME },
    })
    fulfillmentSet = createdSets[0]
    logger.info(`Created fulfillment set "${FULFILLMENT_SET_NAME}" for "${location.name}"`)
  }

  const { data: serviceZones } = await query.graph({
    entity: "service_zone",
    fields: ["id", "name", "fulfillment_set_id"],
  })
  const existingZone = serviceZones.find((zone: any) => zone.fulfillment_set_id === fulfillmentSet.id)
  let serviceZoneId: string
  if (existingZone) {
    serviceZoneId = existingZone.id
    logger.info(`Service zone "${existingZone.name}" already exists`)
  } else {
    const { result } = await createServiceZonesWorkflow(container).run({
      input: {
        data: [{
          name: SERVICE_ZONE_NAME,
          fulfillment_set_id: fulfillmentSet.id,
          geo_zones: [{ type: "country", country_code: "de" }],
        }],
      },
    })
    serviceZoneId = result[0].id
    logger.info(`Created service zone "${SERVICE_ZONE_NAME}"`)
  }

  const { data: shippingProfiles } = await query.graph({ entity: "shipping_profile", fields: ["id", "type"] })
  const shippingProfile = shippingProfiles.find((profile: any) => profile.type === "default") ?? shippingProfiles[0]
  if (!shippingProfile) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Missing shipping profile; run ensure-shipping-profile first")
  }

  const { data: shippingOptions } = await query.graph({
    entity: "shipping_option",
    fields: ["id", "name"],
    filters: { name: SHIPPING_OPTION_NAME },
  })
  if (shippingOptions.length) {
    logger.info(`Shipping option "${SHIPPING_OPTION_NAME}" already exists`)
  } else {
    await createShippingOptionsWorkflow(container).run({
      input: [{
        name: SHIPPING_OPTION_NAME,
        service_zone_id: serviceZoneId,
        shipping_profile_id: shippingProfile.id,
        provider_id: FULFILLMENT_PROVIDER_ID,
        type: {
          label: "Standard",
          description: "Standardversand innerhalb Deutschlands",
          code: "standard",
        },
        price_type: "flat",
        prices: [
          { currency_code: "eur", amount: SHIPPING_PRICE, rules: [] },
          {
            currency_code: "eur",
            amount: 0,
            rules: [{ attribute: "item_total", operator: "gte", value: FREE_SHIPPING_THRESHOLD }],
          },
        ],
      }],
    })
    logger.info(`Created shipping option "${SHIPPING_OPTION_NAME}" (${SHIPPING_PRICE} EUR, free above ${FREE_SHIPPING_THRESHOLD} EUR)`)
  }

  logger.info("Checkout setup complete: tax-inclusive prices, DE tax, shipping option with free-shipping threshold")
}

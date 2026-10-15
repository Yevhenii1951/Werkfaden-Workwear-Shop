import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules, ProductStatus } from "@medusajs/framework/utils"
import {
  batchLinksWorkflow,
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createLocationFulfillmentSetWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createServiceZonesWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
} from "@medusajs/medusa/core-flows"
import type { MedusaSuiteOptions } from "@medusajs/test-utils"

export const SYSTEM_PROVIDER_ID = "pp_system_default"
export const STRIPE_PROVIDER_ID = "pp_stripe_stripe"
export const FULFILLMENT_PROVIDER_ID = "manual_manual"

type Api = MedusaSuiteOptions["api"]
type Deps = { container: MedusaContainer; api: Api }
type Headers = { headers: Record<string, string> }

export interface CheckoutSeed {
  cart: { id: string }
  variantId: string
  shippingOptionId: string
  regionId: string
  salesChannelId: string
  storeHeaders: Headers
}

const SHIPPING_ADDRESS = {
  address_1: "Kölnische Str. 1",
  city: "Kassel",
  postal_code: "34117",
  country_code: "de",
}

/**
 * Seeds one sellable variant plus the region / sales channel / stock location
 * / shipping option a checkout needs, then opens a first cart for it.
 * Pass `manageInventory` to get a variant that is stocked with exactly one unit.
 */
export async function seedCheckout(
  { container, api }: Deps,
  options: { manageInventory?: boolean } = {}
): Promise<CheckoutSeed> {
  const manageInventory = options.manageInventory ?? false
  const query = () => container.resolve(ContainerRegistrationKeys.QUERY)

  const { result: regions } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Test Deutschland",
          currency_code: "eur",
          countries: ["de"],
          payment_providers: [SYSTEM_PROVIDER_ID, STRIPE_PROVIDER_ID],
          automatic_taxes: false,
        },
      ],
    },
  })
  const region = regions[0]

  const { result: salesChannels } = await createSalesChannelsWorkflow(container).run({
    input: { salesChannelsData: [{ name: "Test SC", is_disabled: false }] },
  })
  const salesChannel = salesChannels[0]

  const publishableKey = await container
    .resolve(Modules.API_KEY)
    .createApiKeys({ title: "test key", type: "publishable", created_by: "test" })
  const storeHeaders: Headers = { headers: { "x-publishable-api-key": publishableKey.token } }

  const { result: profiles } = await createShippingProfilesWorkflow(container).run({
    input: { data: [{ name: "Test Profile", type: "default" }] },
  })
  const shippingProfile = profiles[0]

  const { result: products } = await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "Test Product",
          status: ProductStatus.PUBLISHED,
          options: [{ title: "Size", values: ["S"] }],
          variants: [
            {
              title: "Test Variant",
              sku: "TEST-VARIANT",
              options: { Size: "S" },
              prices: [{ currency_code: "eur", amount: 2990 }],
              manage_inventory: manageInventory,
            },
          ],
          sales_channels: [{ id: salesChannel.id }],
          shipping_profile_id: shippingProfile.id,
        },
      ],
    },
  })
  const product = products[0]
  const variantId = product.variants[0].id

  const { result: locations } = await createStockLocationsWorkflow(container).run({
    input: { locations: [{ name: "Test Lager" }] },
  })
  const location = locations[0]

  await batchLinksWorkflow(container).run({
    input: {
      create: [
        {
          [Modules.SALES_CHANNEL]: { sales_channel_id: salesChannel.id },
          [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
        },
        {
          [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
          [Modules.FULFILLMENT]: { fulfillment_provider_id: FULFILLMENT_PROVIDER_ID },
        },
      ],
    },
  })

  if (manageInventory) {
    const { data: inventoryItems } = await query().graph({
      entity: "inventory_item",
      fields: ["id", "sku"],
      filters: { sku: "TEST-VARIANT" },
    })
    await createInventoryLevelsWorkflow(container).run({
      input: {
        inventory_levels: [
          {
            inventory_item_id: inventoryItems[0].id,
            location_id: location.id,
            stocked_quantity: 1,
          },
        ],
      },
    })
  }

  await createLocationFulfillmentSetWorkflow(container).run({
    input: {
      location_id: location.id,
      fulfillment_set_data: { name: "Test Set", type: "shipping" },
    },
  })
  const { data: fulfillmentSets } = await query().graph({
    entity: "fulfillment_set",
    fields: ["id", "name"],
    filters: { name: "Test Set" },
  })

  const { result: zones } = await createServiceZonesWorkflow(container).run({
    input: {
      data: [
        {
          name: "Test Zone",
          fulfillment_set_id: fulfillmentSets[0].id,
          geo_zones: [{ type: "country", country_code: "de" }],
        },
      ],
    },
  })

  const { result: shippingOptions } = await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Test Versand",
        service_zone_id: zones[0].id,
        shipping_profile_id: shippingProfile.id,
        provider_id: FULFILLMENT_PROVIDER_ID,
        price_type: "flat",
        type: { label: "Standard", description: "Standard", code: "standard" },
        prices: [{ currency_code: "eur", amount: 590 }],
      },
    ],
  })
  const shippingOptionId = shippingOptions[0].id

  const cart = await addCheckoutCart(
    { api, storeHeaders },
    { regionId: region.id, salesChannelId: salesChannel.id, variantId, shippingOptionId },
    "buyer@example.com"
  )

  return {
    cart,
    variantId,
    shippingOptionId,
    regionId: region.id,
    salesChannelId: salesChannel.id,
    storeHeaders,
  }
}

export async function addCheckoutCart(
  { api, storeHeaders }: { api: Api; storeHeaders: Headers },
  seed: Pick<CheckoutSeed, "regionId" | "salesChannelId" | "variantId" | "shippingOptionId">,
  email: string
): Promise<{ id: string }> {
  const { data } = await api.post(
    "/store/carts",
    {
      region_id: seed.regionId,
      sales_channel_id: seed.salesChannelId,
      email,
      shipping_address: SHIPPING_ADDRESS,
      items: [{ variant_id: seed.variantId, quantity: 1 }],
    },
    storeHeaders
  )
  await api.post(
    `/store/carts/${data.cart.id}/shipping-methods`,
    { option_id: seed.shippingOptionId },
    storeHeaders
  )
  return data.cart
}

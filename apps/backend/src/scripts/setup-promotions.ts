import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { createPromotionsWorkflow } from "@medusajs/medusa/core-flows"

const REGION_NAME = "Deutschland (Demo)"
const PERCENT_CODE = "WERKFADEN10"
const FIXED_CODE = "WERKFADEN5"
const EXPIRED_CODE = "WERKFADEN-ABGELAUFEN"
const EXHAUSTED_CODE = "WERKFADEN-LIMIT"
const DAY_IN_MILLISECONDS = 86_400_000

function assertIsolatedDb() {
  const databaseUrl = new URL(process.env.DATABASE_URL ?? "")
  if (databaseUrl.hostname !== "127.0.0.1" || databaseUrl.pathname !== "/werkfaden_dev") {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Promotion setup is restricted to the isolated local werkfaden_dev database"
    )
  }
}

export default async function setupPromotions({ container }: ExecArgs): Promise<void> {
  assertIsolatedDb()

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "currency_code"],
    filters: { name: REGION_NAME },
  })
  const region = regions[0]
  if (!region || region.currency_code !== "eur") {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Missing EUR region "${REGION_NAME}"; run setup-store first`
    )
  }

  const promotions = [
    {
      code: PERCENT_CODE,
      value: 10,
      type: "percentage" as const,
    },
    {
      code: FIXED_CODE,
      value: 5,
      type: "fixed" as const,
    },
    {
      code: EXPIRED_CODE,
      value: 10,
      type: "percentage" as const,
      campaign: {
        name: "Abgelaufener Werkfaden Demo-Rabatt",
        campaign_identifier: EXPIRED_CODE,
        ends_at: new Date(Date.now() - DAY_IN_MILLISECONDS),
      },
    },
    {
      code: EXHAUSTED_CODE,
      value: 10,
      type: "percentage" as const,
      limit: 1,
      used: 1,
    },
  ]

  for (const promotion of promotions) {
    const { data: existing } = await query.graph({
      entity: "promotion",
      fields: ["id"],
      filters: { code: promotion.code },
    })
    if (existing.length) {
      logger.info(`Demo promotion "${promotion.code}" already exists`)
      continue
    }

    await createPromotionsWorkflow(container).run({
      input: {
        promotionsData: [
          {
            ...promotion,
            type: "standard",
            status: "active",
            rules: [
              {
                attribute: "region.id",
                operator: "eq",
                values: [region.id],
              },
            ],
            application_method: {
              type: promotion.type,
              target_type: "items",
              allocation: "across",
              value: promotion.value,
              currency_code: "eur",
            },
          },
        ],
      },
    })
    logger.info(`Created DE/EUR demo promotion "${promotion.code}"`)
  }

  logger.info("Demo promotion setup complete; codes are for local portfolio testing only")
}

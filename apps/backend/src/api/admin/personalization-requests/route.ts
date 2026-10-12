import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { PERSONALIZATION_MODULE } from "../../../modules/personalization"
import PersonalizationModuleService from "../../../modules/personalization/service"

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

function parsePageParam(value: unknown, fallback: number): number {
  const parsed = Number(Array.isArray(value) ? value[0] : value)
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : fallback
}

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const service = req.scope.resolve<PersonalizationModuleService>(
    PERSONALIZATION_MODULE
  )

  const limit = Math.min(
    parsePageParam(req.query.limit, DEFAULT_LIMIT) || DEFAULT_LIMIT,
    MAX_LIMIT
  )
  const offset = parsePageParam(req.query.offset, 0)

  const [personalization_requests, count] =
    await service.listAndCountPersonalizationRequests(
      {},
      { order: { created_at: "DESC" }, skip: offset, take: limit }
    )

  res.json({
    personalization_requests,
    count,
    offset,
    limit,
  })
}

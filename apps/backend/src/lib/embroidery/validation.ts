import { z } from "@medusajs/framework/zod"
import {
  EMBROIDERY_GARMENTS,
  EMBROIDERY_POSITIONS,
  MAX_QUANTITY,
  MAX_STITCH_COUNT,
} from "./rate-table"

// Strict: the endpoint derives every price, so any extra key (a smuggled
// price, total or currency) is rejected instead of silently ignored.
export const EstimateEmbroiderySchema = z
  .object({
    position: z.enum(EMBROIDERY_POSITIONS),
    garment: z.enum(EMBROIDERY_GARMENTS),
    stitch_count: z.coerce.number().int().min(1).max(MAX_STITCH_COUNT),
    quantity: z.coerce.number().int().min(1).max(MAX_QUANTITY),
  })
  .strict()

export type EstimateEmbroideryBody = z.infer<typeof EstimateEmbroiderySchema>

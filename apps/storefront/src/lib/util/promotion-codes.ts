import { z } from "zod"

type AppliedPromotion = {
  code?: string | null
}

const promotionCodesSchema = z.array(z.string().trim().min(1))

export function parsePromotionCodes(value: unknown): string[] | null {
  const result = promotionCodesSchema.safeParse(value)
  return result.success ? result.data : null
}

export function getUnappliedPromotionCode(
  appliedPromotions: AppliedPromotion[] | undefined,
  requestedCodes: string[]
): string | undefined {
  const appliedCodes = (appliedPromotions ?? [])
    .map((promotion) => promotion.code?.trim().toUpperCase())
    .filter((code): code is string => Boolean(code))

  return requestedCodes.find(
    (code) => !appliedCodes.includes(code.trim().toUpperCase())
  )
}

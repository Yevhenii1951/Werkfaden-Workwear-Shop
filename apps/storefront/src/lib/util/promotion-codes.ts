type AppliedPromotion = {
  code?: string | null
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

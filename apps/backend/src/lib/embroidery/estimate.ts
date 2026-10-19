import {
  EMBROIDERY_CURRENCY,
  GARMENT_FACTORS,
  POSITION_UNIT_PRICE,
  QUANTITY_BANDS,
  STITCH_BANDS,
  type EmbroideryGarment,
  type EmbroideryPosition,
  type QuantityBand,
  type StitchBand,
} from "./rate-table"

export type EmbroideryEstimateInput = {
  position: EmbroideryPosition
  garment: EmbroideryGarment
  stitch_count: number
  quantity: number
}

export type EmbroideryEstimate = {
  position: EmbroideryPosition
  garment: EmbroideryGarment
  stitch_count: number
  stitch_band: string
  quantity: number
  quantity_band: string
  quantity_factor: number
  unit_surcharge: number
  total: number
  currency_code: string
}

// German retail rounding: half-up to the cent. Prices, garment factors and
// quantity factors are converted to integers (cents, per-mille, tenths) before
// the single division, so no binary float noise can flip a half-cent.
export function divideRoundHalfUp(numerator: number, denominator: number): number {
  return Math.floor((numerator + denominator / 2) / denominator)
}

export function resolveStitchBand(stitchCount: number): StitchBand {
  const band = STITCH_BANDS.find(
    (candidate) =>
      stitchCount >= candidate.min &&
      (candidate.max === null || stitchCount <= candidate.max)
  )

  if (!band) {
    throw new RangeError(`No stitch band covers ${stitchCount} stitches`)
  }

  return band
}

export function resolveQuantityBand(quantity: number): QuantityBand {
  const band = QUANTITY_BANDS.find(
    (candidate) =>
      quantity >= candidate.min &&
      (candidate.max === null || quantity <= candidate.max)
  )

  if (!band) {
    throw new RangeError(`No quantity band covers ${quantity} items`)
  }

  return band
}

// Deterministic, server-authoritative estimate:
//   unit_surcharge = base(position, stitch band) * garment factor * quantity factor
//   total          = unit_surcharge * quantity
// The unit amount is rounded half-up to the cent; the total is derived from the
// already-rounded unit price so the UI can show a consistent unit * qty.
//
// All inputs are converted to integers first (bases have one decimal → cents,
// garment factors have at most two → per-mille, quantity factors have one →
// tenths), so the only rounding is one exact half-up division.
export function estimateEmbroidery(
  input: EmbroideryEstimateInput
): EmbroideryEstimate {
  const stitchBand = resolveStitchBand(input.stitch_count)
  const quantityBand = resolveQuantityBand(input.quantity)

  const baseCents = Math.round(
    POSITION_UNIT_PRICE[input.position][stitchBand.id] * 100
  )
  const garmentPermille = Math.round(GARMENT_FACTORS[input.garment] * 1000)
  const quantityTenths = Math.round(quantityBand.factor * 10)

  const unitCents = divideRoundHalfUp(
    baseCents * garmentPermille * quantityTenths,
    10_000
  )
  const totalCents = unitCents * input.quantity

  return {
    position: input.position,
    garment: input.garment,
    stitch_count: input.stitch_count,
    stitch_band: stitchBand.label,
    quantity: input.quantity,
    quantity_band: quantityBand.label,
    quantity_factor: quantityBand.factor,
    unit_surcharge: unitCents / 100,
    total: totalCents / 100,
    currency_code: EMBROIDERY_CURRENCY,
  }
}

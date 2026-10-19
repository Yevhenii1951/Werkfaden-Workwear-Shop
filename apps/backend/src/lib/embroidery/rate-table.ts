// Demo fixtures for the embroidery surcharge calculator (WW-014).
//
// These values are NOT market prices and make no claim about real embroidery
// partners. They are documented placeholders so the estimate is deterministic
// and reviewable. Every amount is a net EUR price (excl. VAT); German retail
// rounding is applied in `estimate.ts`.
//
// Table shape:
//   unit base (EUR) = POSITION_UNIT_PRICE[position][stitchBand]
//   garment factor  = GARMENT_FACTORS[garment]
//   quantity factor = QUANTITY_BANDS[quantityBand].factor
//
// The quantity bands are the only bulk mechanism (no multi-position engine).

export const EMBROIDERY_CURRENCY = "eur"

export const EMBROIDERY_POSITIONS = ["chest", "back", "sleeve"] as const
export type EmbroideryPosition = (typeof EMBROIDERY_POSITIONS)[number]

export const EMBROIDERY_GARMENTS = [
  "tshirt",
  "polo",
  "sweatshirt",
  "jacket",
] as const
export type EmbroideryGarment = (typeof EMBROIDERY_GARMENTS)[number]

export type StitchBand = {
  id: string
  min: number
  max: number | null
  label: string
}

export const STITCH_BANDS: readonly StitchBand[] = [
  { id: "bis-4000", min: 1, max: 4000, label: "bis 4.000 Stiche" },
  { id: "4001-8000", min: 4001, max: 8000, label: "4.001–8.000 Stiche" },
  { id: "8001-12000", min: 8001, max: 12000, label: "8.001–12.000 Stiche" },
  { id: "ueber-12000", min: 12001, max: null, label: "über 12.000 Stiche" },
]

export const MAX_STITCH_COUNT = 20000
export const MAX_QUANTITY = 100000

export const POSITION_UNIT_PRICE: Record<
  EmbroideryPosition,
  Record<string, number>
> = {
  chest: {
    "bis-4000": 2.9,
    "4001-8000": 3.6,
    "8001-12000": 4.4,
    "ueber-12000": 5.5,
  },
  back: {
    "bis-4000": 4.2,
    "4001-8000": 5.2,
    "8001-12000": 6.3,
    "ueber-12000": 7.8,
  },
  sleeve: {
    "bis-4000": 2.2,
    "4001-8000": 2.7,
    "8001-12000": 3.3,
    "ueber-12000": 4.1,
  },
}

export const GARMENT_FACTORS: Record<EmbroideryGarment, number> = {
  tshirt: 1,
  polo: 1,
  sweatshirt: 1.1,
  jacket: 1.25,
}

export type QuantityBand = {
  id: string
  min: number
  max: number | null
  factor: number
  label: string
}

export const QUANTITY_BANDS: readonly QuantityBand[] = [
  { id: "1-9", min: 1, max: 9, factor: 1, label: "1–9 Stück" },
  { id: "10-49", min: 10, max: 49, factor: 0.9, label: "10–49 Stück" },
  { id: "50-199", min: 50, max: 199, factor: 0.8, label: "50–199 Stück" },
  { id: "ab-200", min: 200, max: null, factor: 0.7, label: "ab 200 Stück" },
]

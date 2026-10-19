import { convertToLocale } from "@lib/util/money"
import type { EmbroideryEstimate } from "@lib/data/embroidery"

export type LabeledOption = { value: string; label: string }

export const GARMENTS: LabeledOption[] = [
  { value: "tshirt", label: "T-Shirt" },
  { value: "polo", label: "Poloshirt" },
  { value: "sweatshirt", label: "Sweatshirt / Hoodie" },
  { value: "jacket", label: "Jacke / Weste" },
]

export const POSITIONS: LabeledOption[] = [
  { value: "chest", label: "Brust" },
  { value: "back", label: "Rücken" },
  { value: "sleeve", label: "Ärmel" },
]

export const STITCH_OPTIONS: { value: number; label: string }[] = [
  { value: 3000, label: "klein — bis 4.000 Stiche" },
  { value: 6000, label: "mittel — 4.001–8.000 Stiche" },
  { value: 10000, label: "groß — 8.001–12.000 Stiche" },
  { value: 15000, label: "sehr groß — über 12.000 Stiche" },
]

export const labelOf = (list: LabeledOption[], value: string) =>
  list.find((entry) => entry.value === value)?.label ?? value

const money = (amount: number, currencyCode: string) =>
  convertToLocale({ amount, currency_code: currencyCode })

export const buildSummary = (estimate: EmbroideryEstimate): string =>
  `Stickerei-Schätzung: Position ${labelOf(
    POSITIONS,
    estimate.position
  )}, ${estimate.stitch_band}, ${labelOf(
    GARMENTS,
    estimate.garment
  )}, ${estimate.quantity} Stück — geschätzte Veredelung ${money(
    estimate.unit_surcharge,
    estimate.currency_code
  )} je Stück, gesamt ${money(
    estimate.total,
    estimate.currency_code
  )} netto (unverbindliche Schätzung).`

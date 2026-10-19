"use server"

export type EmbroideryEstimate = {
  position: string
  garment: string
  stitch_count: number
  stitch_band: string
  quantity: number
  quantity_band: string
  quantity_factor: number
  unit_surcharge: number
  total: number
  currency_code: string
}

export type EmbroideryEstimateState =
  | { state: "success"; estimate: EmbroideryEstimate }
  | { state: "error"; error: string }
  | null

const MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

const GENERIC_ERROR =
  "Die Schätzung konnte nicht berechnet werden. Bitte versuchen Sie es erneut."

const VALIDATION_ERROR =
  "Bitte prüfen Sie Ihre Angaben: Position, Stickgröße und Menge müssen gültig sein."

const RATE_LIMIT_ERROR =
  "Zu viele Anfragen in kurzer Zeit. Bitte versuchen Sie es in einer Minute erneut."

const errorForStatus = (status: number) => {
  if (status === 400) {
    return VALIDATION_ERROR
  }
  if (status === 429) {
    return RATE_LIMIT_ERROR
  }
  return GENERIC_ERROR
}

export async function estimateEmbroiderySurcharge(
  _currentState: EmbroideryEstimateState,
  formData: FormData
): Promise<EmbroideryEstimateState> {
  const headers: Record<string, string> = {
    "content-type": "application/json",
  }
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  if (publishableKey) {
    headers["x-publishable-api-key"] = publishableKey
  }

  const body = {
    position: String(formData.get("position") ?? ""),
    garment: String(formData.get("garment") ?? ""),
    stitch_count: String(formData.get("stitch_count") ?? ""),
    quantity: String(formData.get("quantity") ?? ""),
  }

  try {
    const response = await fetch(`${MEDUSA_BACKEND_URL}/store/embroidery/estimate`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      cache: "no-store",
    })

    const data = (await response.json().catch(() => null)) as {
      estimate?: EmbroideryEstimate
    } | null

    if (!response.ok || !data?.estimate) {
      return {
        state: "error",
        error: errorForStatus(response.status),
      }
    }

    return { state: "success", estimate: data.estimate }
  } catch {
    return { state: "error", error: GENERIC_ERROR }
  }
}

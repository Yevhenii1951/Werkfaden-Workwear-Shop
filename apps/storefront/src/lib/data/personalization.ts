"use server"

import { getAuthHeaders } from "./cookies"

export type PersonalizationState =
  | { state: "success"; id: string }
  | { state: "error"; error: string }
  | null

const MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

const MAX_LOGO_BYTES = 5 * 1024 * 1024

export async function submitPersonalizationRequest(
  _currentState: PersonalizationState,
  formData: FormData
): Promise<PersonalizationState> {
  const logo = formData.get("logo")

  if (!(logo instanceof File) || logo.size === 0) {
    return { state: "error", error: "Bitte laden Sie ein Logo hoch." }
  }

  if (logo.size > MAX_LOGO_BYTES) {
    return { state: "error", error: "Das Logo darf höchstens 5 MiB groß sein." }
  }

  const [productId, variantId] = String(formData.get("variant") ?? "").split("|")

  if (!productId || !variantId) {
    return { state: "error", error: "Bitte wählen Sie ein Produkt." }
  }

  const outbound = new FormData()
  outbound.append("logo", logo, logo.name)
  outbound.append("contact_name", String(formData.get("contact_name") ?? ""))
  outbound.append("contact_email", String(formData.get("contact_email") ?? ""))
  outbound.append("product_id", productId)
  outbound.append("variant_id", variantId)
  outbound.append("quantity", String(formData.get("quantity") ?? ""))

  const company = String(formData.get("company") ?? "").trim()
  if (company) {
    outbound.append("company", company)
  }

  const comment = String(formData.get("comment") ?? "").trim()
  if (comment) {
    outbound.append("comment", comment)
  }

  const headers: Record<string, string> = {}
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  if (publishableKey) {
    headers["x-publishable-api-key"] = publishableKey
  }

  const authHeaders = await getAuthHeaders()
  if ("authorization" in authHeaders) {
    headers["authorization"] = authHeaders.authorization
  }

  try {
    const response = await fetch(
      `${MEDUSA_BACKEND_URL}/store/personalization-requests`,
      { method: "POST", headers, body: outbound, cache: "no-store" }
    )

    const data = (await response.json().catch(() => null)) as {
      personalization_request?: { id: string }
      message?: string
    } | null

    if (!response.ok || !data?.personalization_request) {
      return {
        state: "error",
        error:
          data?.message ??
          "Die Anfrage konnte nicht gesendet werden. Bitte später erneut versuchen.",
      }
    }

    return { state: "success", id: data.personalization_request.id }
  } catch {
    return {
      state: "error",
      error:
        "Die Anfrage konnte nicht gesendet werden. Bitte später erneut versuchen.",
    }
  }
}

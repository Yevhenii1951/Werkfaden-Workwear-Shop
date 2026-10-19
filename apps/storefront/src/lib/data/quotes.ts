"use server"

import { redirect } from "next/navigation"
import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"
import { getQuoteToken, setQuoteToken } from "./quote-cookies"

export type QuoteLineInput = {
  product_id: string
  variant_id: string
  quantity: number
}

export type QuoteRequestItem = {
  id: string
  title: string
  quantity: number
  product_id: string
  variant_id: string
}

export type QuoteRequest = {
  id: string
  status: string
  contact_name: string
  contact_email: string
  company: string | null
  comment: string | null
  currency_code: string
  offered_total_minor: number | null
  promotion_code: string | null
  created_at: string
  items: QuoteRequestItem[]
}

export type QuoteRequestState = { state: "error"; error: string } | null

export type QuoteAcceptState =
  | { state: "success"; code: string }
  | { state: "error"; error: string }
  | null

export async function submitQuoteRequest(
  _currentState: QuoteRequestState,
  formData: FormData
): Promise<QuoteRequestState> {
  const countryCode = String(formData.get("countryCode") ?? "de")
  const contactName = String(formData.get("contact_name") ?? "").trim()
  const contactEmail = String(formData.get("contact_email") ?? "").trim()
  const company = String(formData.get("company") ?? "").trim()
  const comment = String(formData.get("comment") ?? "").trim()

  let items: QuoteLineInput[]
  try {
    const parsed = JSON.parse(String(formData.get("items") ?? "[]"))
    items = Array.isArray(parsed) ? parsed : []
  } catch {
    return { state: "error", error: "Die Positionen konnten nicht gelesen werden." }
  }

  const validItems = items.filter(
    (item) =>
      item &&
      typeof item.product_id === "string" &&
      typeof item.variant_id === "string" &&
      Number.isFinite(item.quantity) &&
      item.quantity > 0
  )

  if (validItems.length === 0) {
    return { state: "error", error: "Bitte fügen Sie mindestens eine Position hinzu." }
  }

  if (!contactName || !contactEmail) {
    return { state: "error", error: "Bitte geben Sie Name und E-Mail an." }
  }

  let created: { id: string; access_token: string }
  try {
    const response = await sdk.client.fetch<{
      quote_request: { id: string; status: string; access_token: string }
    }>("/store/quotes", {
      method: "POST",
      headers: await getAuthHeaders(),
      body: {
        contact_name: contactName,
        contact_email: contactEmail,
        company: company || undefined,
        comment: comment || undefined,
        items: validItems,
      },
    })
    created = response.quote_request
  } catch {
    return {
      state: "error",
      error:
        "Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.",
    }
  }

  await setQuoteToken(created.id, created.access_token)
  redirect(`/${countryCode}/angebote/${created.id}`)
}

export async function acceptQuoteRequest(
  _currentState: QuoteAcceptState,
  formData: FormData
): Promise<QuoteAcceptState> {
  const id = String(formData.get("id") ?? "")
  const token = String(formData.get("token") ?? "")

  if (!id) {
    return { state: "error", error: "Ungültiges Angebot." }
  }

  const headers: Record<string, string> = { ...(await getAuthHeaders()) }
  if (token) {
    headers["x-quote-token"] = token
  }

  try {
    const response = await sdk.client.fetch<{ promotion_code: string }>(
      `/store/quotes/${id}/accept`,
      { method: "POST", headers }
    )

    return { state: "success", code: response.promotion_code }
  } catch {
    return {
      state: "error",
      error:
        "Das Angebot konnte nicht angenommen werden. Möglicherweise ist es nicht mehr gültig.",
    }
  }
}

export async function listQuoteRequests(): Promise<QuoteRequest[]> {
  try {
    const response = await sdk.client.fetch<{
      quote_requests: QuoteRequest[]
    }>("/store/quotes", {
      method: "GET",
      headers: await getAuthHeaders(),
    })
    return response.quote_requests
  } catch {
    return []
  }
}

export async function getQuoteRequest(
  id: string
): Promise<{ request: QuoteRequest; token?: string } | null> {
  const token = await getQuoteToken(id)
  const headers: Record<string, string> = { ...(await getAuthHeaders()) }
  if (token) {
    headers["x-quote-token"] = token
  }

  try {
    const response = await sdk.client.fetch<{ quote_request: QuoteRequest }>(
      `/store/quotes/${id}`,
      { method: "GET", headers }
    )
    return { request: response.quote_request, token }
  } catch {
    return null
  }
}

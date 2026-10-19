import { QuoteRequestStatus } from "../../models/quote-request"
import {
  MAX_ITEMS,
  MAX_OFFER_MINOR,
  MIN_OFFER_MINOR,
  canTransition,
  isOperatorStatus,
  isQuoteStatus,
  isValidOfferMinor,
  offerToMinor,
  parseQuoteRequestInput,
  resolveCustomerId,
} from "../validation"

const validInput = {
  contact_name: "Erika Musterfrau",
  contact_email: "erika@example.de",
  items: [{ product_id: "prod_1", variant_id: "var_1", quantity: "24" }],
}

describe("parseQuoteRequestInput", () => {
  it("accepts a body and coerces item quantities", () => {
    const parsed = parseQuoteRequestInput(validInput)

    expect(parsed.items[0].quantity).toBe(24)
    expect(parsed.company).toBeUndefined()
    expect(parsed.comment).toBeUndefined()
  })

  it("rejects an invalid email, empty items and oversized carts", () => {
    expect(() =>
      parseQuoteRequestInput({ ...validInput, contact_email: "nope" })
    ).toThrow()
    expect(() => parseQuoteRequestInput({ ...validInput, items: [] })).toThrow()
    expect(() =>
      parseQuoteRequestInput({
        ...validInput,
        items: Array.from({ length: MAX_ITEMS + 1 }, (_, i) => ({
          product_id: `p_${i}`,
          variant_id: `v_${i}`,
          quantity: 1,
        })),
      })
    ).toThrow()
  })

  it("strips unknown fields so a client cannot set status or price", () => {
    const parsed = parseQuoteRequestInput({
      ...validInput,
      status: "accepted",
      offered_total_minor: 1,
      customer_id: "cus_forged",
    })

    expect(parsed).not.toHaveProperty("status")
    expect(parsed).not.toHaveProperty("offered_total_minor")
    expect(parsed).not.toHaveProperty("customer_id")
  })
})

describe("offer amounts", () => {
  it("converts major units to minor units", () => {
    expect(offerToMinor(249.9)).toBe(24990)
    expect(offerToMinor(1.23)).toBe(123)
    expect(offerToMinor(0.01)).toBe(1)
  })

  it("enforces the demo floor and ceiling", () => {
    expect(isValidOfferMinor(MIN_OFFER_MINOR)).toBe(true)
    expect(offerToMinor(1)).toBe(MIN_OFFER_MINOR)
    expect(isValidOfferMinor(MIN_OFFER_MINOR - 1)).toBe(false)
    expect(isValidOfferMinor(MAX_OFFER_MINOR)).toBe(true)
    expect(isValidOfferMinor(MAX_OFFER_MINOR + 1)).toBe(false)
    expect(isValidOfferMinor(1.5)).toBe(false)
  })
})

describe("status transitions", () => {
  it("knows which strings are valid statuses", () => {
    expect(isQuoteStatus("quoted")).toBe(true)
    expect(isQuoteStatus("paid")).toBe(false)
  })

  it("only allows operators to quote, reject or close", () => {
    expect(isOperatorStatus(QuoteRequestStatus.QUOTED)).toBe(true)
    expect(isOperatorStatus(QuoteRequestStatus.REJECTED)).toBe(true)
    expect(isOperatorStatus(QuoteRequestStatus.CLOSED)).toBe(true)
    expect(isOperatorStatus(QuoteRequestStatus.ACCEPTED)).toBe(false)
    expect(isOperatorStatus(QuoteRequestStatus.DRAFT)).toBe(false)
  })

  it("allows only the mapped forward transitions", () => {
    expect(
      canTransition(QuoteRequestStatus.SUBMITTED, QuoteRequestStatus.QUOTED)
    ).toBe(true)
    expect(
      canTransition(QuoteRequestStatus.QUOTED, QuoteRequestStatus.ACCEPTED)
    ).toBe(true)
    expect(
      canTransition(QuoteRequestStatus.ACCEPTED, QuoteRequestStatus.QUOTED)
    ).toBe(false)
    expect(
      canTransition(QuoteRequestStatus.CLOSED, QuoteRequestStatus.REJECTED)
    ).toBe(false)
    expect(
      canTransition(QuoteRequestStatus.REJECTED, QuoteRequestStatus.ACCEPTED)
    ).toBe(false)
  })
})

describe("resolveCustomerId", () => {
  it("returns the actor id only for customer actors", () => {
    expect(resolveCustomerId({ actor_type: "customer", actor_id: "cus_1" })).toBe(
      "cus_1"
    )
    expect(resolveCustomerId({ actor_type: "user", actor_id: "user_1" })).toBeNull()
    expect(resolveCustomerId(undefined)).toBeNull()
  })
})

describe("isQuoteStatus boundary", () => {
  it("accepts every declared status", () => {
    for (const status of Object.values(QuoteRequestStatus)) {
      expect(isQuoteStatus(status)).toBe(true)
    }
  })
})

describe("offer bounds constants", () => {
  it("keeps the floor below the ceiling", () => {
    expect(MIN_OFFER_MINOR).toBeLessThan(MAX_OFFER_MINOR)
  })
})

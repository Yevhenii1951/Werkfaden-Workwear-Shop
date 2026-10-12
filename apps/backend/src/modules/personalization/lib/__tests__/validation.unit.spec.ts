import { PersonalizationRequestStatus } from "../../models/personalization-request"
import {
  MAX_QUANTITY,
  canTransition,
  detectImageType,
  isLogoFormat,
  isPersonalizationStatus,
  logoFileExtension,
  logoMimeType,
  logoStorageFilename,
  parsePersonalizationRequestInput,
  resolveCustomerId,
} from "../validation"

const PNG_HEADER = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
const JPEG_HEADER = Buffer.from([0xff, 0xd8, 0xff])
const WEBP_HEADER = Buffer.concat([
  Buffer.from("RIFF", "ascii"),
  Buffer.from([0x20, 0x00, 0x00, 0x00]),
  Buffer.from("WEBP", "ascii"),
])

const validInput = {
  contact_name: "Erika Musterfrau",
  contact_email: "erika@example.de",
  product_id: "prod_123",
  variant_id: "variant_456",
  quantity: "24",
}

describe("detectImageType", () => {
  it("recognises PNG, JPEG and WebP magic bytes", () => {
    expect(detectImageType(PNG_HEADER)).toBe("png")
    expect(detectImageType(JPEG_HEADER)).toBe("jpeg")
    expect(detectImageType(WEBP_HEADER)).toBe("webp")
  })

  it("rejects a GIF and a text payload", () => {
    expect(detectImageType(Buffer.from("GIF89a"))).toBeNull()
    expect(detectImageType(Buffer.from("not an image"))).toBeNull()
  })

  it("rejects truncated headers", () => {
    expect(detectImageType(Buffer.from([0x89, 0x50]))).toBeNull()
  })
})

describe("logo format helpers", () => {
  it("maps formats to mime types and storage filenames", () => {
    expect(logoMimeType("png")).toBe("image/png")
    expect(logoMimeType("jpeg")).toBe("image/jpeg")
    expect(logoMimeType("webp")).toBe("image/webp")
    expect(logoStorageFilename("jpeg", "abc")).toBe("abc.jpg")
  })

  it("maps formats to bare extensions", () => {
    expect(logoFileExtension("png")).toBe("png")
    expect(logoFileExtension("jpeg")).toBe("jpg")
    expect(logoFileExtension("webp")).toBe("webp")
  })

  it("guards stored format values", () => {
    expect(isLogoFormat("png")).toBe(true)
    expect(isLogoFormat("jpeg")).toBe(true)
    expect(isLogoFormat("webp")).toBe(true)
    expect(isLogoFormat("svg")).toBe(false)
    expect(isLogoFormat(null)).toBe(false)
    expect(isLogoFormat(undefined)).toBe(false)
  })
})

describe("parsePersonalizationRequestInput", () => {
  it("accepts a multipart body and coerces the quantity", () => {
    const parsed = parsePersonalizationRequestInput(validInput)

    expect(parsed.quantity).toBe(24)
    expect(parsed.contact_email).toBe("erika@example.de")
    expect(parsed.company).toBeUndefined()
    expect(parsed.comment).toBeUndefined()
  })

  it("rejects an invalid email", () => {
    expect(() =>
      parsePersonalizationRequestInput({ ...validInput, contact_email: "nope" })
    ).toThrow()
  })

  it("rejects a non-positive or oversized quantity", () => {
    expect(() =>
      parsePersonalizationRequestInput({ ...validInput, quantity: "0" })
    ).toThrow()
    expect(() =>
      parsePersonalizationRequestInput({
        ...validInput,
        quantity: String(MAX_QUANTITY + 1),
      })
    ).toThrow()
  })

  it("strips unknown fields so a client cannot set customer_id", () => {
    const parsed = parsePersonalizationRequestInput({
      ...validInput,
      customer_id: "cus_forged",
      status: "quoted",
    })

    expect(parsed).not.toHaveProperty("customer_id")
    expect(parsed).not.toHaveProperty("status")
  })
})

describe("status transitions", () => {
  it("knows which strings are valid statuses", () => {
    expect(isPersonalizationStatus("reviewing")).toBe(true)
    expect(isPersonalizationStatus("paid")).toBe(false)
  })

  it("allows only forward transitions", () => {
    expect(
      canTransition(
        PersonalizationRequestStatus.SUBMITTED,
        PersonalizationRequestStatus.REVIEWING
      )
    ).toBe(true)
    expect(
      canTransition(
        PersonalizationRequestStatus.CLOSED,
        PersonalizationRequestStatus.REVIEWING
      )
    ).toBe(false)
    expect(
      canTransition(
        PersonalizationRequestStatus.QUOTED,
        PersonalizationRequestStatus.SUBMITTED
      )
    ).toBe(false)
  })
})

describe("resolveCustomerId", () => {
  it("returns the actor id only for customer actors", () => {
    expect(resolveCustomerId({ actor_type: "customer", actor_id: "cus_1" })).toBe(
      "cus_1"
    )
    expect(resolveCustomerId({ actor_type: "customer" })).toBeNull()
    expect(resolveCustomerId({ actor_type: "user", actor_id: "user_1" })).toBeNull()
    expect(resolveCustomerId(undefined)).toBeNull()
  })
})

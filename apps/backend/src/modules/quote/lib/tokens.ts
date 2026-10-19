import { createHash, randomBytes, timingSafeEqual } from "crypto"

// Avoid ambiguous characters (0/O, 1/I) in the human-shared promotion code.
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

export function generateAccessToken(): string {
  return randomBytes(32).toString("base64url")
}

export function hashAccessToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}

export function accessTokenMatches(token: string, hash: string): boolean {
  const candidate = Buffer.from(hashAccessToken(token), "hex")
  const expected = Buffer.from(hash, "hex")
  return (
    candidate.length === expected.length && timingSafeEqual(candidate, expected)
  )
}

export function generatePromotionCode(): string {
  const bytes = randomBytes(8)
  let suffix = ""
  for (const byte of bytes) {
    suffix += CODE_ALPHABET[byte % CODE_ALPHABET.length]
  }
  return `ANGEBOT-${suffix}`
}

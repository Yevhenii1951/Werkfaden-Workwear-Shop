import {
  accessTokenMatches,
  generateAccessToken,
  generatePromotionCode,
  hashAccessToken,
} from "../tokens"

describe("access tokens", () => {
  it("generates a unique, non-guessable token per call", () => {
    const first = generateAccessToken()
    const second = generateAccessToken()

    expect(first).not.toBe(second)
    expect(first.length).toBeGreaterThanOrEqual(40)
  })

  it("hashes deterministically and matches only the right token", () => {
    const token = generateAccessToken()
    const hash = hashAccessToken(token)

    expect(hashAccessToken(token)).toBe(hash)
    expect(accessTokenMatches(token, hash)).toBe(true)
    expect(accessTokenMatches("some-other-token", hash)).toBe(false)
  })

  it("never returns the raw token from the hash", () => {
    const token = generateAccessToken()
    expect(hashAccessToken(token)).not.toContain(token)
  })
})

describe("generatePromotionCode", () => {
  it("uses the ANGEBOT- prefix and unambiguous alphabet", () => {
    const code = generatePromotionCode()

    expect(code).toMatch(/^ANGEBOT-[A-HJ-NP-Z2-9]{8}$/)
  })

  it("does not repeat consecutive codes", () => {
    expect(generatePromotionCode()).not.toBe(generatePromotionCode())
  })
})

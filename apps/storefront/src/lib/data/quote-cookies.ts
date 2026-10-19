import "server-only"
import { cookies as nextCookies } from "next/headers"

const COOKIE_PREFIX = "wf_quote_"
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7

// Anonymous buyers have no session, so the one-time access token that proves
// ownership of a quote request is kept in an httpOnly cookie keyed by request id.
export const setQuoteToken = async (id: string, token: string) => {
  const cookies = await nextCookies()
  cookies.set(`${COOKIE_PREFIX}${id}`, token, {
    maxAge: MAX_AGE_SECONDS,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })
}

export const getQuoteToken = async (id: string): Promise<string | undefined> => {
  const cookies = await nextCookies()
  return cookies.get(`${COOKIE_PREFIX}${id}`)?.value
}

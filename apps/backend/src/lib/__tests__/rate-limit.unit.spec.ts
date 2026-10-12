import type {
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { createRateLimiter, registerHit } from "../rate-limit"
import type { RateLimitState } from "../rate-limit"

describe("registerHit", () => {
  const options = { windowMs: 1000, max: 3 }

  it("counts the first hit and starts a window", () => {
    const result = registerHit(undefined, 0, options)

    expect(result.limited).toBe(false)
    expect(result.state).toEqual({ count: 1, resetAt: 1000 })
  })

  it("limits once the window budget is exhausted", () => {
    let state: RateLimitState | undefined = undefined
    const limited: boolean[] = []

    for (let i = 0; i < 4; i++) {
      const result = registerHit(state, 100, options)
      state = result.state
      limited.push(result.limited)
    }

    expect(limited).toEqual([false, false, false, true])
  })

  it("reports the remaining wait when limited", () => {
    const result = registerHit({ count: 3, resetAt: 1000 }, 400, options)

    expect(result.limited).toBe(true)
    expect(result.retryAfterMs).toBe(600)
  })

  it("resets after the window elapses", () => {
    const result = registerHit({ count: 3, resetAt: 1000 }, 1000, options)

    expect(result.limited).toBe(false)
    expect(result.state).toEqual({ count: 1, resetAt: 2000 })
  })
})

type Fake = {
  req: MedusaRequest
  res: MedusaResponse & { statusCode?: number; body?: unknown }
  next: MedusaNextFunction & { calls: number }
}

function makeFake(ip: string): Fake {
  const res = {
    statusCode: undefined as number | undefined,
    body: undefined as unknown,
    setHeader() {
      return res
    },
    status(code: number) {
      res.statusCode = code
      return res
    },
    json(payload: unknown) {
      res.body = payload
      return res
    },
  }
  const next = Object.assign(() => undefined, { calls: 0 })

  return {
    req: { ip } as unknown as MedusaRequest,
    res: res as unknown as MedusaResponse & {
      statusCode?: number
      body?: unknown
    },
    next: next as unknown as MedusaNextFunction & { calls: number },
  }
}

describe("createRateLimiter", () => {
  it("passes requests through until the limit, then responds 429", () => {
    const limiter = createRateLimiter({ windowMs: 60_000, max: 2 })
    const fake = makeFake("1.2.3.4")

    limiter(fake.req, fake.res, fake.next)
    limiter(fake.req, fake.res, fake.next)

    expect(fake.res.statusCode).toBeUndefined()

    limiter(fake.req, fake.res, fake.next)

    expect(fake.res.statusCode).toBe(429)
    expect(fake.res.body).toMatchObject({ type: "rate_limit_exceeded" })
  })

  it("tracks each IP independently", () => {
    const limiter = createRateLimiter({ windowMs: 60_000, max: 1 })
    const a = makeFake("1.1.1.1")
    const b = makeFake("2.2.2.2")

    limiter(a.req, a.res, a.next)
    limiter(a.req, a.res, a.next)
    limiter(b.req, b.res, b.next)

    expect(a.res.statusCode).toBe(429)
    expect(b.res.statusCode).toBeUndefined()
  })
})

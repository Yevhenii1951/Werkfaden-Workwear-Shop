import {
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

export type RateLimitOptions = {
  windowMs: number
  max: number
  maxKeys?: number
}

export type RateLimitState = {
  count: number
  resetAt: number
}

export function registerHit(
  state: RateLimitState | undefined,
  now: number,
  options: Pick<RateLimitOptions, "windowMs" | "max">
): { state: RateLimitState; limited: boolean; retryAfterMs: number } {
  const { windowMs, max } = options

  if (!state || state.resetAt <= now) {
    return {
      state: { count: 1, resetAt: now + windowMs },
      limited: false,
      retryAfterMs: 0,
    }
  }

  const count = state.count + 1

  if (count > max) {
    return { state, limited: true, retryAfterMs: state.resetAt - now }
  }

  return {
    state: { count, resetAt: state.resetAt },
    limited: false,
    retryAfterMs: 0,
  }
}

function pruneExpired(buckets: Map<string, RateLimitState>, now: number): void {
  for (const [key, state] of buckets) {
    if (state.resetAt <= now) {
      buckets.delete(key)
    }
  }
}

export function createRateLimiter(options: RateLimitOptions) {
  const { maxKeys = 5000 } = options
  const buckets = new Map<string, RateLimitState>()

  return function rateLimitMiddleware(
    req: MedusaRequest,
    res: MedusaResponse,
    next: MedusaNextFunction
  ): void {
    const now = Date.now()
    const key = req.ip || "unknown"

    if (buckets.size >= maxKeys) {
      pruneExpired(buckets, now)

      if (buckets.size >= maxKeys) {
        const oldest = buckets.keys().next().value
        if (oldest !== undefined) {
          buckets.delete(oldest)
        }
      }
    }

    const result = registerHit(buckets.get(key), now, options)
    buckets.set(key, result.state)

    if (result.limited) {
      res.setHeader("Retry-After", Math.ceil(result.retryAfterMs / 1000))
      res.status(429).json({
        type: "rate_limit_exceeded",
        message: "Too many requests. Please try again later.",
      })
      return
    }

    next()
  }
}

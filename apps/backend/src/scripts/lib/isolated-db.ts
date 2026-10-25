import { MedusaError } from "@medusajs/framework/utils"

const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost", "::1"])

/**
 * Demo data must never land in a database somebody else shares. Every setup
 * script calls this before it writes, and the expected name comes from
 * `DB_NAME` so a rehearsal database can be seeded without editing code.
 */
export function assertIsolatedLocalDb(action: string): void {
  const rawUrl = process.env.DATABASE_URL ?? ""
  const expectedName = process.env.DB_NAME ?? "werkfaden_dev"

  let databaseUrl: URL
  try {
    databaseUrl = new URL(rawUrl)
  } catch {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `${action}: DATABASE_URL is missing or not a URL.`
    )
  }

  const databaseName = databaseUrl.pathname.replace(/^\//, "")

  if (!LOOPBACK_HOSTS.has(databaseUrl.hostname)) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      `${action}: refusing to write to "${databaseUrl.hostname}", only a local database may be seeded.`
    )
  }

  if (databaseName !== expectedName) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      `${action}: DATABASE_URL points at "${databaseName}" but DB_NAME is "${expectedName}"; align them or unset DB_NAME.`
    )
  }
}

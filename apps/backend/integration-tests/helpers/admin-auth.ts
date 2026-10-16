import { createUserAccountWorkflow } from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"
import type { MedusaContainer } from "@medusajs/framework/types"
import type { MedusaSuiteOptions } from "@medusajs/test-utils"

type Api = MedusaSuiteOptions["api"]
type Deps = { container: MedusaContainer; api: Api }

export const ADMIN_PASSWORD = "admin-test-password"

/**
 * Medusa 2.21.2 has no public route to create an admin user, so the identity
 * and user are created through the container and only the login goes over the
 * API. Returns the admin session token.
 */
export async function registerAndLoginAdmin(
  { container, api }: Deps,
  email: string
): Promise<string> {
  const auth = container.resolve(Modules.AUTH)
  const { authIdentity } = await auth.register("emailpass", {
    url: "/",
    headers: {},
    query: {},
    protocol: "http",
    body: { email, password: ADMIN_PASSWORD },
  })

  if (!authIdentity) {
    throw new Error(`Failed to register the admin auth identity for ${email}`)
  }

  await createUserAccountWorkflow(container).run({
    input: {
      authIdentityId: authIdentity.id,
      userData: { email, first_name: "Test", last_name: "Operator" },
    },
  })

  const login = await api.post("/auth/user/emailpass", { email, password: ADMIN_PASSWORD })

  return tokenFrom(login.data)
}

export function adminHeaders(token: string): { headers: Record<string, string> } {
  return { headers: { authorization: `Bearer ${token}` } }
}

function tokenFrom(data: unknown): string {
  if (
    typeof data === "object" &&
    data !== null &&
    "token" in data &&
    typeof data.token === "string"
  ) {
    return data.token
  }

  throw new Error("Admin authentication response did not include a token")
}

import type { MedusaSuiteOptions } from "@medusajs/test-utils"

type Api = MedusaSuiteOptions["api"]
type StoreHeaders = { headers: Record<string, string> }

export async function registerAndLoginCustomer(
  api: Api,
  storeHeaders: StoreHeaders,
  email: string
): Promise<string> {
  const password = "customer-test-password"

  const registration = await api.post(
    "/auth/customer/emailpass/register",
    { email, password },
    storeHeaders
  )
  const registrationToken = tokenFrom(registration.data)

  await api.post(
    "/store/customers",
    { email, first_name: "Test", last_name: "Customer" },
    { headers: { ...storeHeaders.headers, authorization: `Bearer ${registrationToken}` } }
  )

  const login = await api.post(
    "/auth/customer/emailpass",
    { email, password },
    storeHeaders
  )

  return tokenFrom(login.data)
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

  throw new Error("Customer authentication response did not include a token")
}

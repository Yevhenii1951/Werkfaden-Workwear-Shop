import { execFileSync } from "node:child_process"
import { rmSync } from "node:fs"
import { createConnection } from "node:net"
import { join } from "node:path"

const ROOT = join(import.meta.dirname, "..")
const BACKEND_HEALTH_URL = "http://localhost:9000/health"
const STOREFRONT_PORT = 8000

const fail = (message) => {
  console.error(`\n✖ ${message}\n`)
  process.exit(1)
}

const portIsOpen = (port) =>
  new Promise((resolve) => {
    const socket = createConnection({ port, host: "127.0.0.1" })
    socket.setTimeout(1000)
    socket.once("connect", () => {
      socket.destroy()
      resolve(true)
    })
    socket.once("timeout", () => {
      socket.destroy()
      resolve(false)
    })
    socket.once("error", () => resolve(false))
  })

const backendIsUp = async () => {
  try {
    const response = await fetch(BACKEND_HEALTH_URL, {
      signal: AbortSignal.timeout(3000),
    })
    return response.ok
  } catch {
    return false
  }
}

// The build collects page data from the backend, so a missing backend fails
// deep inside the route export instead of here.
if (!(await backendIsUp())) {
  fail(
    `backend not reachable on ${BACKEND_HEALTH_URL}. Start it first:\n  npm run backend:dev`
  )
}

// A dev server shares `apps/storefront/.next` and makes the build fail with
// "Cannot find module for page".
if (await portIsOpen(STOREFRONT_PORT)) {
  fail(
    `storefront dev server is running on port ${STOREFRONT_PORT}. Stop it first — it shares .next with the build, then run this again.`
  )
}

rmSync(join(ROOT, "apps/storefront/.next"), { recursive: true, force: true })
execFileSync("pnpm", ["--filter", "@dtc/storefront", "run", "build"], {
  cwd: ROOT,
  stdio: "inherit",
})

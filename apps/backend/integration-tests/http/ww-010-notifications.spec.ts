import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { Modules } from "@medusajs/framework/utils"
import { promises as fs } from "fs"
import os from "os"
import path from "path"
import { randomUUID } from "crypto"
import { seedCheckout, SYSTEM_PROVIDER_ID } from "../helpers/seed-checkout"
import { PERSONALIZATION_MODULE } from "../../src/modules/personalization"
import type PersonalizationModuleService from "../../src/modules/personalization/service"

jest.setTimeout(120 * 1000)

const SINK_DIR = path.join(os.tmpdir(), `ww010-mail-sink-${randomUUID()}`)

// The test runner reads `medusa-config.ts` before it applies the `env` option,
// so the sink directory has to be on `process.env` while the module loads.
process.env.MAIL_SINK_DIR = SINK_DIR
process.env.MAIL_FROM = "Werkfaden Demo <no-reply@werkfaden.test>"

async function sinkFiles(): Promise<string[]> {
  try {
    return (await fs.readdir(SINK_DIR)).filter((name) => name.endsWith(".eml"))
  } catch {
    return []
  }
}

async function waitForSinkFile(
  predicate: (content: string) => boolean,
  timeoutMs = 15000
): Promise<string> {
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    for (const name of await sinkFiles()) {
      const content = await fs.readFile(path.join(SINK_DIR, name), "utf8")
      if (predicate(content)) {
        return content
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }

  throw new Error("Timed out waiting for a matching email in the mail sink.")
}

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    const notificationService = () => getContainer().resolve(Modules.NOTIFICATION)

    beforeAll(async () => {
      await fs.rm(SINK_DIR, { recursive: true, force: true })
    })

    afterAll(async () => {
      await fs.rm(SINK_DIR, { recursive: true, force: true })
    })

    it("writes an order confirmation to the local mail sink when an order is placed", async () => {
      const checkout = await seedCheckout({ container: getContainer(), api })

      const { data: collection } = await api.post(
        "/store/payment-collections",
        { cart_id: checkout.cart.id },
        checkout.storeHeaders
      )
      await api.post(
        `/store/payment-collections/${collection.payment_collection.id}/payment-sessions`,
        { provider_id: SYSTEM_PROVIDER_ID },
        checkout.storeHeaders
      )

      const { data: completed } = await api.post(
        `/store/carts/${checkout.cart.id}/complete`,
        {},
        checkout.storeHeaders
      )
      expect(completed.type).toBe("order")

      const content = await waitForSinkFile((body) =>
        body.includes("Bestellbestätigung")
      )

      expect(content).toContain("To: buyer@example.com")
      expect(content).toContain(`#${completed.order.display_id}`)
      expect(content).toContain("keine echte Zahlung")
    })

    it("does not write a duplicate email for a repeated idempotency key", async () => {
      const input = {
        to: "repeat@example.de",
        channel: "email",
        template: "order-confirmation",
        content: { subject: "Idempotent", text: "Nur einmal." },
        idempotency_key: `ww010-idempotency-${randomUUID()}`,
      }

      const first = await notificationService().createNotifications([input])
      expect(first[0].status).toBe("success")

      const before = (await sinkFiles()).length

      const second = await notificationService().createNotifications([input])
      expect(second).toHaveLength(0)

      expect((await sinkFiles()).length).toBe(before)
    })

    it("writes a personalization acknowledgment when a request is created", async () => {
      const container = getContainer()
      const service = container.resolve<PersonalizationModuleService>(
        PERSONALIZATION_MODULE
      )

      const request = await service.createPersonalizationRequests({
        contact_name: "Maria Muster",
        contact_email: "logo@example.de",
        product_id: "prod_not_found",
        variant_id: "variant_not_found",
        quantity: 12,
        file_id: "private-test-file",
      })

      await container.resolve(Modules.EVENT_BUS).emit({
        name: "personalization-request.created",
        data: { id: request.id },
      })

      const content = await waitForSinkFile((body) =>
        body.includes(request.id)
      )

      expect(content).toContain("To: logo@example.de")
      expect(content).toContain("12")
    })

    it("rejects a notification for an unconfigured channel and records the failure", async () => {
      await expect(
        notificationService().createNotifications([
          {
            to: "+490000000000",
            channel: "sms",
            template: "order-confirmation",
            content: { subject: "SMS", text: "Nein." },
          },
        ])
      ).rejects.toThrow()
    })
  },
})

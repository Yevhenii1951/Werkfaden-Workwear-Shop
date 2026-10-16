import type { Logger, NotificationTypes } from "@medusajs/framework/types"
import { promises as fs } from "fs"
import os from "os"
import path from "path"
import { randomUUID } from "crypto"
import MailSinkNotificationService, {
  buildEml,
} from "../../modules/notification-sink/service"

const logger = {
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
} as unknown as Logger

function notification(
  overrides: Partial<NotificationTypes.ProviderSendNotificationDTO> = {}
): NotificationTypes.ProviderSendNotificationDTO {
  return {
    to: "buyer@example.de",
    channel: "email",
    template: "order-confirmation",
    content: { subject: "Bestellbestätigung", text: "Danke." },
    data: {},
    ...overrides,
  } as NotificationTypes.ProviderSendNotificationDTO
}

const tmpDir = () => path.join(os.tmpdir(), `mail-sink-${randomUUID()}`)

describe("buildEml", () => {
  it("writes required headers and a plain-text body", () => {
    const eml = buildEml({
      to: "buyer@example.de",
      from: "Werkfaden <no-reply@werkfaden.test>",
      subject: "Betreff",
      text: "Zeile",
    })

    expect(eml).toContain("To: buyer@example.de")
    expect(eml).toContain("Subject: Betreff")
    expect(eml).toContain('Content-Type: text/plain; charset="utf-8"')
    expect(eml).toContain("Zeile")
  })

  it("uses multipart/alternative when an html body is present", () => {
    const eml = buildEml({
      to: "buyer@example.de",
      from: "Werkfaden <no-reply@werkfaden.test>",
      subject: "Betreff",
      text: "Zeile",
      html: "<p>Zeile</p>",
    })

    expect(eml).toContain("multipart/alternative")
    expect(eml).toContain("<p>Zeile</p>")
  })
})

describe("MailSinkNotificationService", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("requires the dir option", () => {
    expect(() => MailSinkNotificationService.validateOptions({})).toThrow()
  })

  it("writes one .eml file per notification and returns its name", async () => {
    const dir = tmpDir()
    const service = new MailSinkNotificationService({ logger }, { dir })

    const result = await service.send(notification())

    const files = await fs.readdir(dir)
    expect(files).toHaveLength(1)
    expect(files[0]).toMatch(/\.eml$/)
    expect(result.id).toBe(files[0])

    const content = await fs.readFile(path.join(dir, files[0]), "utf8")
    expect(content).toContain("To: buyer@example.de")
    expect(content).toContain("Subject: Bestellbestätigung")

    await fs.rm(dir, { recursive: true, force: true })
  })

  it("fails loudly when the sink directory cannot be created", async () => {
    const dir = tmpDir()
    await fs.writeFile(dir, "not a directory")

    const service = new MailSinkNotificationService({ logger }, { dir })

    await expect(service.send(notification())).rejects.toThrow()
    expect(logger.error).toHaveBeenCalled()

    await fs.rm(dir, { force: true })
  })
})

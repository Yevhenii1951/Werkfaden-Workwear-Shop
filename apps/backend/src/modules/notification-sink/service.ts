import {
  AbstractNotificationProviderService,
  MedusaError,
} from "@medusajs/framework/utils"
import type { Logger, NotificationTypes } from "@medusajs/framework/types"
import { randomUUID } from "crypto"
import { promises as fs } from "fs"
import path from "path"

type InjectedDependencies = {
  logger: Logger
}

export type MailSinkOptions = {
  dir: string
  from?: string
}

export type SinkMessage = {
  to: string
  from: string
  subject: string
  text: string
  html?: string
}

function header(name: string, value: string): string {
  const clean = value.replace(/[\r\n]+/g, " ").trim()
  return `${name}: ${clean}\r\n`
}

export function buildEml(message: SinkMessage, date = new Date()): string {
  const hasHtml = Boolean(message.html)

  let body = message.text
  let contentType = 'text/plain; charset="utf-8"'

  if (hasHtml) {
    const boundary = `werkfaden-${randomUUID()}`
    contentType = `multipart/alternative; boundary="${boundary}"`
    body = [
      `--${boundary}`,
      'Content-Type: text/plain; charset="utf-8"',
      "",
      message.text,
      `--${boundary}`,
      'Content-Type: text/html; charset="utf-8"',
      "",
      message.html!,
      `--${boundary}--`,
      "",
    ].join("\r\n")
  }

  return (
    header("From", message.from) +
    header("To", message.to) +
    header("Subject", message.subject) +
    header("Date", date.toUTCString()) +
    "MIME-Version: 1.0\r\n" +
    header("Content-Type", contentType) +
    "\r\n" +
    body
  )
}

function subjectFor(notification: NotificationTypes.ProviderSendNotificationDTO): string {
  if (notification.content?.subject) {
    return notification.content.subject
  }

  switch (notification.template) {
    case "order-confirmation":
      return "Bestellbestätigung (Demo)"
    case "personalization-acknowledgment":
      return "Eingangsbestätigung Logo-Anfrage (Demo)"
    default:
      return `Werkfaden Demo – ${notification.template}`
  }
}

export default class MailSinkNotificationService extends AbstractNotificationProviderService {
  static identifier = "mail-sink"

  protected logger_: Logger
  protected options_: MailSinkOptions
  protected dir_: string
  protected from_: string

  static validateOptions(options: Record<string, any>): void {
    if (!options.dir) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "The mail-sink notification provider requires a `dir` option."
      )
    }
  }

  constructor({ logger }: InjectedDependencies, options: MailSinkOptions) {
    super()
    this.logger_ = logger
    this.options_ = options
    this.dir_ = path.resolve(process.cwd(), options.dir)
    this.from_ =
      options.from ?? "Werkfaden Demo <no-reply@werkfaden.test>"
  }

  async send(
    notification: NotificationTypes.ProviderSendNotificationDTO
  ): Promise<NotificationTypes.ProviderSendNotificationResultsDTO> {
    const message: SinkMessage = {
      to: notification.to,
      from: notification.from || this.from_,
      subject: subjectFor(notification),
      text: notification.content?.text ?? "",
      html: notification.content?.html ?? undefined,
    }

    const filename = `${Date.now()}-${randomUUID()}.eml`

    try {
      await fs.mkdir(this.dir_, { recursive: true })
      await fs.writeFile(
        path.join(this.dir_, filename),
        buildEml(message),
        "utf8"
      )
    } catch (error) {
      this.logger_.error(
        `mail-sink: failed to write notification for '${notification.to}' to '${this.dir_}': ${
          error instanceof Error ? error.message : String(error)
        }`
      )
      throw error
    }

    this.logger_.info(
      `mail-sink: wrote ${filename} for '${notification.to}' (template: ${notification.template})`
    )

    return { id: filename }
  }
}

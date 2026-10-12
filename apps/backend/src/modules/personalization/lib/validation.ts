import { z } from "@medusajs/framework/zod"
import { PersonalizationRequestStatus } from "../models/personalization-request"

export const MAX_LOGO_BYTES = 5 * 1024 * 1024
export const MAX_COMMENT_LENGTH = 1000
export const MAX_QUANTITY = 100000

export const LOGO_FORMATS = ["png", "jpeg", "webp"] as const
export type LogoFormat = (typeof LOGO_FORMATS)[number]

const LOGO_FORMAT_META: Record<
  LogoFormat,
  { mimeType: string; extension: string }
> = {
  png: { mimeType: "image/png", extension: ".png" },
  jpeg: { mimeType: "image/jpeg", extension: ".jpg" },
  webp: { mimeType: "image/webp", extension: ".webp" },
}

export function logoMimeType(format: LogoFormat): string {
  return LOGO_FORMAT_META[format].mimeType
}

export function logoFileExtension(format: LogoFormat): string {
  return LOGO_FORMAT_META[format].extension.slice(1)
}

export function isLogoFormat(value: unknown): value is LogoFormat {
  return (
    typeof value === "string" &&
    (LOGO_FORMATS as readonly string[]).includes(value)
  )
}

export function logoStorageFilename(
  format: LogoFormat,
  randomId: string
): string {
  return `${randomId}${LOGO_FORMAT_META[format].extension}`
}

export function detectImageType(buffer: Buffer): LogoFormat | null {
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "png"
  }
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "jpeg"
  }
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp"
  }
  return null
}

export const PersonalizationRequestInputSchema = z.object({
  contact_name: z.string().trim().min(1).max(120),
  contact_email: z.string().trim().email().max(200),
  company: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((value) => (value ? value : undefined)),
  product_id: z.string().trim().min(1).max(100),
  variant_id: z.string().trim().min(1).max(100),
  quantity: z.coerce.number().int().positive().max(MAX_QUANTITY),
  comment: z
    .string()
    .trim()
    .max(MAX_COMMENT_LENGTH)
    .optional()
    .transform((value) => (value ? value : undefined)),
})

export type PersonalizationRequestInput = z.infer<
  typeof PersonalizationRequestInputSchema
>

export function parsePersonalizationRequestInput(
  raw: unknown
): PersonalizationRequestInput {
  return PersonalizationRequestInputSchema.parse(raw)
}

const STATUS_TRANSITIONS: Record<
  PersonalizationRequestStatus,
  PersonalizationRequestStatus[]
> = {
  [PersonalizationRequestStatus.SUBMITTED]: [
    PersonalizationRequestStatus.REVIEWING,
    PersonalizationRequestStatus.REJECTED,
    PersonalizationRequestStatus.CLOSED,
  ],
  [PersonalizationRequestStatus.REVIEWING]: [
    PersonalizationRequestStatus.QUOTED,
    PersonalizationRequestStatus.REJECTED,
    PersonalizationRequestStatus.CLOSED,
  ],
  [PersonalizationRequestStatus.QUOTED]: [
    PersonalizationRequestStatus.REJECTED,
    PersonalizationRequestStatus.CLOSED,
  ],
  [PersonalizationRequestStatus.REJECTED]: [
    PersonalizationRequestStatus.CLOSED,
  ],
  [PersonalizationRequestStatus.CLOSED]: [],
}

export function isPersonalizationStatus(
  value: string
): value is PersonalizationRequestStatus {
  return (Object.values(PersonalizationRequestStatus) as string[]).includes(
    value
  )
}

export function canTransition(
  from: PersonalizationRequestStatus,
  to: PersonalizationRequestStatus
): boolean {
  return STATUS_TRANSITIONS[from]?.includes(to) ?? false
}

export function resolveCustomerId(auth?: {
  actor_id?: string
  actor_type?: string
}): string | null {
  return auth?.actor_type === "customer" ? (auth.actor_id ?? null) : null
}

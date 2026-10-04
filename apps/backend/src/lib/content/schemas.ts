import { z } from "zod"

const colorSchema = z.object({
  color_id: z.string().min(1),
  color_name_de: z.string().min(1),
  color_hex: z
    .string()
    .regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/, "invalid hex color"),
})

const variantSchema = z.object({
  sku: z
    .string()
    .min(1)
    .regex(/^[A-Z0-9-]+$/, "SKU must be uppercase alphanumeric/dashes"),
  size: z.string().min(1),
  color_id: z.string().min(1),
  color_name_de: z.string().min(1),
  color_hex: z
    .string()
    .regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/),
  price_gross_eur_cents: z.number().int().positive(),
  stock_quantity: z.number().int().min(0),
  weight_g: z.number().int().positive().optional(),
  image_keys: z.array(z.string().min(1)).optional(),
  customization_eligible: z.boolean().optional(),
})

const productSchema = z.object({
  content_id: z
    .string()
    .min(1)
    .regex(/^[A-Z0-9-]+$/),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/),
  name_de: z.string().min(1),
  category_id: z.string().min(1),
  subtitle_de: z.string().optional(),
  description_de: z.string().min(1),
  benefits_de: z.array(z.string().min(1)).optional(),
  material_de: z.string().min(1),
  fabric_weight_gsm: z.number().int().positive().optional(),
  fit_de: z.string().optional(),
  care_de: z.array(z.string().min(1)).optional(),
  size_guide_id: z.string().min(1),
  customization_eligible: z.boolean(),
  customization_note_de: z.string().optional(),
  seo_title_de: z.string().min(1).max(60).optional(),
  seo_description_de: z.string().min(1).max(160).optional(),
  image_keys: z.array(z.string().min(1)).optional(),
  variants: z.array(variantSchema).min(1),
})

const categorySchema = z.object({
  id: z.string().min(1).optional(),
  category_id: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  name_de: z.string().min(1),
  intro_de: z.string().optional(),
  seo_title_de: z.string().min(1).max(60).optional(),
  seo_description_de: z.string().min(1).max(160).optional(),
  image_key: z.string().optional(),
  filter_suggestions: z.array(z.string().min(1)).optional(),
})

export const ContentSchemas = {
  product: productSchema,
  products: z.array(productSchema),
  category: categorySchema,
  categories: z.array(categorySchema).min(1),
  variant: variantSchema,
  variants: z.array(variantSchema),
} as const

export type ContentProduct = z.infer<typeof productSchema>
export type ContentCategory = z.infer<typeof categorySchema>
export type ContentVariant = z.infer<typeof variantSchema>

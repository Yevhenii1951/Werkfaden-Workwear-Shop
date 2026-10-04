import * as fs from "fs"
import * as path from "path"
import { ContentSchemas } from "./schemas"

const CONTENT_DIR = path.resolve(
  process.cwd(),
  "..",
  "..",
  "docs",
  "content"
)

export interface ValidationResult {
  ok: boolean
  errors: string[]
  stats?: Record<string, unknown>
}

function readJson(file: string) {
  const full = path.join(CONTENT_DIR, file)
  if (!fs.existsSync(full)) {
    throw new Error(`Missing content file: ${file}`)
  }
  const raw = fs.readFileSync(full, "utf8")
  return JSON.parse(raw)
}

export function validateContentPackage(): ValidationResult {
  const errors: string[] = []
  const stats: Record<string, unknown> = {}

  try {
    const products = readJson("products.json") as unknown[]
    const pRes = ContentSchemas.products.safeParse(products)
    if (!pRes.success) {
      errors.push(`products.json: ${pRes.error.message}`)
    } else {
      stats.productCount = products.length
      const skus = new Set<string>()
      for (const pr of products) {
        for (const v of (pr as any).variants) {
          skus.add(v.sku)
        }
      }
      stats.skuCount = skus.size
      if (products.length !== 25) {
        errors.push(`products.json: expected 25 products, got ${products.length}`)
      }
      if (skus.size !== 25 * 6) {
        errors.push(`products.json: expected ${25 * 6} unique SKUs, got ${skus.size}`)
      }
      let all6 = true
      for (const pr of products) {
        if (!Array.isArray((pr as any).variants) || (pr as any).variants.length !== 6) {
          all6 = false
          break
        }
      }
      if (!all6) {
        errors.push("products.json: every product must have exactly 6 variants")
      }
    }
  } catch (e) {
    errors.push(`products.json: ${(e as Error).message}`)
  }

  try {
    const cats = readJson("categories.json") as unknown[]
    const cRes = ContentSchemas.categories.safeParse(cats)
    if (!cRes.success) {
      errors.push(`categories.json: ${cRes.error.message}`)
    } else {
      stats.categoryCount = cats.length
      const hasCatId = cats.every((c: any) => c.category_id || c.id)
      if (!hasCatId) {
        errors.push("categories.json: every category must have category_id or id")
      }
    }
  } catch (e) {
    errors.push(`categories.json: ${(e as Error).message}`)
  }

  try {
    const faq = readJson("faq.json") as unknown[]
    if (!Array.isArray(faq)) {
      errors.push("faq.json: must be an array")
    } else {
      stats.faqCount = faq.length
      if (faq.length !== 18) {
        errors.push(`faq.json: expected 18 entries, got ${faq.length}`)
      }
    }
  } catch (e) {
    errors.push(`faq.json: ${(e as Error).message}`)
  }

  try {
    const ui = readJson("ui.de.json") as unknown
    if (typeof ui !== "object" || ui === null) {
      errors.push("ui.de.json: must be an object")
    }
  } catch (e) {
    errors.push(`ui.de.json: ${(e as Error).message}`)
  }

  try {
    const pol = readJson("demo-policies.json") as unknown
    if (typeof pol !== "object" || pol === null) {
      errors.push("demo-policies.json: must be an object")
    }
  } catch (e) {
    errors.push(`demo-policies.json: ${(e as Error).message}`)
  }

  try {
    const sg = readJson("size-guides.json") as unknown
    if (typeof sg !== "object" || sg === null) {
      errors.push("size-guides.json: must be an object")
    }
  } catch (e) {
    errors.push(`size-guides.json: ${(e as Error).message}`)
  }

  try {
    const img = readJson("image-manifest.json") as unknown[]
    if (!Array.isArray(img)) {
      errors.push("image-manifest.json: must be an array")
    }
  } catch (e) {
    errors.push(`image-manifest.json: ${(e as Error).message}`)
  }

  const uploadForbidden = [
    /\.AI\b/i,
    /\.EPS\b/i,
    /\.SVG\b/i,
    /\.PDF\b/i,
  ]
  const checkForbidden = (text: string, file: string) => {
    for (const r of uploadForbidden) {
      if (r.test(text)) {
        errors.push(`${file}: must not reference SVG/PDF/AI/EPS (raster-only in MVP)`)
        break
      }
    }
  }
  try {
    checkForbidden(fs.readFileSync(path.join(CONTENT_DIR, "faq.json"), "utf8"), "faq.json")
  } catch {}
  try {
    checkForbidden(fs.readFileSync(path.join(CONTENT_DIR, "ui.de.json"), "utf8"), "ui.de.json")
  } catch {}
  try {
    checkForbidden(fs.readFileSync(path.join(CONTENT_DIR, "pages.md"), "utf8"), "pages.md")
  } catch {}

  return {
    ok: errors.length === 0,
    errors,
    stats,
  }
}

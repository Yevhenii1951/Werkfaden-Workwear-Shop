import {
  MedusaResponse,
  MedusaStoreRequest,
} from "@medusajs/framework/http"
import { estimateEmbroidery } from "../../../../lib/embroidery/estimate"
import type { EstimateEmbroideryBody } from "../../../../lib/embroidery/validation"

// Public, server-authoritative surcharge estimate. The client sends only the
// configuration (position, garment, stitch count, quantity); every price is
// derived here from the documented rate table — never from client input.
export async function POST(
  req: MedusaStoreRequest<EstimateEmbroideryBody>,
  res: MedusaResponse
): Promise<void> {
  const estimate = estimateEmbroidery(req.validatedBody)

  res.json({ estimate })
}

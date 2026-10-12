import {
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
  configureStoreSearch,
  defineMiddlewares,
  validateAndTransformBody,
} from '@medusajs/framework/http'
import multer from 'multer'
import { createRateLimiter } from '../lib/rate-limit'
import { MAX_LOGO_BYTES } from '../modules/personalization/lib/validation'
import { UpdatePersonalizationRequestStatusSchema } from './admin/personalization-requests/[id]/status/route'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_LOGO_BYTES, files: 1 },
})

const parseLogo = upload.single('logo')

// Multer reports size/limits violations as its own error class, which the core
// error handler would surface as a 500. Map them to a 400 before they get there.
function uploadLogo(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
): void {
  parseLogo(req, res, (error: unknown) => {
    if (error && (error as { name?: string }).name === 'MulterError') {
      const code = (error as { code?: string }).code
      res.status(400).json({
        type: 'invalid_data',
        message:
          code === 'LIMIT_FILE_SIZE'
            ? 'Logo must be at most 5 MiB.'
            : 'Invalid logo upload.',
      })
      return
    }

    next(error)
  })
}

const personalizationRateLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 5,
})

// The product index declares filterable `status` and `sales_channel_ids`, so
// the route narrows it to published products in the key's sales channels.
export default defineMiddlewares({
  routes: [
    {
      method: ['POST'],
      matcher: '/store/search',
      middlewares: [
        configureStoreSearch({
          allowed_indexes: {
            product: true,
          },
        }),
      ],
    },
    {
      method: ['POST'],
      matcher: '/store/personalization-requests',
      middlewares: [personalizationRateLimiter, uploadLogo],
    },
    {
      method: ['POST'],
      matcher: '/admin/personalization-requests/:id/status',
      middlewares: [
        validateAndTransformBody(UpdatePersonalizationRequestStatusSchema),
      ],
    },
  ],
})

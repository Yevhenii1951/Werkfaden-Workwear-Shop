import {
  MedusaStoreRequest,
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
  authenticate,
  configureStoreSearch,
  defineMiddlewares,
  validateAndTransformBody,
} from '@medusajs/framework/http'
import { ContainerRegistrationKeys, MedusaError } from '@medusajs/framework/utils'
import multer from 'multer'
import { createRateLimiter } from '../lib/rate-limit'
import { MAX_LOGO_BYTES } from '../modules/personalization/lib/validation'
import { UpdatePersonalizationRequestStatusSchema } from './admin/personalization-requests/[id]/status/route'
import { UpdateQuoteStatusSchema } from './admin/quotes/[id]/status/route'

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

async function enforceCustomerOrderOwnership(
  req: MedusaStoreRequest,
  _: MedusaResponse,
  next: MedusaNextFunction
): Promise<void> {
  const customerId = req.auth_context?.actor_id

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: [order] } = await query.graph({
    entity: 'order',
    fields: ['id', 'customer_id'],
    filters: { id: req.params.id },
  })

  let orderBelongsToRequester = !order?.customer_id

  if (customerId) {
    orderBelongsToRequester = order?.customer_id === customerId
  } else if (order?.customer_id) {
    const { data: [customer] } = await query.graph({
      entity: 'customer',
      fields: ['id', 'has_account'],
      filters: { id: order.customer_id },
    })
    orderBelongsToRequester = customer?.has_account === false
  }

  if (order && !orderBelongsToRequester) {
    return next(
      new MedusaError(
        MedusaError.Types.UNAUTHORIZED,
        'You are not allowed to retrieve this order.'
      )
    )
  }

  next()
}

const personalizationRateLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 5,
})

const quoteRateLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 10,
})

const optionalCustomerAuth = authenticate('customer', ['session', 'bearer'], {
  allowUnauthenticated: true,
})

// The product index declares filterable `status` and `sales_channel_ids`, so
// the route narrows it to published products in the key's sales channels.
export default defineMiddlewares({
  routes: [
    {
      method: ['GET'],
      matcher: '/store/orders/:id',
      middlewares: [
        authenticate('customer', ['session', 'bearer'], {
          allowUnauthenticated: true,
        }),
        enforceCustomerOrderOwnership,
      ],
    },
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
    {
      method: ['POST'],
      matcher: '/store/quotes',
      middlewares: [optionalCustomerAuth, quoteRateLimiter],
    },
    {
      method: ['GET'],
      matcher: '/store/quotes',
      middlewares: [authenticate('customer', ['session', 'bearer'])],
    },
    {
      method: ['GET', 'POST'],
      matcher: '/store/quotes/:id*',
      middlewares: [optionalCustomerAuth],
    },
    {
      method: ['POST'],
      matcher: '/admin/quotes/:id/status',
      middlewares: [validateAndTransformBody(UpdateQuoteStatusSchema)],
    },
  ],
})

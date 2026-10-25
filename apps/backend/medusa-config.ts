import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    }
  },
  modules: [
    {
      resolve: './src/modules/personalization',
    },
    {
      resolve: './src/modules/quote',
    },
    {
      resolve: '@medusajs/medusa/notification',
      options: {
        providers: [
          {
            resolve: './src/modules/notification-sink',
            id: 'mail-sink',
            options: {
              dir: process.env.MAIL_SINK_DIR || 'mail-sink',
              from: process.env.MAIL_FROM,
              channels: ['email'],
            },
          },
        ],
      },
    },
    {
      resolve: '@medusajs/medusa/payment',
      options: {
        providers: [
          {
            resolve: '@medusajs/medusa/payment-stripe',
            id: 'stripe',
            options: {
              apiKey: process.env.STRIPE_API_KEY,
              webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
              capture: true,
            },
          },
        ],
      },
    },
    {
      resolve: '@medusajs/medusa/file',
      options: {
        providers: [
          {
            resolve: '@medusajs/file-local',
            id: 'local',
            options: {
              upload_dir: 'static',
              // Never the same directory as `upload_dir`: the framework serves
              // `static/` at `/static` for everyone, so a private file placed
              // there is public as soon as its name is known. The local
              // provider reads private files from this directory for the
              // authenticated admin download route.
              private_upload_dir: 'private',
              backend_url: `${
                process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000'
              }/static`,
            },
          },
        ],
      },
    },
  ],
})

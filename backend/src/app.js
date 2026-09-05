import express from 'express'
import cors from 'cors'
import healthRouter from './routes/health.js'
import authRouter from './routes/auth.js'
import lehrasRouter from './routes/lehras.js'
import favoritesRouter from './routes/favorites.js'

export function createApp() {
  const app = express()

  // CLIENT_ORIGIN can be a single origin or a comma-separated list (e.g. a
  // production domain plus Vercel preview URLs). Unset means allow any
  // origin, which is fine for local dev but should be set in production.
  const allowedOrigins = process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(',').map((o) => o.trim())
    : '*'

  app.use(
    cors({
      origin: allowedOrigins === '*' ? '*' : allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  )
  app.use(express.json())

  // Support both /api prefixed routes and root routes
  app.use('/api/health', healthRouter)
  app.use('/health', healthRouter)

  app.use('/api/auth', authRouter)
  app.use('/auth', authRouter)

  app.use('/api/lehras', lehrasRouter)
  app.use('/lehras', lehrasRouter)

  app.use('/api/favorites', favoritesRouter)
  app.use('/favorites', favoritesRouter)

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  })

  return app
}

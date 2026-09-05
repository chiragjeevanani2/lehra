import express from 'express'
import cors from 'cors'
import healthRouter from './routes/health.js'
import authRouter from './routes/auth.js'
import lehrasRouter from './routes/lehras.js'
import favoritesRouter from './routes/favorites.js'

export function createApp() {
  const app = express()

  // Robust CORS handler that reliably sets headers for Vercel, localhost, and preview URLs
  app.use((req, res, next) => {
    const origin = req.headers.origin
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin)
      res.setHeader('Access-Control-Allow-Credentials', 'true')
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*')
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept')
    res.setHeader('Vary', 'Origin')

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204)
    }
    next()
  })
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

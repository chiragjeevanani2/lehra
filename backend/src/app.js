import express from 'express'
import cors from 'cors'
import healthRouter from './routes/health.js'
import authRouter from './routes/auth.js'
import lehrasRouter from './routes/lehras.js'
import favoritesRouter from './routes/favorites.js'

export function createApp() {
  const app = express()

  app.use(cors())
  app.use(express.json())

  app.use('/api/health', healthRouter)
  app.use('/api/auth', authRouter)
  app.use('/api/lehras', lehrasRouter)
  app.use('/api/favorites', favoritesRouter)

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  })

  return app
}

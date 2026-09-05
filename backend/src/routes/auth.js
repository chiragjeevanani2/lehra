import { Router } from 'express'
import bcrypt from 'bcryptjs'
import rateLimit from 'express-rate-limit'
import { User } from '../models/User.js'
import { signToken } from '../middleware/auth.js'

const router = Router()

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
})

function publicUser(user) {
  return { id: user._id.toString(), username: user.username, email: user.email }
}

router.post('/register', authLimiter, async (req, res) => {
  const { username, email, password } = req.body ?? {}
  if (typeof username !== 'string' || username.trim().length < 3) {
    return res.status(400).json({ error: 'username must be at least 3 characters' })
  }
  if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'a valid email is required' })
  }
  if (typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ error: 'password must be at least 8 characters' })
  }

  const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username: username.trim() }] })
  if (existing) {
    return res.status(409).json({ error: 'username or email already in use' })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ username: username.trim(), email: email.toLowerCase(), passwordHash })

  res.status(201).json({ token: signToken(user), user: publicUser(user) })
})

router.post('/login', authLimiter, async (req, res) => {
  const { email, password } = req.body ?? {}
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'email and password are required' })
  }

  const user = await User.findOne({ email: email.toLowerCase() })
  if (!user) {
    return res.status(401).json({ error: 'invalid email or password' })
  }
  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    return res.status(401).json({ error: 'invalid email or password' })
  }

  res.json({ token: signToken(user), user: publicUser(user) })
})

export default router

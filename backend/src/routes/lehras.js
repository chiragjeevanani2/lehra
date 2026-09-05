import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { Lehra } from '../models/Lehra.js'
import { User } from '../models/User.js'
import { requireAuth, optionalAuth } from '../middleware/auth.js'
import { validateLehraBody } from '../middleware/validateLehra.js'

const router = Router()

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
})

function serialize(lehra) {
  return {
    id: lehra._id.toString(),
    name: lehra.name,
    taal: lehra.taal,
    beatCount: lehra.beatCount,
    subdivision: lehra.subdivision,
    notes: lehra.notes,
    isPublic: lehra.isPublic,
    forkedFrom: lehra.forkedFrom ? lehra.forkedFrom.toString() : null,
    owner: lehra.ownerId?.username
      ? { id: lehra.ownerId._id.toString(), username: lehra.ownerId.username }
      : { id: lehra.ownerId.toString() },
    createdAt: lehra.createdAt,
    updatedAt: lehra.updatedAt,
  }
}

// GET /api/lehras?taal=&beatCount=&search=&owner=&mine=
router.get('/', optionalAuth, async (req, res) => {
  const { taal, beatCount, search, owner, mine } = req.query

  if (mine === 'true') {
    if (!req.user) return res.status(401).json({ error: 'Authentication required for mine=true' })
    const query = { ownerId: req.user.id }
    if (taal) query.taal = taal
    if (beatCount) query.beatCount = Number(beatCount)
    const lehras = await Lehra.find(query).sort({ createdAt: -1 }).limit(200).populate('ownerId', 'username')
    return res.json(lehras.map(serialize))
  }

  const query = { isPublic: true }
  if (taal) query.taal = taal
  if (beatCount) query.beatCount = Number(beatCount)
  if (search) query.$text = { $search: String(search) }
  if (owner) {
    const ownerUser = await User.findOne({ username: owner })
    query.ownerId = ownerUser ? ownerUser._id : null
  }

  const lehras = await Lehra.find(query).sort({ createdAt: -1 }).limit(200).populate('ownerId', 'username')
  res.json(lehras.map(serialize))
})

router.get('/:id', optionalAuth, async (req, res) => {
  const lehra = await Lehra.findById(req.params.id).populate('ownerId', 'username')
  if (!lehra) return res.status(404).json({ error: 'Lehra not found' })
  if (!lehra.isPublic && lehra.ownerId._id.toString() !== req.user?.id) {
    return res.status(403).json({ error: 'This lehra is private' })
  }
  res.json(serialize(lehra))
})

router.post('/', requireAuth, writeLimiter, validateLehraBody, async (req, res) => {
  const lehra = await Lehra.create({ ...req.validatedLehra, ownerId: req.user.id })
  await lehra.populate('ownerId', 'username')
  res.status(201).json(serialize(lehra))
})

router.put('/:id', requireAuth, writeLimiter, validateLehraBody, async (req, res) => {
  const lehra = await Lehra.findById(req.params.id)
  if (!lehra) return res.status(404).json({ error: 'Lehra not found' })
  if (lehra.ownerId.toString() !== req.user.id) {
    return res.status(403).json({ error: 'You do not own this lehra' })
  }
  Object.assign(lehra, req.validatedLehra)
  await lehra.save()
  await lehra.populate('ownerId', 'username')
  res.json(serialize(lehra))
})

router.post('/:id/fork', requireAuth, writeLimiter, async (req, res) => {
  const source = await Lehra.findById(req.params.id)
  if (!source) return res.status(404).json({ error: 'Lehra not found' })
  if (!source.isPublic && source.ownerId.toString() !== req.user.id) {
    return res.status(403).json({ error: 'This lehra is private' })
  }

  const fork = await Lehra.create({
    name: typeof req.body?.name === 'string' && req.body.name.trim() ? req.body.name.trim() : `${source.name} (fork)`,
    taal: source.taal,
    beatCount: source.beatCount,
    subdivision: source.subdivision,
    notes: source.notes,
    isPublic: true,
    ownerId: req.user.id,
    forkedFrom: source._id,
  })
  await fork.populate('ownerId', 'username')
  res.status(201).json(serialize(fork))
})

export default router

import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { Favorite } from '../models/Favorite.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
})

function serialize(fav) {
  return {
    id: fav._id.toString(),
    instrumentId: fav.instrumentId,
    variant: fav.variant,
    bpm: fav.bpm,
    semitones: fav.semitones,
    rootNote: fav.rootNote,
    lehraName: fav.lehraName,
    createdAt: fav.createdAt,
  }
}

router.get('/', requireAuth, async (req, res) => {
  const favorites = await Favorite.find({ ownerId: req.user.id }).sort({ createdAt: -1 })
  res.json(favorites.map(serialize))
})

router.post('/', requireAuth, writeLimiter, async (req, res) => {
  const { instrumentId, variant, bpm, semitones, rootNote, lehraName } = req.body ?? {}
  if (typeof instrumentId !== 'string' || !instrumentId) {
    return res.status(400).json({ error: 'instrumentId is required' })
  }
  const bpmNum = Number(bpm)
  if (!Number.isFinite(bpmNum) || bpmNum < 20 || bpmNum > 400) {
    return res.status(400).json({ error: 'bpm must be between 20 and 400' })
  }
  if (typeof rootNote !== 'string' || !rootNote) {
    return res.status(400).json({ error: 'rootNote is required' })
  }

  const favorite = await Favorite.create({
    ownerId: req.user.id,
    instrumentId,
    variant: variant === 'wet' ? 'wet' : 'dry',
    bpm: bpmNum,
    semitones: Number(semitones) || 0,
    rootNote,
    lehraName: typeof lehraName === 'string' ? lehraName : 'Lehra',
  })
  res.status(201).json(serialize(favorite))
})

router.delete('/:id', requireAuth, async (req, res) => {
  const favorite = await Favorite.findById(req.params.id)
  if (!favorite) return res.status(404).json({ error: 'Favorite not found' })
  if (favorite.ownerId.toString() !== req.user.id) {
    return res.status(403).json({ error: 'You do not own this favorite' })
  }
  await favorite.deleteOne()
  res.status(204).end()
})

export default router

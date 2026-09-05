const ALLOWED_SUBDIVISIONS = [1, 2, 4, 8, 16, 32]

export function validateLehraPayload(body, { partial = false } = {}) {
  const errors = []
  const clean = {}

  if (!partial || body.name !== undefined) {
    if (typeof body.name !== 'string' || !body.name.trim()) {
      errors.push('name is required')
    } else {
      clean.name = body.name.trim().slice(0, 80)
    }
  }

  if (!partial || body.taal !== undefined) {
    if (typeof body.taal !== 'string' || !body.taal.trim()) {
      errors.push('taal is required')
    } else {
      clean.taal = body.taal.trim().slice(0, 40)
    }
  }

  if (!partial || body.beatCount !== undefined) {
    const beatCount = Number(body.beatCount)
    if (!Number.isInteger(beatCount) || beatCount < 1 || beatCount > 64) {
      errors.push('beatCount must be an integer between 1 and 64')
    } else {
      clean.beatCount = beatCount
    }
  }

  if (!partial || body.subdivision !== undefined) {
    const subdivision = Number(body.subdivision)
    if (!ALLOWED_SUBDIVISIONS.includes(subdivision)) {
      errors.push(`subdivision must be one of ${ALLOWED_SUBDIVISIONS.join(', ')}`)
    } else {
      clean.subdivision = subdivision
    }
  }

  if (!partial || body.notes !== undefined) {
    if (!Array.isArray(body.notes)) {
      errors.push('notes must be an array')
    } else if (body.notes.length > 4096) {
      errors.push('notes array is too large')
    } else {
      const notes = []
      for (const n of body.notes) {
        const step = Number(n?.step)
        const semitone = Number(n?.semitone)
        if (!Number.isInteger(step) || step < 0 || !Number.isFinite(semitone)) {
          errors.push('each note needs an integer step and a numeric semitone')
          break
        }
        const velocity = n?.velocity === undefined ? 1 : Number(n.velocity)
        notes.push({ step, semitone, velocity: Math.min(1, Math.max(0, velocity)) })
      }
      if (notes.length === body.notes.length) clean.notes = notes
    }
  }

  if (body.isPublic !== undefined) {
    clean.isPublic = Boolean(body.isPublic)
  }

  return { errors, clean }
}

export function validateLehraBody(req, res, next) {
  const { errors, clean } = validateLehraPayload(req.body, { partial: req.method === 'PUT' })
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join('; ') })
  }
  req.validatedLehra = clean
  next()
}

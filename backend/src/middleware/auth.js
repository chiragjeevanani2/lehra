import jwt from 'jsonwebtoken'

export function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), username: user.username }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  })
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' })
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = { id: payload.sub, username: payload.username }
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

// Populates req.user when a valid token is present, but doesn't reject the
// request otherwise. Used on routes that behave differently for owners vs.
// anonymous visitors (e.g. GET /api/lehras/:id).
export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET)
      req.user = { id: payload.sub, username: payload.username }
    } catch {
      // Ignore invalid tokens on optional-auth routes; treat as anonymous.
    }
  }
  next()
}

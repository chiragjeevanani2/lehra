// Per-note "swing" humanization: a small bounded random timing offset
// applied fresh every time a note is scheduled (not cached per step), so
// the same beat never nudges the same way twice but the offset is always
// capped tightly enough to keep the beat feel intact.

// Cap on how far a note can drift, as a fraction of one subdivision's
// duration. Tunable here; deliberately conservative so a 100% swing
// setting still never breaks the beat.
export const MAX_OFFSET_FRACTION = 0.1

export function swingOffsetSeconds(swingPercent, stepDurationSeconds, maxOffsetFraction = MAX_OFFSET_FRACTION) {
  if (!swingPercent) return 0
  const maxOffset = stepDurationSeconds * maxOffsetFraction * (swingPercent / 100)
  return (Math.random() * 2 - 1) * maxOffset
}

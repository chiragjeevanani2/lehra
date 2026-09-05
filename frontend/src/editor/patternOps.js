export const BLANK_PATTERN = {
  name: 'New Lehra',
  taal: 'Teentaal',
  beatCount: 16,
  subdivision: 4,
  notes: [],
}

export function toggleNote(pattern, step, semitone) {
  const exists = pattern.notes.some((n) => n.step === step && n.semitone === semitone)
  const notes = exists
    ? pattern.notes.filter((n) => !(n.step === step && n.semitone === semitone))
    : [...pattern.notes, { id: crypto.randomUUID(), step, semitone }]
  return { ...pattern, notes }
}

export function deleteStepRange(pattern, selection) {
  if (!selection) return pattern
  const notes = pattern.notes.filter((n) => n.step < selection.start || n.step > selection.end)
  return { ...pattern, notes }
}

export function shiftStepRange(pattern, selection, delta) {
  if (!selection) return pattern
  const totalSteps = pattern.beatCount * pattern.subdivision
  const notes = pattern.notes.map((n) => {
    if (n.step < selection.start || n.step > selection.end) return n
    const nextStep = Math.min(totalSteps - 1, Math.max(0, n.step + delta))
    return { ...n, step: nextStep }
  })
  return { ...pattern, notes }
}

export function resizePattern(pattern, changes) {
  const next = { ...pattern, ...changes }
  const totalSteps = next.beatCount * next.subdivision
  next.notes = next.notes.filter((n) => n.step < totalSteps)
  return next
}

export function convertPresetToPattern(preset) {
  const notes = []
  if (preset.steps) {
    preset.steps.forEach((stepVal, stepIdx) => {
      if (stepVal == null) return
      if (Array.isArray(stepVal)) {
        stepVal.forEach((st) => {
          notes.push({ id: crypto.randomUUID(), step: stepIdx, semitone: st })
        })
      } else {
        notes.push({ id: crypto.randomUUID(), step: stepIdx, semitone: stepVal })
      }
    })
  } else if (preset.notes) {
    preset.notes.forEach((n) => {
      notes.push({ id: crypto.randomUUID(), step: n.step, semitone: n.semitone })
    })
  }

  return {
    name: `${preset.name} (copy)`,
    taal: preset.taal || 'Teentaal',
    beatCount: preset.beatCount || 16,
    subdivision: preset.subdivision || 1,
    notes,
  }
}


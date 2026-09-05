import * as Tone from 'tone'

// Major-scale (Bilawal thaat) degree -> semitone offset from the root (Sa).
// Only used to spell out the hardcoded demo loop below in Sa-Re-Ga terms;
// the sequencer editor and playback engine work in semitones directly.
const MAJOR_SCALE_OFFSETS = [0, 2, 4, 5, 7, 9, 11, 12]
const degree = (i) => MAJOR_SCALE_OFFSETS[i]

// A single hardcoded lehra loop to get end-to-end playback working.
// `steps` holds one entry per subdivision: a semitone offset from the
// root, an array of semitone offsets for a chord, or null for a rest.
export const PRESET_LEHRAS = [
  {
    id: 'preset-teentaal',
    name: 'Simple Teentaal Loop',
    taal: 'Teentaal',
    beatCount: 16,
    subdivision: 1,
    steps: [
      degree(0), degree(0), degree(1), degree(0),
      degree(2), degree(2), degree(1), degree(0),
      degree(4), degree(4), degree(3), degree(2),
      degree(1), degree(1), degree(0), null,
    ],
  },
  {
    id: 'preset-keherwa',
    name: 'Keherwa Folk Lehra',
    taal: 'Keherwa',
    beatCount: 8,
    subdivision: 1,
    steps: [
      degree(0), degree(2), degree(4), degree(5),
      degree(7), degree(5), degree(4), degree(2),
    ],
  },
  {
    id: 'preset-dadra',
    name: 'Dadra Light Classical',
    taal: 'Dadra',
    beatCount: 6,
    subdivision: 1,
    steps: [
      degree(0), degree(2), degree(4),
      degree(5), degree(4), degree(2),
    ],
  },
  {
    id: 'preset-jhaptal',
    name: 'Jhaptal Vilambit Flow',
    taal: 'Jhaptal',
    beatCount: 10,
    subdivision: 1,
    steps: [
      degree(0), degree(1), degree(2), degree(4), degree(5),
      degree(7), degree(5), degree(4), degree(2), degree(0),
    ],
  },
  {
    id: 'preset-ektaal',
    name: 'Ektaal Drut Lehra',
    taal: 'Ektaal',
    beatCount: 12,
    subdivision: 1,
    steps: [
      degree(0), degree(0), degree(2), degree(2),
      degree(4), degree(4), degree(5), degree(5),
      degree(7), degree(5), degree(4), degree(2),
    ],
  },
  {
    id: 'preset-rupak',
    name: 'Rupak Classical Lehra',
    taal: 'Rupak',
    beatCount: 7,
    subdivision: 1,
    steps: [
      degree(0), degree(2), degree(3),
      degree(5), degree(7),
      degree(5), degree(2),
    ],
  },
]

export const DEFAULT_LEHRA = PRESET_LEHRAS[0]


// Quantization (subdivisions per matra) -> Tone.js time notation for one step.
export function subdivisionToTime(subdivision) {
  return `${subdivision * 4}n`
}

export function semitoneToNote(rootNote, semitone) {
  if (semitone == null) return null
  return Tone.Frequency(rootNote).transpose(semitone).toNote()
}

export function semitonesToNotes(rootNote, semitones) {
  if (semitones == null) return null
  if (Array.isArray(semitones)) return semitones.map((s) => semitoneToNote(rootNote, s))
  return [semitoneToNote(rootNote, semitones)]
}

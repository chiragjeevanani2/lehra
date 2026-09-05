import * as Tone from 'tone'

// Each instrument has a single sampled note (C4) captured in "dry" and
// "wet" (reverb) takes, from the bundled JSP Indian Instrumental Sounds
// pack (frontend/public/samples). Tone.Sampler pitches that one sample
// up/down to cover the notes the lehra/tanpura engines ask for.
export const INSTRUMENTS = {
  harmonium: { id: 'harmonium', label: 'Harmonium', icon: '🎹', sub: 'Traditional Reed Key' },
  sitar: { id: 'sitar', label: 'Sitar', icon: '🪕', sub: 'Classical Plucked Strings' },
  sarangi: { id: 'sarangi', label: 'Sarangi', icon: '🎻', sub: 'Bowed Classical Strings' },
  bansuriHigh: { id: 'bansuriHigh', label: 'Bansuri (High)', folder: 'bansuri-high', icon: '🪈', sub: 'High Bamboo Flute' },
  bansuriLow: { id: 'bansuriLow', label: 'Bansuri (Low)', folder: 'bansuri-low', icon: '🪈', sub: 'Deep Bass Bamboo Flute' },
  santur: { id: 'santur', label: 'Santur', icon: '🎼', sub: 'Hammered Dulcimer' },
  shehnai: { id: 'shehnai', label: 'Shehnai', icon: '🎺', sub: 'Double-reed Woodwind' },
  benjo: { id: 'benjo', label: 'Benjo', icon: '🎸', sub: 'Folk Keyed Zither' },
  chimta: { id: 'chimta', label: 'Chimta', icon: '🥢', sub: 'Percussive Folk Tongs' },
  tumbi: { id: 'tumbi', label: 'Tumbi', icon: '🪕', sub: 'High Single-string' },
}

export const INSTRUMENT_LIST = Object.values(INSTRUMENTS)

function sampleUrl(folder, variant) {
  return `/samples/${folder}/${variant}.wav`
}

// Returns { synth, play(note, duration, time), whenLoaded, dispose() }.
export function createInstrumentVoice(instrumentId, variant = 'dry') {
  const def = INSTRUMENTS[instrumentId] ?? INSTRUMENTS.sitar
  const folder = def.folder ?? def.id

  let resolveLoaded
  const whenLoaded = new Promise((resolve) => {
    resolveLoaded = resolve
  })

  const synth = new Tone.Sampler({
    urls: { C4: sampleUrl(folder, variant) },
    onload: () => resolveLoaded(),
  })

  return {
    synth,
    whenLoaded,
    play: (note, duration, time) => synth.triggerAttackRelease(note, duration, time),
    dispose: () => synth.dispose(),
  }
}

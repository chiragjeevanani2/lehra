import * as Tone from 'tone'

// Classic 4-string tanpura cycle in Indian Classical Music:
// 1st string: Tuning note (Pa: 5th below Sa, Ma: 4th below Sa, Ni: 7th below Sa)
// 2nd string: Jodi Sa 1 (Tonic rootNote)
// 3rd string: Jodi Sa 2 (Tonic rootNote)
// 4th string: Kharaj Sa (Lower octave tonic, -12 semitones)
function getTanpuraNotes(rootNote, tuning = 'pa') {
  const t = (semitones) => Tone.Frequency(rootNote).transpose(semitones).toNote()
  let firstStringSemitones = -5 // Pa (fifth below Sa, e.g. G3 if root is C4)
  if (tuning === 'ma') firstStringSemitones = -7 // Ma (fourth below Sa, e.g. F3 if root is C4)
  if (tuning === 'ni') firstStringSemitones = -1 // Ni (shuddha Nishad below Sa, e.g. B3)
  if (tuning === 'dha') firstStringSemitones = -3 // Dha (sixth below Sa, e.g. A3)

  return [t(firstStringSemitones), t(0), t(0), t(-12)]
}

export const TANPURA_SCALE_OPTIONS = [
  {
    group: 'Automatic Sync',
    items: [
      { id: 'match', label: 'Match Lehra (Auto)', sub: 'Follows lehra root pitch', icon: '🔗' },
    ],
  },
  {
    group: 'Madhya Saptak (Mid / Female: C4 - B4)',
    items: [
      { id: 'C4', label: 'C4 (Safed 1)', sub: 'Middle C', icon: '🎵' },
      { id: 'C#4', label: 'C#4 (Kali 1)', sub: '1 Kali', icon: '🎵' },
      { id: 'D4', label: 'D4 (Safed 2)', sub: '2 Safed', icon: '🎵' },
      { id: 'D#4', label: 'D#4 (Kali 2)', sub: '2 Kali', icon: '🎵' },
      { id: 'E4', label: 'E4 (Safed 3)', sub: '3 Safed', icon: '🎵' },
      { id: 'F4', label: 'F4 (Safed 4)', sub: '4 Safed', icon: '🎵' },
      { id: 'F#4', label: 'F#4 (Kali 3)', sub: '3 Kali', icon: '🎵' },
      { id: 'G4', label: 'G4 (Safed 5)', sub: '5 Safed (Pa)', icon: '🎵' },
      { id: 'G#4', label: 'G#4 (Kali 4)', sub: '4 Kali', icon: '🎵' },
      { id: 'A4', label: 'A4 (Safed 6)', sub: '6 Safed', icon: '🎵' },
      { id: 'A#4', label: 'A#4 (Kali 5)', sub: '5 Kali', icon: '🎵' },
      { id: 'B4', label: 'B4 (Safed 7)', sub: '7 Safed', icon: '🎵' },
    ],
  },
  {
    group: 'Mandra Saptak (Deep / Male: C3 - B3)',
    items: [
      { id: 'C3', label: 'C3 (Low Safed 1)', sub: 'Deep Male C', icon: '🎼' },
      { id: 'C#3', label: 'C#3 (Low Kali 1)', sub: 'Deep Male C#', icon: '🎼' },
      { id: 'D3', label: 'D3 (Low Safed 2)', sub: 'Deep Male D', icon: '🎼' },
      { id: 'D#3', label: 'D#3 (Low Kali 2)', sub: 'Deep Male D#', icon: '🎼' },
      { id: 'E3', label: 'E3 (Low Safed 3)', sub: 'Deep Male E', icon: '🎼' },
      { id: 'F3', label: 'F3 (Low Safed 4)', sub: 'Deep Male F', icon: '🎼' },
      { id: 'F#3', label: 'F#3 (Low Kali 3)', sub: 'Deep Male F#', icon: '🎼' },
      { id: 'G3', label: 'G3 (Low Safed 5)', sub: 'Deep Male G', icon: '🎼' },
      { id: 'G#3', label: 'G#3 (Low Kali 4)', sub: 'Deep Male G#', icon: '🎼' },
      { id: 'A3', label: 'A3 (Low Safed 6)', sub: 'Deep Male A', icon: '🎼' },
      { id: 'A#3', label: 'A#3 (Low Kali 5)', sub: 'Deep Male A#', icon: '🎼' },
      { id: 'B3', label: 'B3 (Low Safed 7)', sub: 'Deep Male B', icon: '🎼' },
    ],
  },
]

export function createTanpura(variant = 'wet') {
  let resolveLoaded
  const whenLoaded = new Promise((resolve) => {
    resolveLoaded = resolve
  })

  const synth = new Tone.Sampler({
    urls: { C4: `/samples/tanpura/${variant}.wav` },
    onload: () => resolveLoaded(),
  })
  const volume = new Tone.Volume(-14)
  synth.connect(volume)
  volume.toDestination()

  const state = {
    rootNote: 'C4',
    tuning: 'pa',
    isPlaying: false,
  }

  let intervalTimer = null
  let nextPluckTime = 0
  let stringIndex = 0

  // Pluck interval in seconds:
  // String 1 (Pa/Ma/Ni) -> 0.72s -> String 2 (Sa) -> 0.72s -> String 3 (Sa) -> 0.72s -> String 4 (Kharaj) -> 1.15s ring -> repeat
  const DELAYS = [0.72, 0.72, 0.72, 1.15]

  function schedule() {
    if (!state.isPlaying) return
    const now = Tone.now()
    // Schedule ahead 250ms using Web Audio hardware clock
    while (nextPluckTime < now + 0.25) {
      const notes = getTanpuraNotes(state.rootNote, state.tuning)
      const note = notes[stringIndex]
      const pluckTime = Math.max(now, nextPluckTime)
      synth.triggerAttack(note, pluckTime)

      const delay = DELAYS[stringIndex] ?? 0.75
      nextPluckTime += delay
      stringIndex = (stringIndex + 1) % notes.length
    }
  }

  return {
    whenLoaded,
    start(rootNote, tuning) {
      if (rootNote) state.rootNote = rootNote
      if (tuning) state.tuning = tuning
      if (state.isPlaying) return

      state.isPlaying = true
      stringIndex = 0
      nextPluckTime = Tone.now()
      schedule()

      if (intervalTimer) clearInterval(intervalTimer)
      intervalTimer = setInterval(schedule, 50)
    },
    stop() {
      state.isPlaying = false
      if (intervalTimer) {
        clearInterval(intervalTimer)
        intervalTimer = null
      }
      stringIndex = 0
    },
    setRootNote(rootNote) {
      state.rootNote = rootNote
    },
    setTuning(tuning) {
      state.tuning = tuning
    },
    setVolumeDb(db) {
      volume.volume.value = db
    },
    setMuted(muted) {
      volume.mute = muted
    },
    isPlaying() {
      return state.isPlaying
    },
    dispose() {
      state.isPlaying = false
      if (intervalTimer) {
        clearInterval(intervalTimer)
        intervalTimer = null
      }
      synth.dispose()
      volume.dispose()
    },
  }
}

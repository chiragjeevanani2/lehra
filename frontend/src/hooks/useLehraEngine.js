import { useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'
import { createInstrumentVoice } from '../audio/instruments'
import { createTanpura } from '../audio/tanpura'
import { DEFAULT_LEHRA, PRESET_LEHRAS, semitonesToNotes, subdivisionToTime } from '../audio/lehraPatterns'
import { swingOffsetSeconds } from '../audio/swing'

const MIN_SEMITONES = -12
const MAX_SEMITONES = 12
const BASE_ROOT = 'C4'

function volumePercentToDb(percent) {
  if (percent <= 0) return -Infinity
  // 0-100 -> roughly -40dB..0dB
  return (percent / 100) * 40 - 40
}

export function useLehraEngine() {
  const [currentLehra, setCurrentLehra] = useState(DEFAULT_LEHRA)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [instrumentId, setInstrumentId] = useState('harmonium')
  const [instrumentVolume, setInstrumentVolume] = useState(85)
  const [variant, setVariant] = useState('dry')
  const [loadedVoiceKey, setLoadedVoiceKey] = useState(null)
  const [loadedTanpuraVariant, setLoadedTanpuraVariant] = useState(null)
  const instrumentLoading = loadedVoiceKey !== `${instrumentId}:${variant}`
  const tanpuraLoading = loadedTanpuraVariant !== variant
  const [bpm, setBpm] = useState(105)
  const [semitones, setSemitones] = useState(0)
  const [tanpuraOn, setTanpuraOn] = useState(true)
  const [isTanpuraPlaying, setIsTanpuraPlaying] = useState(false)
  const [tanpuraVolume, setTanpuraVolume] = useState(35)
  const [tanpuraScale, setTanpuraScale] = useState('match') // 'match' or specific note like 'C4', 'C#4', etc.
  const [tanpuraTuning, setTanpuraTuning] = useState('pa') // 'pa', 'ma', 'ni', 'dha'
  const [swingPercent, setSwingPercent] = useState(0)

  const voiceRef = useRef(null)
  const tanpuraRef = useRef(null)
  const sequenceRef = useRef(null)
  const rootNoteRef = useRef(BASE_ROOT)
  const tanpuraOnRef = useRef(tanpuraOn)
  const isTanpuraPlayingRef = useRef(isTanpuraPlaying)
  const tanpuraVolumeRef = useRef(tanpuraVolume)
  const instrumentVolumeRef = useRef(instrumentVolume)
  const swingPercentRef = useRef(swingPercent)
  const currentLehraRef = useRef(currentLehra)

  const rootNote = Tone.Frequency(BASE_ROOT).transpose(semitones).toNote()
  const effectiveTanpuraRoot = tanpuraScale === 'match' ? rootNote : tanpuraScale
  const effectiveTanpuraRootRef = useRef(effectiveTanpuraRoot)
  const tanpuraTuningRef = useRef(tanpuraTuning)

  useEffect(() => {
    currentLehraRef.current = currentLehra
  }, [currentLehra])

  useEffect(() => {
    instrumentVolumeRef.current = instrumentVolume
    if (voiceRef.current?.synth?.volume) {
      voiceRef.current.synth.volume.value = volumePercentToDb(instrumentVolume)
    }
  }, [instrumentVolume])

  useEffect(() => {
    swingPercentRef.current = swingPercent
  }, [swingPercent])

  useEffect(() => {
    rootNoteRef.current = rootNote
  }, [rootNote])

  useEffect(() => {
    isTanpuraPlayingRef.current = isTanpuraPlaying
  }, [isTanpuraPlaying])

  useEffect(() => {
    effectiveTanpuraRootRef.current = effectiveTanpuraRoot
    tanpuraRef.current?.setRootNote(effectiveTanpuraRoot)
  }, [effectiveTanpuraRoot])

  useEffect(() => {
    tanpuraTuningRef.current = tanpuraTuning
    tanpuraRef.current?.setTuning(tanpuraTuning)
  }, [tanpuraTuning])

  // Setup / recreate sequence whenever the chosen lehra pattern changes.
  useEffect(() => {
    if (sequenceRef.current) {
      sequenceRef.current.dispose()
      sequenceRef.current = null
    }

    const pattern = currentLehra
    const stepTime = subdivisionToTime(pattern.subdivision ?? 1)
    const stepsCount = pattern.steps?.length || (pattern.beatCount * (pattern.subdivision ?? 1))
    const stepIndices = Array.from({ length: stepsCount }, (_, i) => i)

    const sequence = new Tone.Sequence(
      (time, step) => {
        Tone.Draw.schedule(() => {
          setCurrentStep(step)
        }, time)

        let stepData = null
        if (pattern.steps) {
          stepData = pattern.steps[step]
        } else if (pattern.notes) {
          const matchedNotes = pattern.notes.filter((n) => n.step === step)
          if (matchedNotes.length > 0) {
            stepData = matchedNotes.map((n) => n.semitone)
          }
        }

        const notes = semitonesToNotes(rootNoteRef.current, stepData)
        if (!notes) return
        const stepSeconds = Tone.Time(stepTime).toSeconds()
        notes.forEach((note) => {
          const offset = swingOffsetSeconds(swingPercentRef.current, stepSeconds)
          voiceRef.current?.play(note, stepTime, time + offset)
        })
      },
      stepIndices,
      stepTime,
    )

    sequence.start(0)
    sequenceRef.current = sequence

    Tone.Transport.bpm.value = bpm

    return () => {
      sequence.dispose()
    }
  }, [currentLehra])

  // Swap the melodic instrument voice when selection or dry/wet changes.
  useEffect(() => {
    let cancelled = false
    const voice = createInstrumentVoice(instrumentId, variant)
    voice.synth.toDestination()
    voiceRef.current = voice
    voice.whenLoaded.then(() => {
      if (!cancelled) setLoadedVoiceKey(`${instrumentId}:${variant}`)
    })
    return () => {
      cancelled = true
      voice.synth.dispose()
    }
  }, [instrumentId, variant])

  // Recreate the tanpura sample when dry/wet changes, preserving playback state.
  useEffect(() => {
    let cancelled = false
    const wasPlaying = isTanpuraPlayingRef.current
    const tanpura = createTanpura(variant)
    tanpura.setVolumeDb(volumePercentToDb(tanpuraVolumeRef.current))
    tanpura.setMuted(!tanpuraOnRef.current)
    tanpuraRef.current = tanpura
    tanpura.whenLoaded.then(() => {
      if (!cancelled) setLoadedTanpuraVariant(variant)
    })
    if (wasPlaying) {
      tanpura.start(effectiveTanpuraRootRef.current, tanpuraTuningRef.current)
    }
    return () => {
      cancelled = true
      tanpura.dispose()
    }
  }, [variant])

  // BPM changes apply live without restarting playback.
  useEffect(() => {
    Tone.Transport.bpm.rampTo(bpm, 0.1)
  }, [bpm])

  useEffect(() => {
    tanpuraOnRef.current = tanpuraOn
    tanpuraRef.current?.setMuted(!tanpuraOn)
  }, [tanpuraOn])

  useEffect(() => {
    tanpuraVolumeRef.current = tanpuraVolume
    tanpuraRef.current?.setVolumeDb(volumePercentToDb(tanpuraVolume))
  }, [tanpuraVolume])

  const startTanpura = async () => {
    await Tone.start()
    tanpuraRef.current?.start(effectiveTanpuraRootRef.current, tanpuraTuningRef.current)
    setIsTanpuraPlaying(true)
    setTanpuraOn(true)
  }

  const stopTanpura = () => {
    tanpuraRef.current?.stop()
    setIsTanpuraPlaying(false)
  }

  const toggleTanpura = async () => {
    if (isTanpuraPlaying) {
      stopTanpura()
    } else {
      await startTanpura()
    }
  }

  const play = async () => {
    await Tone.start()
    if (tanpuraOn && !isTanpuraPlaying) {
      tanpuraRef.current?.start(effectiveTanpuraRootRef.current, tanpuraTuningRef.current)
      setIsTanpuraPlaying(true)
    }
    Tone.Transport.start()
    setIsPlaying(true)
  }

  const pause = () => {
    Tone.Transport.pause()
    setIsPlaying(false)
    // Tanpura continues playing independently so user can continue riyaz / vocal drone!
  }

  const stop = () => {
    Tone.Transport.stop()
    tanpuraRef.current?.stop()
    setIsTanpuraPlaying(false)
    setIsPlaying(false)
  }

  const shiftSemitone = (delta) => {
    setSemitones((s) => Math.min(MAX_SEMITONES, Math.max(MIN_SEMITONES, s + delta)))
  }

  return {
    isPlaying,
    play,
    pause,
    stop,
    instrumentId,
    setInstrumentId,
    variant,
    setVariant,
    instrumentLoading,
    tanpuraLoading,
    bpm,
    setBpm,
    semitones,
    shiftSemitone,
    rootNote,
    // Tanpura controls
    tanpuraOn,
    setTanpuraOn,
    isTanpuraPlaying,
    startTanpura,
    stopTanpura,
    toggleTanpura,
    tanpuraVolume,
    setTanpuraVolume,
    tanpuraScale,
    setTanpuraScale,
    effectiveTanpuraRoot,
    tanpuraTuning,
    setTanpuraTuning,
    // Melodic instrument & lehra controls
    instrumentVolume,
    setInstrumentVolume,
    swingPercent,
    setSwingPercent,
    lehra: currentLehra,
    currentLehra,
    setCurrentLehra,
    currentStep,
  }
}

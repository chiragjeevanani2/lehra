import { useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'
import { createInstrumentVoice } from '../audio/instruments'
import { semitonesToNotes, subdivisionToTime } from '../audio/lehraPatterns'
import { swingOffsetSeconds } from '../audio/swing'

// Fixed reference pitch for auditioning a pattern in the editor. Root-note
// pitch shift lives on the Playback screen (useLehraEngine), not here.
const PREVIEW_ROOT = 'C4'

// Sequencer editor preview player with dynamic rootNote and swing.
export function useEditorPreview(pattern, instrumentId, variant, bpm, swingPercent = 0, rootNote = 'C4') {
  const { beatCount, subdivision, notes } = pattern
  const [isPlaying, setIsPlaying] = useState(false)
  const [playheadStep, setPlayheadStep] = useState(null)
  const [loadedVoiceKey, setLoadedVoiceKey] = useState(null)
  const instrumentLoading = loadedVoiceKey !== `${instrumentId}:${variant}`

  const voiceRef = useRef(null)
  const notesRef = useRef(notes)
  const swingPercentRef = useRef(swingPercent)
  const rootNoteRef = useRef(rootNote)

  useEffect(() => {
    rootNoteRef.current = rootNote
  }, [rootNote])

  useEffect(() => {
    notesRef.current = notes
  }, [notes])

  useEffect(() => {
    swingPercentRef.current = swingPercent
  }, [swingPercent])

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

  const totalSteps = beatCount * subdivision

  useEffect(() => {
    const stepTime = subdivisionToTime(subdivision)
    const sequence = new Tone.Sequence(
      (time, step) => {
        Tone.Draw.schedule(() => setPlayheadStep(step), time)
        const atStep = notesRef.current.filter((n) => n.step === step)
        if (atStep.length === 0) return
        const noteNames = semitonesToNotes(
          rootNoteRef.current,
          atStep.map((n) => n.semitone),
        )
        const stepSeconds = Tone.Time(stepTime).toSeconds()
        noteNames.forEach((note) => {
          const offset = swingOffsetSeconds(swingPercentRef.current, stepSeconds)
          voiceRef.current?.play(note, stepTime, time + offset)
        })
      },
      Array.from({ length: totalSteps }, (_, i) => i),
      stepTime,
    )
    sequence.start(0)
    return () => {
      sequence.dispose()
    }
  }, [totalSteps, subdivision])

  useEffect(() => {
    Tone.Transport.bpm.rampTo(bpm, 0.1)
  }, [bpm])

  useEffect(() => {
    return () => {
      Tone.Transport.stop()
      Tone.Transport.cancel()
    }
  }, [])

  const play = async () => {
    try {
      if (Tone.context.state !== 'running') {
        await Tone.start()
      }
      Tone.Transport.position = 0
      Tone.Transport.start()
      setIsPlaying(true)
    } catch (err) {
      console.error('Failed to start editor preview playback', err)
    }
  }

  const pause = () => {
    Tone.Transport.pause()
    setIsPlaying(false)
  }

  const stop = () => {
    Tone.Transport.stop()
    Tone.Transport.position = 0
    setIsPlaying(false)
    setPlayheadStep(null)
  }

  const previewNote = async (semitone) => {
    try {
      if (Tone.context.state !== 'running') {
        await Tone.start()
      }
      if (!voiceRef.current) return
      const noteNames = semitonesToNotes(rootNoteRef.current, [semitone])
      if (noteNames && noteNames[0]) {
        voiceRef.current.play(noteNames[0], '8n')
      }
    } catch {
      // silent fail if audio context cannot start synchronously
    }
  }

  return { isPlaying, play, pause, stop, instrumentLoading, playheadStep, previewNote }
}


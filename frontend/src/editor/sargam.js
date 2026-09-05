// 4 Full Octaves (49 chromatic rows):
// - C6 (Ati-Taar Saptak / High: semitones +24 to +36)
// - C5 (Taar Saptak / Upper: semitones +12 to +23)
// - C4 (Madhya Saptak / Middle: semitones 0 to +11)
// - C3 (Mandra Saptak / Lower: semitones -12 to -1)
//
// Ordered highest-to-lowest for piano roll vertical layout.
// isAccidental flags komal/teevra notes for DAW zebra shading.

export const SARGAM_ROWS = [
  // --- ATI-TAAR SAPTAK (C6 - C7) ---
  { semitone: 36, label: 'Sa', octave: 'C7', saptak: 'Ati-Taar', pitch: 'C7', isSa: true, isAccidental: false },
  { semitone: 35, label: 'Ni', octave: 'C6', saptak: 'Ati-Taar', pitch: 'B6', isAccidental: false },
  { semitone: 34, label: 'ni', octave: 'C6', saptak: 'Ati-Taar', pitch: 'A#6', isAccidental: true },
  { semitone: 33, label: 'Dha', octave: 'C6', saptak: 'Ati-Taar', pitch: 'A6', isAccidental: false },
  { semitone: 32, label: 'dha', octave: 'C6', saptak: 'Ati-Taar', pitch: 'G#6', isAccidental: true },
  { semitone: 31, label: 'Pa', octave: 'C6', saptak: 'Ati-Taar', pitch: 'G6', isAccidental: false },
  { semitone: 30, label: 'Ma', octave: 'C6', saptak: 'Ati-Taar', pitch: 'F#6', isAccidental: true },
  { semitone: 29, label: 'ma', octave: 'C6', saptak: 'Ati-Taar', pitch: 'F6', isAccidental: false },
  { semitone: 28, label: 'Ga', octave: 'C6', saptak: 'Ati-Taar', pitch: 'E6', isAccidental: false },
  { semitone: 27, label: 'ga', octave: 'C6', saptak: 'Ati-Taar', pitch: 'D#6', isAccidental: true },
  { semitone: 26, label: 'Re', octave: 'C6', saptak: 'Ati-Taar', pitch: 'D6', isAccidental: false },
  { semitone: 25, label: 're', octave: 'C6', saptak: 'Ati-Taar', pitch: 'C#6', isAccidental: true },

  // --- TAAR SAPTAK (C5 - C6) ---
  { semitone: 24, label: 'Sa', octave: 'C6', saptak: 'Taar', pitch: 'C6', isSa: true, isAccidental: false },
  { semitone: 23, label: 'Ni', octave: 'C5', saptak: 'Taar', pitch: 'B5', isAccidental: false },
  { semitone: 22, label: 'ni', octave: 'C5', saptak: 'Taar', pitch: 'A#5', isAccidental: true },
  { semitone: 21, label: 'Dha', octave: 'C5', saptak: 'Taar', pitch: 'A5', isAccidental: false },
  { semitone: 20, label: 'dha', octave: 'C5', saptak: 'Taar', pitch: 'G#5', isAccidental: true },
  { semitone: 19, label: 'Pa', octave: 'C5', saptak: 'Taar', pitch: 'G5', isAccidental: false },
  { semitone: 18, label: 'Ma', octave: 'C5', saptak: 'Taar', pitch: 'F#5', isAccidental: true },
  { semitone: 17, label: 'ma', octave: 'C5', saptak: 'Taar', pitch: 'F5', isAccidental: false },
  { semitone: 16, label: 'Ga', octave: 'C5', saptak: 'Taar', pitch: 'E5', isAccidental: false },
  { semitone: 15, label: 'ga', octave: 'C5', saptak: 'Taar', pitch: 'D#5', isAccidental: true },
  { semitone: 14, label: 'Re', octave: 'C5', saptak: 'Taar', pitch: 'D5', isAccidental: false },
  { semitone: 13, label: 're', octave: 'C5', saptak: 'Taar', pitch: 'C#5', isAccidental: true },

  // --- MADHYA SAPTAK (C4 - C5) ---
  { semitone: 12, label: 'Sa', octave: 'C5', saptak: 'Madhya', pitch: 'C5', isSa: true, isAccidental: false },
  { semitone: 11, label: 'Ni', octave: 'C4', saptak: 'Madhya', pitch: 'B4', isAccidental: false },
  { semitone: 10, label: 'ni', octave: 'C4', saptak: 'Madhya', pitch: 'A#4', isAccidental: true },
  { semitone: 9, label: 'Dha', octave: 'C4', saptak: 'Madhya', pitch: 'A4', isAccidental: false },
  { semitone: 8, label: 'dha', octave: 'C4', saptak: 'Madhya', pitch: 'G#4', isAccidental: true },
  { semitone: 7, label: 'Pa', octave: 'C4', saptak: 'Madhya', pitch: 'G4', isAccidental: false },
  { semitone: 6, label: 'Ma', octave: 'C4', saptak: 'Madhya', pitch: 'F#4', isAccidental: true },
  { semitone: 5, label: 'ma', octave: 'C4', saptak: 'Madhya', pitch: 'F4', isAccidental: false },
  { semitone: 4, label: 'Ga', octave: 'C4', saptak: 'Madhya', pitch: 'E4', isAccidental: false },
  { semitone: 3, label: 'ga', octave: 'C4', saptak: 'Madhya', pitch: 'D#4', isAccidental: true },
  { semitone: 2, label: 'Re', octave: 'C4', saptak: 'Madhya', pitch: 'D4', isAccidental: false },
  { semitone: 1, label: 're', octave: 'C4', saptak: 'Madhya', pitch: 'C#4', isAccidental: true },

  // --- MANDRA SAPTAK (C3 - C4) ---
  { semitone: 0, label: 'Sa', octave: 'C4', saptak: 'Madhya', pitch: 'C4', isSa: true, isMadhyaSa: true, isAccidental: false },
  { semitone: -1, label: 'Ni', octave: 'C3', saptak: 'Mandra', pitch: 'B3', isAccidental: false },
  { semitone: -2, label: 'ni', octave: 'C3', saptak: 'Mandra', pitch: 'A#3', isAccidental: true },
  { semitone: -3, label: 'Dha', octave: 'C3', saptak: 'Mandra', pitch: 'A3', isAccidental: false },
  { semitone: -4, label: 'dha', octave: 'C3', saptak: 'Mandra', pitch: 'G#3', isAccidental: true },
  { semitone: -5, label: 'Pa', octave: 'C3', saptak: 'Mandra', pitch: 'G3', isAccidental: false },
  { semitone: -6, label: 'Ma', octave: 'C3', saptak: 'Mandra', pitch: 'F#3', isAccidental: true },
  { semitone: -7, label: 'ma', octave: 'C3', saptak: 'Mandra', pitch: 'F3', isAccidental: false },
  { semitone: -8, label: 'Ga', octave: 'C3', saptak: 'Mandra', pitch: 'E3', isAccidental: false },
  { semitone: -9, label: 'ga', octave: 'C3', saptak: 'Mandra', pitch: 'D#3', isAccidental: true },
  { semitone: -10, label: 'Re', octave: 'C3', saptak: 'Mandra', pitch: 'D3', isAccidental: false },
  { semitone: -11, label: 're', octave: 'C3', saptak: 'Mandra', pitch: 'C#3', isAccidental: true },
  { semitone: -12, label: 'Sa', octave: 'C3', saptak: 'Mandra', pitch: 'C3', isSa: true, isAccidental: false },
]



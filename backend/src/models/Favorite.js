import { Schema, model } from 'mongoose'

const favoriteSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    instrumentId: { type: String, required: true },
    variant: { type: String, enum: ['dry', 'wet'], default: 'dry' },
    bpm: { type: Number, required: true, min: 20, max: 400 },
    semitones: { type: Number, default: 0, min: -12, max: 12 },
    rootNote: { type: String, required: true },
    lehraName: { type: String, required: true },
  },
  { timestamps: true },
)

export const Favorite = model('Favorite', favoriteSchema)

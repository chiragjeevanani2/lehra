import { Schema, model } from 'mongoose'

const noteSchema = new Schema(
  {
    step: { type: Number, required: true, min: 0 },
    semitone: { type: Number, required: true },
    velocity: { type: Number, default: 1, min: 0, max: 1 },
  },
  { _id: false },
)

const lehraSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    taal: { type: String, required: true, trim: true, maxlength: 40 },
    beatCount: { type: Number, required: true, min: 1, max: 64 },
    subdivision: { type: Number, required: true, enum: [1, 2, 4, 8, 16, 32] },
    notes: { type: [noteSchema], default: [] },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    isPublic: { type: Boolean, default: true },
    forkedFrom: { type: Schema.Types.ObjectId, ref: 'Lehra', default: null },
  },
  { timestamps: true },
)

lehraSchema.index({ name: 'text', taal: 'text' })

export const Lehra = model('Lehra', lehraSchema)

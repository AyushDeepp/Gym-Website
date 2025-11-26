import mongoose from 'mongoose';

const progressEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    weight: {
      type: Number,
      required: true,
    },
    bodyFat: {
      type: Number,
    },
    bmi: {
      type: Number,
    },
    notes: {
      type: String,
      trim: true,
    },
    photoUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const ProgressEntry = mongoose.model('ProgressEntry', progressEntrySchema);

export default ProgressEntry;



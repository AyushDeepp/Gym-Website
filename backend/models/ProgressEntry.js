import mongoose from 'mongoose';

const progressEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
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
    // Body measurements
    measurements: {
      chest: Number,
      waist: Number,
      hips: Number,
      arms: Number,
      thighs: Number,
      neck: Number,
    },
    // Strength metrics
    strengthMetrics: {
      benchPress: Number,
      squat: Number,
      deadlift: Number,
      overheadPress: Number,
      notes: String,
    },
    // Energy and wellness
    energy: {
      type: Number,
      min: 1,
      max: 10,
    },
    sleep: {
      hours: Number,
      quality: {
        type: Number,
        min: 1,
        max: 10,
      },
    },
    mood: {
      type: String,
      enum: ['excellent', 'good', 'okay', 'poor', 'terrible'],
    },
    notes: {
      type: String,
      trim: true,
    },
    photoUrl: {
      type: String,
    },
    // Goals tracking
    goals: {
      targetWeight: Number,
      targetBodyFat: Number,
      targetDate: Date,
      notes: String,
    },
  },
  {
    timestamps: true,
  }
);

const ProgressEntry = mongoose.model('ProgressEntry', progressEntrySchema);

export default ProgressEntry;



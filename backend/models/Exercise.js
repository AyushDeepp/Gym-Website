import mongoose from 'mongoose';

const setsRepsSchema = new mongoose.Schema(
  {
    strength: { type: String, default: '3-5 sets × 3–5 reps' },
    hypertrophy: { type: String, default: '3–4 × 8–12' },
    endurance: { type: String, default: '2–3 × 15–20' },
  },
  { _id: false }
);

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    muscleGroup: {
      type: String,
      required: true,
      enum: [
        'chest',
        'back',
        'shoulders',
        'arms',
        'legs',
        'core',
      ],
      index: true,
    },
    subMuscles: {
      type: [String],
      required: true,
      enum: [
        // Chest
        'upper chest',
        'middle chest',
        'lower chest',
        // Back
        'lats',
        'traps',
        'upper back',
        'lower back',
        'rhomboids',
        // Shoulders
        'front delts',
        'lateral delts',
        'rear delts',
        // Arms
        'biceps',
        'triceps',
        'forearms',
        // Legs
        'quads',
        'hamstrings',
        'glutes',
        'calves',
        // Core
        'upper abs',
        'lower abs',
        'obliques',
        'stability',
      ],
    },
    equipment: {
      type: [String],
      required: true,
      enum: [
        'bodyweight',
        'dumbbell',
        'barbell',
        'kettlebells',
        'cables',
        'machines',
        'resistance bands',
        'cardio machines',
        'none',
      ],
    },
    movementType: {
      type: String,
      required: true,
      enum: [
        'push',
        'pull',
        'squat',
        'hinge',
        'lunge',
        'rotation',
        'anti-rotation',
        'carry',
        'cardio',
        'isometric',
      ],
      index: true,
    },
    difficulty: {
      type: String,
      required: true,
      enum: ['beginner', 'intermediate', 'advanced'],
      index: true,
    },
    goals: {
      type: [String],
      required: true,
      enum: [
        'muscle building',
        'strength training',
        'fat loss conditioning',
        'mobility/stretching',
        'warm-up activation',
        'rehabilitation',
      ],
    },
    exerciseType: {
      type: String,
      enum: ['compound', 'isolation'],
      default: 'compound',
    },
    description: {
      type: String,
      required: true,
    },
    instructions: {
      type: [String],
      required: true,
    },
    cues: {
      type: [String],
      default: [],
    },
    setsReps: {
      type: setsRepsSchema,
      default: () => ({
        strength: '3-5 sets × 3–5 reps',
        hypertrophy: '3–4 × 8–12',
        endurance: '2–3 × 15–20',
      }),
    },
    videoUrl: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    commonMistakes: {
      type: [String],
      default: [],
    },
    variations: {
      type: [String],
      default: [],
    },
    alternativeNames: {
      type: [String],
      default: [],
    },
    safetyTips: {
      type: [String],
      default: [],
    },
    suggestedWarmups: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

// Generate slug from name before saving
exerciseSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Indexes for search optimization
exerciseSchema.index({ muscleGroup: 1, subMuscles: 1 });
exerciseSchema.index({ movementType: 1 });
exerciseSchema.index({ difficulty: 1 });
exerciseSchema.index({ equipment: 1 });
exerciseSchema.index({ exerciseType: 1 });
exerciseSchema.index({ name: 'text', description: 'text' });

const Exercise = mongoose.model('Exercise', exerciseSchema);

export default Exercise;

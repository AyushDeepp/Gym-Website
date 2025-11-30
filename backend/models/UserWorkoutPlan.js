import mongoose from 'mongoose';

const userExerciseSchema = new mongoose.Schema(
  {
    exerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sets: {
      type: Number,
      default: 3,
    },
    reps: {
      type: String,
      default: '8-12',
    },
    restTime: {
      type: String,
      default: '60-90 seconds',
    },
    notes: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const userWorkoutPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    goal: {
      type: String,
      trim: true,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    exercises: {
      type: [userExerciseSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index for user queries
userWorkoutPlanSchema.index({ userId: 1, isActive: 1 });

const UserWorkoutPlan = mongoose.model('UserWorkoutPlan', userWorkoutPlanSchema);

export default UserWorkoutPlan;







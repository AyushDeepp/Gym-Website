import mongoose from 'mongoose';

const userMealSchema = new mongoose.Schema(
  {
    time: {
      type: String,
      required: true,
      trim: true,
    },
    food: {
      type: String,
      required: true,
      trim: true,
    },
    calories: {
      type: Number,
      default: 0,
    },
    protein: {
      type: Number,
      default: 0,
    },
    carbs: {
      type: Number,
      default: 0,
    },
    fats: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const userDietPlanSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: ['veg', 'nonveg', 'keto', 'weightloss', 'gain', 'maintenance'],
      default: 'maintenance',
    },
    meals: {
      type: [userMealSchema],
      default: [],
    },
    dailyCalories: {
      type: Number,
    },
    dailyProtein: {
      type: Number,
    },
    dailyCarbs: {
      type: Number,
    },
    dailyFats: {
      type: Number,
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
userDietPlanSchema.index({ userId: 1, isActive: 1 });

const UserDietPlan = mongoose.model('UserDietPlan', userDietPlanSchema);

export default UserDietPlan;







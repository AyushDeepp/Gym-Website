import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema(
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
  },
  { _id: false }
);

const dietPlanSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['veg', 'nonveg', 'keto', 'weightloss', 'gain'],
      default: 'veg',
    },
    description: {
      type: String,
      required: true,
    },
    access: {
      type: String,
      enum: ['public', 'members', 'assigned'],
      default: 'members',
    },
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    meals: {
      type: [mealSchema],
      default: [],
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: 'Please provide at least one meal entry',
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  { timestamps: true }
);

const DietPlan = mongoose.model('DietPlan', dietPlanSchema);

export default DietPlan;



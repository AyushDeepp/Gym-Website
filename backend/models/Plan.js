import mongoose from 'mongoose';

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    features: [{
      type: String,
      required: true,
    }],
    popular: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Plan = mongoose.model('Plan', planSchema);

export default Plan;


import mongoose from 'mongoose';

const programSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    features: [{
      type: String,
    }],
    price: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Program = mongoose.model('Program', programSchema);

export default Program;


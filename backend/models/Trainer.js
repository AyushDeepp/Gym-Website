import mongoose from 'mongoose';

const trainerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    specialization: {
      type: String,
      required: true,
    },
    experience: {
      type: Number,
      required: true,
    },
    bio: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    certifications: [{
      type: String,
    }],
    socialLinks: {
      instagram: String,
      facebook: String,
      twitter: String,
    },
  },
  {
    timestamps: true,
  }
);

const Trainer = mongoose.model('Trainer', trainerSchema);

export default Trainer;


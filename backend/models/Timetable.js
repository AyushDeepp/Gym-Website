import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: true,
    },
    trainer: {
      type: String,
      required: true,
    },
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      default: 20,
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Timetable = mongoose.model('Timetable', timetableSchema);

export default Timetable;


import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    checkIn: {
      type: Date,
      required: true,
      index: true,
    },
    checkOut: {
      type: Date,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    duration: {
      type: Number, // Duration in minutes
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['checked-in', 'checked-out'],
      default: 'checked-in',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate check-ins on same day
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

// Method to calculate duration
attendanceSchema.methods.calculateDuration = function () {
  if (this.checkOut && this.checkIn) {
    const diffMs = this.checkOut - this.checkIn;
    this.duration = Math.round(diffMs / (1000 * 60)); // Convert to minutes
    return this.duration;
  }
  return null;
};

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;


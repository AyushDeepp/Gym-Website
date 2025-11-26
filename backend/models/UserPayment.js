import mongoose from 'mongoose';

const userPaymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    paymentId: {
      type: String,
    },
    signature: {
      type: String,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      required: true,
    },
    planName: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'manual', 'google_pay', 'other'],
      default: 'razorpay',
    },
    notes: {
      type: String,
    },
    membershipActivated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
userPaymentSchema.index({ userId: 1, createdAt: -1 });
userPaymentSchema.index({ status: 1 });

const UserPayment = mongoose.model('UserPayment', userPaymentSchema);

export default UserPayment;


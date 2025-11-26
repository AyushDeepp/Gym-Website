import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const membershipSchema = new mongoose.Schema(
  {
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
    },
    planName: {
      type: String,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled', 'pending'],
      default: 'pending',
    },
    autoRenew: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId; // Password not required if using Google OAuth
      },
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['visitor', 'member', 'admin', 'super_admin'],
      default: 'visitor',
    },
    membership: {
      type: membershipSchema,
      default: null,
    },
    assignedTrainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trainer',
      default: null,
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    profileImage: {
      type: String,
    },
    notes: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to check if membership is active
userSchema.methods.hasActiveMembership = function () {
  if (!this.membership || !this.membership.status) {
    return false;
  }
  if (this.membership.status !== 'active') {
    return false;
  }
  if (this.membership.endDate && new Date() > this.membership.endDate) {
    return false;
  }
  return true;
};

// Method to calculate days until expiry
userSchema.methods.getDaysUntilExpiry = function () {
  if (!this.membership || !this.membership.endDate) {
    return null;
  }
  const now = new Date();
  const endDate = new Date(this.membership.endDate);
  const diffTime = endDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

const User = mongoose.model('User', userSchema);

export default User;


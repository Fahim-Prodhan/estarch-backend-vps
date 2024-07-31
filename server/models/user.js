// models/userModel.js

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: true,
    unique: true,
    match: [/^\+880[0-9]{10}$/, 'Please provide a valid Bangladeshi phone number']
  },
  otp: {
    type: String,
    required: false
  },
  otpExpires: {
    type: Date,
    required: false
  },
  password: {
    type: String,
    required: false
  },
  isActive: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index to ensure that phone numbers are unique
userSchema.index({ mobile: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);

export default User;

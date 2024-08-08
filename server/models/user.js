import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    default: ''
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    unique: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    default: ''
  },
  role: {
    type: String,
    default: "user",
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    default: 'Other'
  },
  otp: {
    type: String,
    default: null
  },
  otpExpires: {
    type: Date,
    default: null
  },
  password: {
    type: String,
    default: null
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

const User = mongoose.model('User', userSchema);

export default User;

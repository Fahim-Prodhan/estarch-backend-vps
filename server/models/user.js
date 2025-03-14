import mongoose from 'mongoose';

// Function to generate a random 6-digit number
function generateRandomEmail() {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `abc${randomDigits}@gmail.com`;
}

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    default: ''
  },
  address: {
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
    default: generateRandomEmail // Set the default using the function
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
  },
  userPaymentOption: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserPaymentOption'
  }
});

const User = mongoose.model('User', userSchema);

export default User;

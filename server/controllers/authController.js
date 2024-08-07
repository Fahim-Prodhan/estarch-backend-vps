import User from '../models/user.js';
import crypto from 'crypto';
import axios from 'axios';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

// Send OTP function
const sendOtp = async (mobile, otp) => {
  const url = `https://smpp.revesms.com:7790/sendtext?apikey=2e2d49f9273cc83c&secretkey=f4bef7bd&callerID=1234&toUser=${mobile}&messageContent=Your OTP is ${otp}`;
  await axios.get(url);
};

export const registerUser = async (req, res) => {
  const { mobile} = req.body;

  // Validate mobile number
  if (!mobile || !/^\+880[0-9]{10}$/.test(mobile)) {
    return res.status(400).json({ message: 'Invalid mobile number' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      // If OTP has expired, regenerate OTP
      if (existingUser.otpExpires < Date.now()) {
        const otp = crypto.randomInt(100000, 999999).toString();
        existingUser.otp = otp;
        existingUser.otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
        await existingUser.save();
        await sendOtp(mobile, otp);
        return res.status(200).json({ message: 'OTP sent to mobile',userId: existingUser._id });
      }
      return res.status(200).json({ message: 'OTP already sent, please check your mobile',
        userId: existingUser._id
       });
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    // Create new user
    const user = new User({
      mobile,
      email:  undefined, // Ensure email is either a string or undefined
      otp,
      otpExpires: Date.now() + 10 * 60 * 1000 // OTP expires in 10 minutes
    });

    // Save user to the database
    await user.save();

    // Send OTP via SMS
    // await sendOtp(mobile, otp);

    res.status(201).json({
      message: 'User registered, OTP sent to mobile',
      userId: user._id
    });
  } catch (error) {
    if (error instanceof mongoose.Error && error.code === 11000) {
      // Handle duplicate key error
      return res.status(400).json({ message: 'Mobile number or email already exists' });
    }
    console.error('Error in registerUser:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};


export const verifyOtp = async (req, res) => {
  const { userId, otp } = req.body;
      console.log(userId , otp);
  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    user.otp = null; // Clear OTP
    user.otpExpires = null; // Clear OTP expiry time
    user.isActive = true; // Activate user
    await user.save();

    res.status(200).json({ message: 'OTP verified, account activated' });
  } catch (error) {
    console.error('Error in verifyOtp:', error);
    res.status(500).json({ message: 'Error verifying OTP', error: error.message });
  }
};


export const setPassword = async (req, res) => {
  const { userId, password } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user || !user.isActive) {
      return res.status(400).json({ message: 'User not found or not active' });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password set successfully' });
  } catch (error) {
    console.error('Error in setPassword:', error);
    res.status(500).json({ message: 'Error setting password', error: error.message });
  }
};

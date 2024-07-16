import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import { randomInt } from 'crypto';
import { saveOtp, getSavedOtp, deleteOtp } from '../utils/otpStore.js';

const secret = 'your_jwt_secret'; // Replace with your secret key

export const sendOtp = async (req, res) => {
  const { phoneNumber } = req.body;
  if (!/^(\+8801)[3-9]\d{8}$/.test(phoneNumber)) {
    return res.status(400).json({ message: 'Invalid Bangladeshi phone number' });
  }

  const otp = randomInt(100000, 999999).toString();
  await saveOtp(phoneNumber, otp);
  await sendSms(phoneNumber, `Your OTP is ${otp}`);

  res.json({ message: 'OTP sent' });
};

export const verifyOtp = async (req, res) => {
  const { phoneNumber, otp } = req.body;
  const savedOtp = await getSavedOtp(phoneNumber);

  if (savedOtp === otp) {
    deleteOtp(phoneNumber);
    let user = await User.findOne({ phoneNumber });
    if (!user) {
      user = new User({ phoneNumber });
      await user.save();
    }

    const token = jwt.sign({ userId: user._id }, secret, { expiresIn: '1h' });
    res.json({ token, message: 'OTP verified' });
  } else {
    res.status(400).json({ message: 'Invalid OTP' });
  }
};

export const setPassword = async (req, res) => {
  const { password } = req.body;
  req.user.password = password;
  await req.user.save();
  res.json({ message: 'Password set successfully' });
};

export const login = async (req, res) => {
  const { phoneNumber, password } = req.body;
  const user = await User.findOne({ phoneNumber });

  if (user && await user.comparePassword(password)) {
    const token = jwt.sign({ userId: user._id }, secret, { expiresIn: '1h' });
    res.json({ token, message: 'Login successful' });
  } else {
    res.status(400).json({ message: 'Invalid phone number or password' });
  }
};

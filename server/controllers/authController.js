// controllers/authController.js
import User from '../models/user.js';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const sendOtp = async (mobile, otp) => {
  const url = `https://smpp.revesms.com:7790/sendtext?apikey=${process.env.API_KEY}&secretkey=${process.env.SECRET_KEY}&callerID=SENDER_ID&toUser=${mobile}&messageContent=Your OTP is ${otp}`;
  await axios.get(url);
};

export const register = async (req, res) => {
    const { mobile } = req.body;

    if (!mobile) {
        return res.status(400).json({ message: 'Mobile number is required' });
    }
    const otp = generateOtp();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    try {
        let user = await User.findOne({ mobile });
        if (user) {
            user.otp = otp;
            user.otpExpires = otpExpires;
        } else {
            user = new User({ mobile, otp, otpExpires });
        }

        await user.save();
        await sendOtp(mobile, otp);

        res.json({ message: 'OTP sent to your mobile number' });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Mobile number already exists' });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
};



export const verify = async (req, res) => {
  const { mobile, otp, password } = req.body;

  if (!mobile || !otp || !password) {
    return res.status(400).json({ message: 'Mobile, OTP, and password are required' });
  }

  const user = await User.findOne({ mobile });

  if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }
  user.password = await bcrypt.hash(password, 10);
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();
  res.json({ message: 'Password set successfully' });
};

export const login = async (req, res) => {
  const { mobile, password } = req.body;

  if (!mobile || !password) {
    return res.status(400).json({ message: 'Mobile and password are required' });
  }

  const user = await User.findOne({ mobile });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: 'Invalid mobile number or password' });
  }

  res.json({ message: 'Logged in successfully' });
};

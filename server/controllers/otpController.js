import axios from 'axios';
import User from '../models/user.js';
import crypto from 'crypto';

// Replace these with your Reve SMS API credentials
const API_KEY = '2e2d49f9273cc83c';
const SECRET_KEY = 'f4bef7bd';
const SENDER_ID = 'your_sender_id_here'; // Your sender ID

// Reve SMS API URLs
const SMS_SEND_URL = 'https://smpp.revesms.com:7790/sendtext';
const SMS_STATUS_URL = 'https://smpp.revesms.com:7790/getstatus';

// Generate a random OTP
const generateOtp = () => crypto.randomInt(100000, 999999).toString();

export const sendOtp = async (req, res) => {
    const { mobileNumber } = req.body;

    if (!mobileNumber) {
        return res.status(400).json({ error: 'Mobile number is required' });
    }

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    try {
        // Find or create the user
        let user = await User.findOne({ mobile: mobileNumber });

        if (!user) {
            user = new User({ mobile: mobileNumber });
        }

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        const response = await axios.get(`${SMS_SEND_URL}?apikey=${API_KEY}&secretkey=${SECRET_KEY}&callerID=${SENDER_ID}&toUser=${mobileNumber}&messageContent=Your OTP code is: ${otp}`);

        if (response.status === 200) {
            res.json({ success: true, message: 'OTP sent successfully' });
        } else {
            res.status(500).json({ error: 'Failed to send OTP' });
        }
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const verifyOtp = async (req, res) => {
    const { mobileNumber, userInputOtp } = req.body;

    if (!mobileNumber || !userInputOtp) {
        return res.status(400).json({ error: 'Mobile number and OTP are required' });
    }

    try {
        const user = await User.findOne({ mobile: mobileNumber });

        if (!user || user.otp !== userInputOtp || user.otpExpires < Date.now()) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        user.isActive = true; // Mark the user as active
        user.otp = undefined; // Clear the OTP
        user.otpExpires = undefined; // Clear OTP expiration
        await user.save();

        res.json({ success: true, message: 'OTP verified successfully' });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

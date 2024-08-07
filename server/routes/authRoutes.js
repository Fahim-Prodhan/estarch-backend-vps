import express from 'express';
import {getUserByMobile, loginUser, registerUser, verifyOtp, setPassword } from '../controllers/authController.js';

const router = express.Router();

// Register user
router.post('/register', registerUser);

// Verify OTP
router.post('/verify-otp', verifyOtp);

// Set password
router.post('/set-password', setPassword);
router.get('/user-info', getUserByMobile);
// Login user
router.post('/login', loginUser);

export default router;

import express from 'express';
import { registerUser, verifyOtp, setPassword } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/verify-otp', verifyOtp);
router.post('/set-password', setPassword);

export default router;

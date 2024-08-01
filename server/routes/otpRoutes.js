import express from 'express';
import { sendOtp, verifyOtp ,checkSmsStatus} from '../controllers/otpController.js';

const router = express.Router();

// Route to send OTP
router.post('/send-otp', sendOtp);

// Route to verify OTP
router.post('/verify-otp', verifyOtp);
router.get('/check-status/:messageId', checkSmsStatus);
export default router;

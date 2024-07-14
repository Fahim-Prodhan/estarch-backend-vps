import express from 'express';
import { sendOtp, verifyOtp, setPassword, login } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/sendOtp', sendOtp);
router.post('/verifyOtp', verifyOtp);
router.post('/setPassword', authenticate, setPassword);
router.post('/login', login);

export default router;

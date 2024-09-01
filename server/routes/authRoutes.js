import express from 'express';
import {getUserByMobile, loginUser, registerUser, verifyOtp, setPassword,getUserById,logout,registerAdmin,loginAdmin,loginShowroomManager } from '../controllers/authController.js';

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
router.get('/user/:id', getUserById);
router.post("/logout", logout);
router.post('/register-admin',registerAdmin)
router.post('/login-admin',loginAdmin)
router.post('/login-showroom-manager',loginShowroomManager)

export default router;

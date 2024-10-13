import express from 'express';
import {getUserByMobile,findUsersByRole, loginUser, registerUser, verifyOtp, setPassword,getUserById,logout,registerAdmin,loginAdmin,loginShowroomManager } from '../controllers/authController.js';
import { registerInvestor } from '../controllers/accountController.js';

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
router.post('/register-investor',registerInvestor)
router.post('/login-admin',loginAdmin)
router.post('/login-showroom-manager',loginShowroomManager)
router.get('/users/accountant', findUsersByRole);

export default router;

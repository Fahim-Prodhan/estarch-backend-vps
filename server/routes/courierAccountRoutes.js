// routes/courierAccount.routes.js
import express from 'express';
import { getCourierAccount, createAccount, makeWithdrawal } from '../controllers/courierAccountController.js';

const router = express.Router();

// Get courier account data
router.get('/', getCourierAccount);

// Create or initialize courier account
router.post('/', createAccount);

// Make a withdrawal
router.post('/withdraw', makeWithdrawal);

export default router;

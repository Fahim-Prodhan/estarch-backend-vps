import express from 'express';
import {
  createPaymentOption,
  getAllPaymentOptions,
  getPaymentOptionById,
  updatePaymentOption,
  deletePaymentOption,
  getShowroomAccounts,
  getOnlineAccounts
} from '../controllers/paymentOptionController.js';

const router = express.Router();

// Create a new payment option
router.post('/payment-options', createPaymentOption);

// Get all payment options
router.get('/payment-options', getAllPaymentOptions);

// Get a specific payment option by ID
router.get('/payment-options/:id', getPaymentOptionById);

// Update a specific payment option by ID
router.put('/payment-options/:id', updatePaymentOption);

// Delete a specific payment option by ID
router.delete('/payment-options/:id', deletePaymentOption);
router.get('/showroom-accounts', getShowroomAccounts);
router.get('/online-accounts', getOnlineAccounts);

export default router;

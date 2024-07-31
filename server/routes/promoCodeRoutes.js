// routes/promoCodeRoutes.js

import express from 'express';
import {
  createPromoCode,
  getPromoCodes,
  updatePromoCode,
  deletePromoCode
} from '../controllers/promoCodeController.js';

const router = express.Router();

// Create a new promo code
router.post('/', createPromoCode);

// Get all promo codes
router.get('/', getPromoCodes);

// Update a promo code
router.put('/:id', updatePromoCode);

// Delete a promo code
router.delete('/:id', deletePromoCode);

export default router;

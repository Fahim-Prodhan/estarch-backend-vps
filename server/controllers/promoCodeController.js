// controllers/promoCodeController.js

import PromoCode from '../models/promoCode.js';

// Create a new promo code
export const createPromoCode = async (req, res) => {
  try {
    const { promoCode, minAmount, discountType, discountAmount, startDate, endDate } = req.body;
    const newPromoCode = new PromoCode({
      promoCode,
      minAmount,
      discountType,
      discountAmount,
      startDate,
      endDate
    });
    await newPromoCode.save();
    res.status(201).json(newPromoCode);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all promo codes
export const getPromoCodes = async (req, res) => {
  try {
    const promoCodes = await PromoCode.find();
    res.status(200).json(promoCodes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a promo code
export const updatePromoCode = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedPromoCode = await PromoCode.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedPromoCode) {
      return res.status(404).json({ message: 'Promo code not found' });
    }
    res.status(200).json(updatedPromoCode);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a promo code
export const deletePromoCode = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedPromoCode = await PromoCode.findByIdAndDelete(id);
    if (!deletedPromoCode) {
      return res.status(404).json({ message: 'Promo code not found' });
    }
    res.status(200).json({ message: 'Promo code deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

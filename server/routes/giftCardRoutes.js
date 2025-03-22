import express from 'express'

import { createGiftCard,getAllGiftCards,updateGiftCard,applyGiftCard,createGiftCardTypes, getAllGiftCardTypes } from '../controllers/giftCardController.js'

const router = express.Router();

router.post('/', createGiftCard);
router.post('/create/gift-card-type', createGiftCardTypes);
router.get('/get/gift-card-type', getAllGiftCardTypes);
router.get('/', getAllGiftCards);
router.put('/update/:id', updateGiftCard);
router.get('/apply/:code', applyGiftCard);

export default router;
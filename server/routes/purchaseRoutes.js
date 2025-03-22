import express from 'express';
import {
    createPurchase,
    getAllPurchases,
    getPurchaseById,
    updatePurchase,
    deletePurchase,
    createAssetPurchase
} from '../controllers/purchaseController.js'; // Adjust the path according to your file structure

const router = express.Router();

// Create a new purchase
router.post('/', createPurchase);
router.post('/create-asset-purchase', createAssetPurchase);
// Get all purchases
router.get('/', getAllPurchases);

// Get a single purchase by ID
router.get('/:id', getPurchaseById);

// Update a purchase by ID
router.put('/:id', updatePurchase);

// Delete a purchase by ID
router.delete('/:id', deletePurchase);

export default router;

import express from 'express';
import { createCashEntry, getAllCashEntries, deleteCashEntry } from '../controllers/cashController.js';

const router = express.Router();

// Route to create new cash entries
router.post('/create', createCashEntry);

// Route to get all cash entries
router.get('/', getAllCashEntries);

// Route to delete a cash entry by ID (optional)
router.delete('/:id', deleteCashEntry);

export default router;

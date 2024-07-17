import express from 'express';
import { createSupplier, getSuppliers, updateSupplier, deleteSupplier } from '../controllers/supplierController.js';
import enableToggleMiddleware from '../middleware/supplierMiddleware.js';
import uploader from '../middleware/uploader.js';

const router = express.Router();

// Create a new supplier
router.post('/',uploader.array('images', 10), enableToggleMiddleware, createSupplier);

// Get all suppliers
router.get('/', getSuppliers);

// Update a supplier
router.put('/:id', enableToggleMiddleware, updateSupplier);

// Delete a supplier
router.delete('/:id', deleteSupplier);

export default router;

// routes/supplierRoutes.js

import express from 'express';
import {
    createSupplier,
    getSuppliers,
    getSupplierById,
    updateSupplier,
    deleteSupplier,
    getSupplierStats
} from '../controllers/supplierController.js';

const router = express.Router();

router.post('/', createSupplier);
router.get('/', getSuppliers);
router.get('/:id', getSupplierById);
router.put('/:id', updateSupplier);
router.delete('/:id', deleteSupplier);
router.get('/stats/stats', getSupplierStats);


export default router;

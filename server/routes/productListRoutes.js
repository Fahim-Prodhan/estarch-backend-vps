import express from 'express';
import {
    getProductLists,
    getProductListById,
    createProductList,
    updateProductList,
    deleteProductList
} from '../controllers/productListController.js';

const router = express.Router();

// GET all product lists
router.get('/', getProductLists);
router.get('/:id', getProductListById);
router.post('/', createProductList);
router.put('/:id', updateProductList);
router.delete('/:id', deleteProductList);

export default router;

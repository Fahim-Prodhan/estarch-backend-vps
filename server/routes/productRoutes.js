import express from 'express';
import { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct,getAllProductsByType } from '../controllers/productController.js';

const router = express.Router();

// Routes
router.post('/products', createProduct);
router.get('/products', getAllProducts);
router.get('/products/:type', getAllProductsByType);
router.get('/products/:id', getProductById);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

export default router;
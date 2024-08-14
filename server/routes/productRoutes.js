import express from 'express';
import { createProduct,getProductsForPos,generateSku, getAllProducts, getProductById, updateProduct, deleteProduct, getAllProductsByType, getAllProductsByCategoryId, getNewArrival,getFeaturedProducts,getAllNewArrivalProduct,getAllFeatureProduct } from '../controllers/productController.js';

const router = express.Router();

// Routes
router.post('/products', createProduct);
router.get('/products', getAllProducts);
router.get('/products/sku', generateSku);
router.get('/new-all-products', getAllNewArrivalProduct);
router.get('/all-feature-products', getAllFeatureProduct);
router.get('/products-for-pos', getProductsForPos);
router.get('/new-arrival', getNewArrival);
router.get('/feature-products', getFeaturedProducts);
router.get('/products/category/:id', getAllProductsByCategoryId); // More specific before less specific
router.get('/products/:type', getAllProductsByType); // Ensure this is not conflicting with id route
router.get('/products/product/:id', getProductById); // ID route after type route
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);


export default router;
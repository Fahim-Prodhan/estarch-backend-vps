import express from 'express';
import {searchProductByBarcode,toggleBooleanField,toggleSizeAvailability,searchProductListsByName,updateProductSerials,getProducts, createProduct,getProductsForPos, getAllProducts, getProductById, updateProduct, deleteProduct, getAllProductsByType, getAllProductsByCategoryId, getNewArrival,getFeaturedProducts,getAllNewArrivalProduct,getAllFeatureProduct,generateSku } from '../controllers/productController.js';

const router = express.Router();

// Routes
router.post('/products', createProduct);
router.get('/products', getAllProducts);
router.get('/all-products', getProducts);
router.get('/products/sku', generateSku);
router.get('/new-all-products', getAllNewArrivalProduct);
router.get('/all-feature-products', getAllFeatureProduct);
router.get('/products-for-pos', getProductsForPos);
router.get('/new-arrival', getNewArrival);
router.get('/feature-products', getFeaturedProducts);
router.get('/products/category/:id', getAllProductsByCategoryId);
router.get('/products/:type', getAllProductsByType);
router.get('/products/product/:id', getProductById); 
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.put('/products/serials/update', updateProductSerials);
router.get('/search', searchProductListsByName);
router.put('/toggle-size-availability', toggleSizeAvailability);
router.put('/product/toggle/:productId/:fieldName', toggleBooleanField);
router.get('/search/:barcode', searchProductByBarcode);
export default router;
import express from 'express';
import {getProductByBarcode,searchProductByBarcode,toggleBooleanField,toggleSizeAvailability,searchProductListsByName,updateProductSerials,getProducts, createProduct,getProductsForPos, getAllProducts, getProductById, updateProduct, deleteProduct, getAllProductsByType, getAllProductsByCategoryId, getNewArrival,getFeaturedProducts,getAllNewArrivalProduct,getAllFeatureProduct,generateSku,getAllProductsByCategoryName,getProductByName,getAllProductsBySubcategoryName,getHomePageNewArrival,getAllStatusOnProduct, updateProductCategorySerials,updateProductSubcategorySerials, getAllProductsByCategoryNameStatusOn,getAllProductsBySubcategoryNameStatusOn} from '../controllers/productController.js';

const router = express.Router();

// Routes
router.post('/products', createProduct);
router.get('/products', getAllProducts);
router.get('/status-on-products', getAllStatusOnProduct);
router.get('/all-products', getProducts);
router.get('/products/sku', generateSku);
router.get('/new-all-products', getAllNewArrivalProduct);
router.get('/new-arrival', getNewArrival);
router.get('/all-feature-products', getAllFeatureProduct);
router.get('/products-for-pos', getProductsForPos);
router.get('/feature-products', getFeaturedProducts);
router.get('/products/category/:id', getAllProductsByCategoryId);
router.get('/products/category/products/:categoryName', getAllProductsByCategoryName);
router.get('/products/category-status-on/products/:categoryName', getAllProductsByCategoryNameStatusOn);
router.get('/products/subcategory-status-on/products/:subcategoryName', getAllProductsBySubcategoryNameStatusOn);
router.get('/products/subcategory/:subcategoryName', getAllProductsBySubcategoryName);
router.get('/products/:type', getAllProductsByType);
router.get('/products/product/:id', getProductById); 
router.get('/products/product-details/:productName/:sku', getProductByName); 
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.put('/products/serials/update', updateProductSerials);
router.put('/products/category-serials/update', updateProductCategorySerials);
router.put('/products/subcategory-serials/update', updateProductSubcategorySerials);
router.get('/search', searchProductListsByName);
router.put('/toggle-size-availability', toggleSizeAvailability);
router.put('/product/toggle/:productId/:fieldName', toggleBooleanField);
router.get('/search/:barcode', searchProductByBarcode);
router.get('/product/barcode/:barcode', getProductByBarcode);
router.get('/home-new-arrival', getHomePageNewArrival);

export default router;
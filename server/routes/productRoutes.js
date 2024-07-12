import { Router } from 'express';
import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    getNewArrivals,
    getBestSelling,
    getProductsByCategory,
    setNewArrival,
    setBestSelling,
} from '../controllers/productController.js';
import productMiddleware from '../middleware/productMiddleWere.js';


const router = Router();

router.get('/', getProducts); //worked
router.get('/:id', getProductById); //worked
router.post('/',  productMiddleware, createProduct); //worked
router.put('/:id',  productMiddleware, updateProduct); //worked
router.delete('/:id', deleteProduct); //worked
router.get('/new-arrivals', getNewArrivals);
router.get('/best-selling', getBestSelling);
router.get('/category/:category', getProductsByCategory);//worked
router.patch('/set-new-arrival/:id', setNewArrival); 
router.patch('/set-best-selling/:id',  setBestSelling);

export default router;

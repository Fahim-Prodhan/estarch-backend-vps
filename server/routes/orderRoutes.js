import express from 'express';
import { createOrder, getOrders, getOrderById } from '../controllers/orderController.js';

const router = express.Router();

router.post('/orders', createOrder);
router.get('/orders', getOrders);
router.get('/orders/:id', getOrderById);

export default router;

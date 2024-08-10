// routes/orderRoutes.js

import express from 'express';
import {
    getAllOrders,
    createOrder,
    updateOrderStatus,
    updateOrderCourier,
    addCartItems,
    getOrderProducts,
    getTotalOrderCountOfUser
} from '../controllers/orderController.js'; // Adjust the import path based on your file structure

const router = express.Router();

// Fetch all orders with optional filters
router.get('/', getAllOrders);

// Create a new order
router.post('/', createOrder);

// Update an order's status
router.patch('/:id/status', updateOrderStatus);

// Update an order's courier
router.patch('/:id/courier', updateOrderCourier);

// Add cart items to an order
router.patch('/:id/cart-items', addCartItems);

router.post('/product/', getOrderProducts)

router.get('/order-count/:userId',getTotalOrderCountOfUser)

export default router;

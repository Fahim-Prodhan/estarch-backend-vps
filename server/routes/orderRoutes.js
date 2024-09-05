// routes/orderRoutes.js

import express from 'express';
import {
    getAllOrders,
    createOrder,
    updateOrderStatus,
    // updateOrderCourier,
    addCartItems,
    getOrderProducts,
    getOrderById,
    getUserOrderByMobile,
    getTotalOrderCountOfUser,
    getOrderByInvoice,
    getAllNotesController,
    addNoteController,
    getAllStatusByOrderId,
    getAllOrdersWithLastStatus,
    manageOrder
} from '../controllers/orderController.js';

const router = express.Router();
// Fetch all orders with optional filters
router.get('/', getAllOrders);
// Create a new order
router.post('/', createOrder);
// Update an order's status
router.patch('/status/:orderId', updateOrderStatus);
// Add cart items to an order
router.patch('/:id/cart-items', addCartItems);
router.post('/product/', getOrderProducts)
router.get('/order/:id', getOrderById);
router.get('/orders/:phone', getUserOrderByMobile);
router.get('/order-count/:userId',getTotalOrderCountOfUser);
router.get('/order/invoice/:invoice', getOrderByInvoice);
router.post('/orders/notes/:orderId', addNoteController);
router.get('/orders/notes/:orderId',getAllNotesController);
router.get('/order/status/:orderId', getAllStatusByOrderId);
router.get('/orders/all/laststatus', getAllOrdersWithLastStatus);
router.patch('/manage-order/:orderId', manageOrder);

export default router;

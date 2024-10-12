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
    manageOrder,
    updateOrderIsPrint,
    getCountOfStatus,
    getManagerSalesStats,
    getShowroomOrders,
    createPOSOrder,
    updateOrderNoForAllOrders,
    createOnlinePosOrder,
    getSentToCourierOrders,
    getCourierProcessingOrders,
    handleOrderReturns 
    
} from '../controllers/orderController.js';

const router = express.Router();
// Fetch all orders with optional filters
router.get('/', getAllOrders);
// Create a new order
router.post('/', createOrder);
router.post('/online-pos-order', createOnlinePosOrder);
router.post('/pos-order', createPOSOrder);
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
router.put('/update-print/:orderId', updateOrderIsPrint);
router.get('/status-count', getCountOfStatus);
router.get('/manager/:managerId/stats', getManagerSalesStats);
router.get('/oders/showrooms', getShowroomOrders);
router.put('/update-order-numbers', updateOrderNoForAllOrders);
router.post('/orders/returns', handleOrderReturns);
router.get('/get-sent-courier-orders', getSentToCourierOrders);
router.get('/get-courier-processing-orders', getCourierProcessingOrders);

export default router;

// controllers/orderController.js

import Order from '../models/order.js'; // Adjust the import path based on your file structure

// Fetch all orders with optional filters
export const getAllOrders = async (req, res) => {
    try {
        const { status, courier, date } = req.query;

        const filters = {};
        if (status) filters.status = status;
        if (courier) filters.courier = courier;
        if (date) {
            const startDate = new Date(date).setHours(0, 0, 0, 0);
            const endDate = new Date(date).setHours(23, 59, 59, 999);
            filters.date = { $gte: startDate, $lte: endDate };
        }

        const orders = await Order.find(filters);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

// Create a new order
export const createOrder = async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        console.log(newOrder);
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to create order' });
    }
};

// Update an order's status
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        const statusHierarchy = ['new', 'pending', 'confirm', 'processing', 'courier', 'delivered', 'cancel'];
        const currentStatusIndex = statusHierarchy.indexOf(order.status);
        const newStatusIndex = statusHierarchy.indexOf(status);

        if (newStatusIndex > currentStatusIndex) {
            order.status = status;
            await order.save();
            res.json(order);
        } else {
            res.status(400).json({ error: 'Status progression is not valid' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update order status' });
    }
};

// Update an order's courier
export const updateOrderCourier = async (req, res) => {
    try {
        const { id } = req.params;
        const { courier } = req.body;

        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        order.courier = courier;
        await order.save();
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update order courier' });
    }
};

// Add cart items to an order
export const addCartItems = async (req, res) => {
    try {
        const { id } = req.params;
        const { cartItems } = req.body;

        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        order.cartItems = cartItems;
        await order.save();
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update cart items' });
    }
};


// controllers/orderController.js

import Order from '../models/order.js'; // Adjust the import path based on your file structure
import Product from "../models/product.js";
import moment from 'moment';
import mongoose from 'mongoose';


const generateInvoiceNumber = () => {
    const datePart = moment().format('YYYYMMDD'); // e.g., "20240808"
    const randomPart = Math.floor(1000 + Math.random() * 9000); // Random 4-digit number
    return `INV-${datePart}-${randomPart}`;
};



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
// export const createOrder = async (req, res) => {
//     try {
//         const newOrder = new Order(req.body);
//         console.log(newOrder);
//         await newOrder.save();
//         res.status(201).json(newOrder);
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ error: 'Failed to create order' });
//     }
// };

export const createOrder = async (req, res) => {
    try {
        const {
            serialId, orderNotes, name, address, area, phone, altPhone, notes,
            totalAmount, deliveryCharge, discount, grandTotal, advanced,
            condition, cartItems, paymentMethod, courier, employee, userId, status
        } = req.body;

        // console.log(area);
        const invoice = generateInvoiceNumber();
        // console.log("invoice:", invoice);


        // Iterate through each cart item to update the product stock
        for (const item of cartItems) {
            const { productId, size, quantity } = item;

            // Find the product by ID
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ message: `Product with ID ${productId} not found.` });
            }

            // console.log("product", product);

            // Check if size is provided
            if (!size) {
                return res.status(400).json({ message: `Size must be specified for product ID ${productId}.` });
            }

            // Find the size details by size
            const sizeDetail = product.sizeDetails.find(detail => detail.size === size);
            if (!sizeDetail) {
                return res.status(404).json({ message: `Size ${size} not found for product ID ${productId}.` });
            }

            // console.log("size:", sizeDetail);

            // Check if there is enough stock
            if (sizeDetail.openingStock < quantity) {
                return res.status(400).json({ message: `Not enough stock for size ${size} of product ID ${productId}.` });
            }

            // Subtract the quantity from openingStock
            sizeDetail.openingStock -= quantity;

            // Update the product's sizeDetails in the database
            await Product.findByIdAndUpdate(productId, { sizeDetails: product.sizeDetails });
        }

        // Create the order with the given data
        const order = new Order({
            serialId,
            invoice,
            orderNotes,
            // date,
            name,
            address,
            area,
            phone,
            altPhone,
            notes,
            totalAmount,
            deliveryCharge,
            discount,
            grandTotal,
            advanced,
            condition,
            cartItems,
            paymentMethod,
            courier,
            employee,
            userId,
            status
        });

        await order.save();

        return res.status(201).json({ message: 'Order placed successfully', order });
    } catch (error) {
        console.error('Error placing order:', error);
        return res.status(500).json({ message: 'Server error', error });
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


// get order products (fahim)
export const getOrderProducts = async (req, res) => {
    try {
        const { productIds } = req.body; // Expect an array of product IDs in the request body

        // Find products with the given IDs
        const products = await Product.find({
            _id: { $in: productIds }
        });

        if (!products) {
            return res.status(404).json({ message: 'Products not found' });
        }

        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

export const getTotalOrderCountOfUser = async (req, res) => {
    try {
      const { userId } = req.params;
  
      // Find orders for the given userId and populate the userId field
      const orders = await Order.find({ userId: userId }).populate('userId');
  
      // Count the number of populated orders
      const orderCount = orders.length;
  
      res.status(200).json({ orderCount, orders });
    } catch (error) {
      console.error('Error finding order count and orders by userId:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
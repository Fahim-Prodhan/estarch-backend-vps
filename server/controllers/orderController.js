// controllers/orderController.js

import Order from '../models/order.js'; // Adjust the import path based on your file structure
import Product from "../models/product.js";
import moment from 'moment';

// Get all notes for a specific order
export const getAllNotesController = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.status(200).json({ notes: order.notes });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add a note to a specific order
export const addNoteController = async (req, res) => {
  try {
    const { orderId } = req.params; // Get order ID from URL parameters
    const { adminName, noteContent } = req.body; // Get adminName and noteContent from request body

    // Validate that both adminName and noteContent are provided
    if (!adminName || !noteContent) {
      return res.status(400).json({ message: 'Both adminName and noteContent are required' });
    }

    // Find the order by its ID and handle cases where the order is not found
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Ensure notes is initialized as an array if not already
    if (!Array.isArray(order.notes)) {
      order.notes = [];
    }

    console.log(order.notes);
    
    // Create a new note object
    const newNote = {
      adminName,
      noteContent,
      timestamp: new Date() // Add a timestamp to the note
    };

    // Add the new note to the notes array
    order.notes.push(newNote);
    console.log(order.notes);
    
    // // Save the updated order with the new note
    await order.save();

    // Return the updated order with a success message
    return res.status(200).json({ message: 'Note added successfully',order });
  } catch (error) {
    // Log the error for debugging
    console.error('Error adding note:', error);

    // Handle any server errors
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};



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
            condition, cartItems, paymentMethod, courier, employee, userId
        } = req.body;

        console.log(name);
        const invoice = generateInvoiceNumber();
        // console.log("invoice:", invoice);

        const initialStatus = [{ name: 'pending', user: null }];

        // Iterate through each cart item to update the product stock
        for (const item of cartItems) {
            const { productId, size, quantity } = item;

            // Find the product by ID
            const product = await Product.findById(productId);
            console.log(product);
            
            if (!product) {
                console.log('not found product');
                
                return res.status(404).json({ message: `Product with ID ${productId} not found.` });
            }

            if (!size) {
                console.log('not found size');

                return res.status(400).json({ message: `Size must be specified for product ID ${productId}.` });
            }

            // Find the size details by size
            const sizeDetail = product.sizeDetails.find(detail => detail.size === size);
            if (!sizeDetail) {
                console.log('not found size details');
                return res.status(404).json({ message: `Size ${size} not found for product ID ${productId}.` });
            }

            if (sizeDetail.openingStock < quantity) {
                console.log('not available',sizeDetail.openingStock);

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
            status:initialStatus
        });

        await order.save();

        return res.status(201).json({ message: 'Order placed successfully', order });
    } catch (error) {
        console.error('Error placing order:', error);
        return res.status(500).json({ message: 'Server error', error });
    }
};

// Update an order's status


// Update an order's courier
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const statusHierarchy = [
        'new', 'pending', 'pendingPayment', 'confirm', 'hold', 
        'processing', 'sentToCourier', 'courierProcessing', 'delivered', 
        'return', 'returnExchange', 'returnWithDeliveryCharge', 'exchange', 'cancel'
    ];

    // Check the current status by looking at the last status in the array
    const currentStatusIndex = statusHierarchy.indexOf(order.status[order.status.length - 1].name);
    const newStatusIndex = statusHierarchy.indexOf(status);

    // Validate if the new status can be applied
    if (newStatusIndex > currentStatusIndex) {
        order.status.push({ name: status, user: req.user._id }); // Assuming `req.user` contains the logged-in user's info
        await order.save();
        return res.json(order);
    } else {
        return res.status(400).json({ error: 'Status progression is not valid' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update order status' });
  }
};

// Dynamic filtering of orders based on criteria
export const filterOrders = async (req, res) => {
  try {
    const filters = {};

    if (req.query.status) {
      filters['status.name'] = req.query.status;
    }
    if (req.query.userId) {
      filters.userId = req.query.userId;
    }
    if (req.query.courier) {
      filters.courier = req.query.courier;
    }

    const orders = await Order.find(filters);
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to filter orders' });
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


export const getOrderById = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Fetch the order by ID
      const order = await Order.findById(id)
        .populate('cartItems.productId') // Populate the product details in the cartItems array
        .populate('status.user', 'name') // Populate the user's name for the status history
        .populate('employee', 'name') // Populate the employee's name
        .populate('userId', 'name'); // Populate the user's name who created the order
  
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      // Fetch all orders to determine the index
      const allOrders = await Order.find().sort({ createdAt: 1 }); // Sort orders by creation date
  
      // Calculate the order number as the index + 1
      const orderIndex = allOrders.findIndex(o => o._id.toString() === id);
      const orderNumber = orderIndex + 1;
  
      // Add the order number to the response
      const orderWithNumber = {
        ...order.toObject(), // Convert the order document to a plain JavaScript object
        orderNumber, // Add the calculated order number
      };
  
      res.status(200).json(orderWithNumber);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  export const getUserOrderByMobile = async (req, res) => {
    const { phone } = req.params; // Assuming the phone number is passed as a URL parameter
  
    try {
      // Find orders by phone number
      const orders = await Order.find({ phone }).populate('cartItems.productId').populate('userId').populate('employee');
  
      if (orders.length === 0) {
        return res.status(404).json({ message: 'No orders found for this mobile number' });
      }
  
      // Extract common user details (assuming all orders have the same user details)
      const userDetails = orders[0]; // Example, if all orders are from the same user
  
      // Format response data
      const responseData = {
        phone: userDetails.phone,
        name: userDetails.name,
        address: userDetails.address,
        orderList: orders.map(order => ({
          serialId: order.serialId,
          invoice: order.invoice,
          orderNotes: order.orderNotes,
          totalAmount: order.totalAmount,
          deliveryCharge: order.deliveryCharge,
          discount: order.discount,
          grandTotal: order.grandTotal,
          advanced: order.advanced,
          condition: order.condition,
          cartItems: order.cartItems.map(item => ({
            productId: item.productId,
            title: item.title,
            quantity: item.quantity,
            price: item.price,
            size: item.size
          })),
          paymentMethod: order.paymentMethod,
          status: order.status,
          courier: order.courier,
          employee: order.employee,
          note: order.note,
          lastNote: order.lastNote,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt
        }))
      };
  
      // Return the formatted response
      res.status(200).json(responseData);
    } catch (error) {
      // Handle any errors that occur during the query
      console.error(error);
      res.status(500).json({ message: 'Server error. Please try again later.' });
    }
  };

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

  export const getOrderByInvoice = async (req, res) => {
    try {
      const { invoice } = req.params;
        console.log(invoice);
        
      const order = await Order.findOne({ invoice });
  
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      res.status(200).json(order);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
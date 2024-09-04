// controllers/orderController.js

import mongoose from 'mongoose';
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
    return res.status(200).json({ message: 'Note added successfully', order });
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
    const { status, courier, date, page = 1, limit = 10 } = req.query;

    const filters = {};
    if (status) filters.status = { $elemMatch: { name: status } };
    if (courier) filters.courier = courier;
    if (date) {
      const startDate = new Date(date).setHours(0, 0, 0, 0);
      const endDate = new Date(date).setHours(23, 59, 59, 999);
      filters.createdAt = { $gte: startDate, $lte: endDate };
    }

    const orders = await Order.find(filters)
      .sort({ _id: -1 })
      .skip((page - 1) * limit) // Apply skip based on page number
      .limit(parseInt(limit))   // Limit the number of results
      .populate({
        path: 'cartItems.productId',
      })
      .populate('userId');

    const totalOrders = await Order.countDocuments(filters); // Total number of orders matching the filters
    const totalPages = Math.ceil(totalOrders / limit); // Calculate total pages

    res.json({ orders, totalOrders, totalPages, currentPage: parseInt(page) });
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


    const invoice = generateInvoiceNumber();
    // console.log("invoice:", invoice);

    const initialStatus = [{ name: 'new', user: null }];


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
      status: initialStatus
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
// export const updateOrderStatus = async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const { status, userId } = req.body;

//     console.log(orderId, status, userId);

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({ error: 'Invalid userId format' });
//     }

//     // Find the order by ID
//     const order = await Order.findById(orderId);
//     if (!order) {
//       return res.status(404).json({ error: 'Order not found' });
//     }

//     const statusHierarchy = ['new', 'pending', 'pendingPayment', 'confirm', 'hold',
//       'processing', 'sendToCourier', 'courierProcessing',
//       'delivered', 'partialReturn', 'returnWithDeliveryCharge',
//       'return', 'exchange', 'cancel'];


//     // Update the lastStatus field
//     order.lastStatus = {
//       name: status,
//       timestamp: new Date()
//     };

//     // Update product size details if the status is 'confirm'
//     if (status === 'confirm') {
//       for (const item of order.cartItems) {
//         const product = await Product.findById(item.productId);
//         if (product) {
//           const sizeDetail = product.sizeDetails.find(detail => detail.size === item.size);
//           if (sizeDetail) {
//             sizeDetail.openingStock -= item.quantity;
//             await product.save();
//           }
//         }
//       }
//     }
//     // Update the status
//     order.status.push({ name: status, user: userId, timestamp: new Date() });
//     await order.save();
//     return res.json(order);
//   } catch (error) {
//     console.error('Failed to update order status:', error);
//     return res.status(500).json({ error: 'Failed to update order status', details: error.message });
//   }
// };

// Update an order's status
// export const updateOrderStatus = async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const { status, userId } = req.body;

//     console.log(orderId, status, userId);

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({ error: 'Invalid userId format' });
//     }

//     // Find the order by ID
//     const order = await Order.findById(orderId);
//     if (!order) {
//       return res.status(404).json({ error: 'Order not found' });
//     }

//     const statusHierarchy = [
//       'new', 'pending', 'pendingPayment', 'confirm', 'hold',
//       'processing', 'sendToCourier', 'courierProcessing',
//       'delivered', 'partialReturn', 'returnWithDeliveryCharge',
//       'return', 'exchange', 'cancel'
//     ];

//     // Check if the new status is allowed according to the status hierarchy
//     const currentStatusIndex = statusHierarchy.indexOf(order.lastStatus.name);
//     const newStatusIndex = statusHierarchy.indexOf(status);

//     if (newStatusIndex < currentStatusIndex) {
//       return res.status(400).json({ error: `Cannot move from ${order.lastStatus.name} to ${status}` });
//     }

//     // Update the lastStatus field
//     order.lastStatus = {
//       name: status,
//       timestamp: new Date()
//     };

//     // Update product size details if the status is 'confirm'
//     if (status === 'confirm') {
//       for (const item of order.cartItems) {
//         const product = await Product.findById(item.productId);
//         if (product) {
//           const sizeDetail = product.sizeDetails.find(detail => detail.size === item.size);
//           if (sizeDetail) {
//             sizeDetail.openingStock -= item.quantity;
//             await product.save();
//           }
//         }
//       }
//     }

//     // Update the status
//     order.status.push({ name: status, user: userId, timestamp: new Date() });
//     await order.save();

//     return res.json(order);
//   } catch (error) {
//     console.error('Failed to update order status:', error);
//     return res.status(500).json({ error: 'Failed to update order status', details: error.message });
//   }
// };
// Update an order's status
// export const updateOrderStatus = async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const { status, userId } = req.body;

//     console.log(orderId, status, userId);

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({ error: 'Invalid userId format' });
//     }

//     // Find the order by ID
//     const order = await Order.findById(orderId);
//     if (!order) {
//       return res.status(404).json({ error: 'Order not found' });
//     }

//     // Define status groups based on the rules
//     const beforeConfirmAllowed = ['new', 'pending', 'pendingPayment', 'cancel'];
//     const beforeConfirmRestricted = [
//       'hold', 'processing', 'sendToCourier', 'courierProcessing',
//       'delivered', 'partialReturn', 'returnWithDeliveryCharge',
//       'return', 'exchange'
//     ];

//     const afterConfirmAllowed = [
//       'hold', 'processing', 'sendToCourier', 'courierProcessing',
//       'delivered', 'partialReturn', 'returnWithDeliveryCharge',
//       'return', 'exchange'
//     ];
//     const afterConfirmRestricted = ['new', 'pending', 'pendingPayment', 'cancel'];

//     const isConfirmed = order.status.some(s => s.name === 'confirm');

//     if (!isConfirmed) {
//       // Before confirmation logic
//       if (beforeConfirmRestricted.includes(status)) {
//         return res.status(400).json({
//           error: `Cannot move to ${status} before the order is confirmed. Allowed statuses: ${beforeConfirmAllowed.join(', ')}.`
//         });
//       }
//     } else {
//       // After confirmation logic
//       if (afterConfirmRestricted.includes(status)) {
//         return res.status(400).json({
//           error: `Cannot move to ${status} after the order is confirmed. Allowed statuses: ${afterConfirmAllowed.join(', ')}.`
//         });
//       }
//     }

//     // Update the lastStatus field
//     order.lastStatus = {
//       name: status,
//       timestamp: new Date()
//     };

//     // Update product size details if the status is 'confirm'
//     if (status === 'confirm') {
//       for (const item of order.cartItems) {
//         const product = await Product.findById(item.productId);
//         if (product) {
//           const sizeDetail = product.sizeDetails.find(detail => detail.size === item.size);
//           if (sizeDetail) {
//             sizeDetail.openingStock -= item.quantity;
//             await product.save();
//           }
//         }
//       }
//     }

//     // Update the status
//     order.status.push({ name: status, user: userId, timestamp: new Date() });
//     await order.save();

//     return res.json(order);
//   } catch (error) {
//     console.error('Failed to update order status:', error);
//     return res.status(500).json({ error: 'Failed to update order status', details: error.message });
//   }
// };

// Update an order's status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, userId } = req.body;


    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid userId format' });
    }

    // Find the order by ID
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Define status groups based on the rules
    const beforeConfirmAllowed = ['new', 'pending', 'pendingPayment', 'cancel'];
    const beforeConfirmRestricted = [
      'hold', 'processing', 'sendToCourier', 'courierProcessing',
      'delivered', 'partialReturn', 'returnWithDeliveryCharge',
      'return', 'exchange'
    ];

    const afterConfirmAllowed = [
      'hold', 'processing', 'sendToCourier', 'courierProcessing',
      'delivered', 'partialReturn', 'returnWithDeliveryCharge',
      'return', 'exchange'
    ];
    const afterConfirmRestricted = ['new', 'pending', 'pendingPayment', 'cancel'];

    const isConfirmed = order.status.some(s => s.name === 'confirm');
    const isCancelled = order.status.some(s => s.name === 'cancel');

    // Restrict all statuses if the order is already canceled
    if (isCancelled) {
      return res.status(400).json({
        error: `Order is already canceled. No further status updates are allowed.`
      });
    }

    if (!isConfirmed) {
      // Before confirmation logic
      if (beforeConfirmRestricted.includes(status)) {
        return res.status(400).json({
          error: `Cannot move to ${status} before the order is confirmed.`
        });
      }
    } else {
      // After confirmation logic
      if (afterConfirmRestricted.includes(status)) {
        return res.status(400).json({
          error: `Cannot move to ${status} after the order is confirmed.`
        });
      }
    }

    // Update the lastStatus field
    order.lastStatus = {
      name: status,
      timestamp: new Date()
    };

    // Update product size details if the status is 'confirm'
    if (status === 'confirm') {
      for (const item of order.cartItems) {
        const product = await Product.findById(item.productId);
        if (product) {
          const sizeDetail = product.sizeDetails.find(detail => detail.size === item.size);
          if (sizeDetail) {
            sizeDetail.openingStock -= item.quantity;
            await product.save();
          }
        }
      }
    }

    // Update the status
    order.status.push({ name: status, user: userId, timestamp: new Date() });
    await order.save();

    return res.json(order);
  } catch (error) {
    console.error('Failed to update order status:', error);
    return res.status(500).json({ error: 'Failed to update order status', details: error.message });
  }
};




// Filter Orders Dynamically Based on Query Parameters
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

    const orders = await Order.find(filters).sort({ createdAt: -1 }); // Sort by newest orders first
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to filter orders', details: error.message });
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
        lastStatus:order.lastStatus,
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


export const getAllStatusByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Find the order by its ID and select only the status field
    const order = await Order.findById(orderId).select('status').populate('status.user', 'name fullName');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Return the status array
    res.status(200).json(order.status);
  } catch (error) {
    console.error('Error fetching order status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllOrdersWithLastStatus = async (req, res) => {
  try {
    // Aggregation pipeline to get orders with the latest status in an array
    const orders = await Order.aggregate([
      // Unwind the status array to work with individual status documents
      { $unwind: "$status" },
      // Sort statuses by timestamp in descending order
      { $sort: { "status.timestamp": -1 } },
      // Group by order id and take the latest status
      {
        $group: {
          _id: "$_id",
          serialId: { $first: "$serialId" },
          invoice: { $first: "$invoice" },
          orderNotes: { $first: "$orderNotes" },
          name: { $first: "$name" },
          address: { $first: "$address" },
          area: { $first: "$area" },
          phone: { $first: "$phone" },
          altPhone: { $first: "$altPhone" },
          totalAmount: { $first: "$totalAmount" },
          deliveryCharge: { $first: "$deliveryCharge" },
          discount: { $first: "$discount" },
          grandTotal: { $first: "$grandTotal" },
          advanced: { $first: "$advanced" },
          condition: { $first: "$condition" },
          cartItems: { $first: "$cartItems" },
          paymentMethod: { $first: "$paymentMethod" },
          courier: { $first: "$courier" },
          employee: { $first: "$employee" },
          userId: { $first: "$userId" },
          notes: { $first: "$notes" },
          // Collect the latest status into an array
          status: { $push: "$status" }
        }
      },
      // Sort by order ID if needed
      { $sort: { serialId: 1 } } // Optional sorting
    ]);

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// manage Order or edit order
export const manageOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { cartItems, advanced, discount, adminDiscount, totalAmount, grandTotal, dueAmount } = req.body;

    if (
      cartItems === undefined &&
      advanced === undefined &&
      discount === undefined &&
      adminDiscount === undefined &&
      totalAmount === undefined &&
      grandTotal === undefined &&
      dueAmount === undefined
    ) {
      return res.status(400).json({ error: 'At least one field must be provided' });
    }

    // Update fields
    const updateFields = {};
    if (cartItems !== undefined) updateFields.cartItems = cartItems;
    if (advanced !== undefined) updateFields.advanced = advanced;
    if (discount !== undefined) updateFields.discount = discount;
    if (adminDiscount !== undefined) updateFields.adminDiscount = adminDiscount;
    if (totalAmount !== undefined) updateFields.totalAmount = totalAmount;
    if (grandTotal !== undefined) updateFields.grandTotal = grandTotal;
    if (dueAmount !== undefined) updateFields.dueAmount = dueAmount;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



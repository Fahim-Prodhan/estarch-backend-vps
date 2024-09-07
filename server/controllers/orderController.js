// controllers/orderController.js
import fetch from 'node-fetch';
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
  const page = parseInt(req.query.page) || 1; // Default to 1 if page is not provided
  const size = parseInt(req.query.size) || 10;
  const text = req.query.search || '';
  const status = req.query.status;
  const date = req.query.date; // Local date in 'YYYY-MM-DD' format

  console.log(date);

  try {

    let query = {
      $and: [
        {
          $or: [
            { invoice: { $regex: text, $options: "i" } },
            { phone: { $regex: text, $options: "i" } }
          ]
        },
        { serialId: "E-commerce" }
      ]
    };
    
    if (status) {
      query['lastStatus.name'] = status;
    }

    if (date) {
      // Convert the local date to the start and end of the UTC day
      const localDate = new Date(date);

      // Start of the day in local time
      const startDateLocal = new Date(
        localDate.getFullYear(),
        localDate.getMonth(),
        localDate.getDate(),
        0, 0, 0, 0
      );

      // Convert to UTC
      const startDateUTC = new Date(startDateLocal.toUTCString());

      // End of the day in local time (start of the next day)
      const endDateLocal = new Date(startDateLocal);
      endDateLocal.setDate(startDateLocal.getDate() + 1);

      // Convert to UTC
      const endDateUTC = new Date(endDateLocal.toUTCString());

      query['createdAt'] = { $gte: startDateUTC, $lt: endDateUTC };
    }

    const orders = await Order.find(query)
      .sort({ _id: -1 })
      .skip((page - 1) * size) // Apply skip based on page number
      .limit(size) // Limit the number of results
      .populate({
        path: 'cartItems.productId',
      })
      .populate('userId');

    const totalOrders = await Order.countDocuments(query); // Total number of orders matching the filters
    const totalPages = Math.ceil(totalOrders / size); // Calculate total pages
 
    res.json({
      orders,
      totalOrders,
      totalPages,
      currentPage: page,

    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
    console.log(error);
  }
};

export const updateOrderIsPrint = async (req, res) => {
  const { orderId } = req.params; // Assuming you're passing the order ID as a URL parameter

  try {
    const result = await Order.updateOne(
      { _id: orderId }, // Find the order by its ID
      { $set: { isPrint: true } } // Set the isPrint property to true
    );

  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
    console.log(error);
  }
};


export const getCountOfStatus = async (req, res) => {
  try {
    const new_orders = await Order.countDocuments({
      'lastStatus.name': 'new',
      serialId: 'E-commerce'
    });
    
    const pending = await Order.countDocuments({ 'lastStatus.name': 'pending',serialId: 'E-commerce' });
    const pendingPayment = await Order.countDocuments({ 'lastStatus.name': 'pendingPayment',serialId: 'E-commerce' });
    const confirm = await Order.countDocuments({ 'lastStatus.name': 'confirm',serialId: 'E-commerce' });
    const hold = await Order.countDocuments({ 'lastStatus.name': 'hold',serialId: 'E-commerce' });
    const processing = await Order.countDocuments({ 'lastStatus.name': 'processing',serialId: 'E-commerce' });
    const sendToCourier = await Order.countDocuments({ 'lastStatus.name': 'sendToCourier',serialId: 'E-commerce' });
    const courierProcessing = await Order.countDocuments({ 'lastStatus.name': 'courierProcessing',serialId: 'E-commerce' });
    const delivered = await Order.countDocuments({ 'lastStatus.name': 'delivered',serialId: 'E-commerce' });
    const partialReturn = await Order.countDocuments({ 'lastStatus.name': 'partialReturn',serialId: 'E-commerce' });
    const returnWithDeliveryCharge = await Order.countDocuments({ 'lastStatus.name': 'returnWithDeliveryCharge',serialId: 'E-commerce' });
    const return_delivery = await Order.countDocuments({ 'lastStatus.name': 'return',serialId: 'E-commerce' });
    const exchange = await Order.countDocuments({ 'lastStatus.name': 'exchange',serialId: 'E-commerce' });
    const cancel = await Order.countDocuments({ 'lastStatus.name': 'cancel',serialId: 'E-commerce' });
    const doubleOrderCancel = await Order.countDocuments({ 'lastStatus.name': 'doubleOrderCancel',serialId: 'E-commerce' });
    res.send({
      new_orders,
      pending,
      pendingPayment,
      confirm,
      hold,
      processing,
      sendToCourier,
      courierProcessing,
      delivered,
      partialReturn,
      returnWithDeliveryCharge,
      return_delivery,
      exchange,
      cancel,
      doubleOrderCancel
    })
  } catch (error) {
    console.log(error);
  }
}






// Utility function to delay execution for a given number of milliseconds
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function sendSMS(primaryUrl, fallbackUrls) {
  let smsSent = false;
  let retryCount = 0;
  const maxRetries = 5; // Set a limit for retries
  const retryDelay = 200; // Delay between retries in milliseconds (2 seconds)

  while (!smsSent && retryCount < maxRetries) {
    try {
      // Attempt to send SMS with the primary URL
      const response = await fetch(primaryUrl, { method: 'GET' });
      const data = await response.json();

      if (data.Status === "0" && data.Text === "ACCEPTD") {
        console.log('SMS sent successfully with primary URL:', data);
        smsSent = true; // Exit the loop when SMS is sent successfully
        return data;
      } else {
        // Try fallback URLs if the primary URL fails
        for (const url of fallbackUrls) {
          try {
            const fallbackResponse = await fetch(url, { method: 'GET' });
            const fallbackData = await fallbackResponse.json();

            if (fallbackData.Status === "0" && fallbackData.Text === "ACCEPTD") {
              console.log('SMS sent successfully with fallback URL:', fallbackData);
              smsSent = true; // Exit the loop when SMS is sent successfully
              return fallbackData;
            }
          } catch (fallbackError) {
            console.error('Error sending SMS with fallback URL:', url, fallbackError);
          }
        }
      }

      // If no successful SMS was sent, log and retry
      retryCount++;
      console.error(`Retry ${retryCount}/${maxRetries}... SMS could not be sent with any of the URLs. Retrying in ${retryDelay / 1000} seconds...`);
      await delay(retryDelay); // Wait before retrying
    } catch (error) {
      console.error('Error sending SMS with primary URL:', error);
      retryCount++;
      console.error(`Retry ${retryCount}/${maxRetries}... Retrying in ${retryDelay / 1000} seconds...`);
      await delay(retryDelay); // Wait before retrying
    }
  }

  if (!smsSent) {
    throw new Error('SMS could not be sent after maximum retries.');
  }
}

// Example of how to use sendSMS in your createOrder function
export const createOrder = async (req, res) => {
  try {
    // Extract order data from request
    const {
      serialId, orderNotes, name, address, area, phone, altPhone, notes,
      totalAmount, deliveryCharge, discount, grandTotal, advanced,
      condition, cartItems, paymentMethod, courier, employee, userId, manager, payments, exchangeDetails,exchangeAmount
    } = req.body;

    const invoice = generateInvoiceNumber();
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
      manager,
      status: initialStatus,
      payments ,exchangeDetails,exchangeAmount
    });
    // Define primary and fallback SMS URLs
    const primaryUrl = `https://smpp.revesms.com:7790/sendtext?apikey=2e2d49f9273cc83c&secretkey=f4bef7bd&callerID=1234&toUser=${phone}&messageContent=Thanks%20for%20Choosing%20'ESTARCH'%0AINV:%20${invoice}%0APaid:${totalAmount}TK%0AJoin%20us%20with%20Facebook%20:%20https://www.facebook.com/Estarch.com.bd%0AC.Care:%20+8801706060651`;

    const fallbackUrls = [
      `http://smpp.revesms.com:7788/sendtext?apikey=2e2d49f9273cc83c&secretkey=f4bef7bd&callerID=1234&toUser=${phone}&messageContent=Thanks%20for%20Choosing%20'ESTARCH'%0AINV:%20${invoice}%0APaid:${totalAmount}TK%0AJoin%20us%20with%20Facebook%20:%20https://www.facebook.com/Estarch.com.bd%0AC.Care:%20+8801706060651`,
      `http://103.177.125.106:7788/sendtext?apikey=2e2d49f9273cc83c&secretkey=f4bef7bd&callerID=1234&toUser=${phone}&messageContent=Thanks%20for%20Choosing%20'ESTARCH'%0AINV:%20${invoice}%0APaid:${totalAmount}TK%0AJoin%20us%20with%20Facebook%20:%20https://www.facebook.com/Estarch.com.bd%0AC.Care:%20+8801706060651`
    ];

    // Send SMS only if serialId is 'showroom'
    if (serialId === 'showroom') {
      try {
        const response = await sendSMS(primaryUrl, fallbackUrls);
        console.log('Final Response:', response);
      } catch (error) {
        console.error('Failed to send SMS after maximum retries:', error);
      }
    }

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
    const beforeConfirmAllowed = ['new', 'pending', 'pendingPayment', 'cancel', 'doubleOrderCancel'];
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
    const isDoubleOrderCancel = order.status.some(s => s.name === 'doubleOrderCancel');

    // Restrict all statuses if the order is already canceled
    if (isCancelled || isDoubleOrderCancel) {
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
    const orderId = req.params.id;

    // Find the order by ID and populate related fields
    const orderWithDetails = await Order.findById(orderId)
      .populate('userId', 'name email')
      .populate('cartItems.productId', 'productName SKU sizeDetails')
      .populate('exchangeDetails.items.productId','productName SKU sizeDetails') // Populate sizeDetails for exchange items
      .populate('manager', 'fullName')
      .populate('employee', 'name');
    if (!orderWithDetails) {
      return res.status(404).json({ message: 'Order not found' });
    }
    // Fetch all orders to determine the index
    const allOrders = await Order.find().sort({ createdAt: 1 });

    // Calculate the order number as the index + 1
    const orderIndex = allOrders.findIndex(o => o._id.toString() === orderId);
    const orderNumber = orderIndex + 1;

    // Modify cartItems to include barcode and SKU
    const modifiedCartItems = orderWithDetails.cartItems.map((item) => {
      const product = item.productId;
      const sizeDetail = product.sizeDetails.find(size => size.size === item.size);

      return {
        ...item.toObject(),  // Convert Mongoose document to plain JS object
        barcode: sizeDetail ? sizeDetail.barcode : '',  // Add barcode from sizeDetails
        SKU: product.SKU  // Add SKU from productId
      };
    });

    let modifiedExchangeItems = [];

    // Check if exchangeAmount is not null and modify exchangeDetails items
    if (orderWithDetails.exchangeAmount !== null && orderWithDetails.exchangeDetails && orderWithDetails.exchangeDetails.items) {
      modifiedExchangeItems = orderWithDetails.exchangeDetails.items.map((item) => {
        const product = item.productId;
        const sizeDetail = product.sizeDetails.find(size => size.size === item.size);

        return {
          ...item.toObject(),  // Convert Mongoose document to plain JS object
          barcode: sizeDetail ? sizeDetail.barcode : '',  // Add barcode from sizeDetails
          SKU: product.SKU  // Add SKU from productId
        };
      });
    }

    // Prepare the final response
    const orderWithNumberAndModifiedItems = {
      ...orderWithDetails.toObject(),  // Convert Mongoose document to plain JS object
      orderNumber,
      cartItems: modifiedCartItems,  // Add modified cartItems
      exchangeDetails: {
        ...orderWithDetails.exchangeDetails.toObject(),  // Convert exchangeDetails to plain JS object
        items: modifiedExchangeItems  // Add modified exchangeDetails items
      }
    };

    res.status(200).json(orderWithNumberAndModifiedItems);
  } catch (error) {
    console.error('Error fetching order:', error);
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
        lastStatus: order.lastStatus,
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

export const getManagerSalesStats = async (req, res) => {
  try {
    const {  startDate, endDate } = req.query;
    const { managerId } = req.params;

    // Validate managerId
    if (!mongoose.Types.ObjectId.isValid(managerId)) {
      return res.status(400).json({ message: 'Invalid managerId' });
    }

    // Create date filter
    const dateFilter = {};
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    if (startDate) {
      dateFilter.$gte = new Date(startDate);
    } else {
      dateFilter.$gte = startOfDay;
    }

    if (endDate) {
      dateFilter.$lte = new Date(endDate);
    } else {
      dateFilter.$lte = endOfDay;
    }

    // Fetch orders with managerId and date range filter
    const orders = await Order.find({
      manager: new mongoose.Types.ObjectId(managerId),
      createdAt: dateFilter,
    });

    // Initialize counters
    let totalSellCount = 0;
    let totalSellAmount = 0;
    let totalExchangeAmount = 0;
    let totalCashAmount = 0;
    let totalCardAmount = 0;
    let totalOnlineAmount = 0;

    orders.forEach(order => {
      totalSellCount += order.cartItems.length;
      totalSellAmount += order.grandTotal;
      totalExchangeAmount += order.exchangeAmount || 0;

      // Calculate the total cash amount
      let totalPayments = 0;
      order.payments.forEach(payment => {
        totalPayments += parseFloat(payment.amount);
        switch (payment.type) {
          case 'Card':
            totalCardAmount += parseFloat(payment.amount);
            break;
          case 'Online':
            totalOnlineAmount += parseFloat(payment.amount);
            break;
          default:
            break;
        }
      });

      // Cash amount is total order amount minus total payments
      const orderCashAmount = order.grandTotal - totalPayments;
      totalCashAmount += orderCashAmount;
    });

    res.status(200).json({
      totalSellCount,
      totalSellAmount,
      totalExchangeAmount,
      totalCashAmount,
      totalCardAmount,
      totalOnlineAmount,
    });
  } catch (error) {
    console.error('Error fetching manager sales stats:', error);
    res.status(500).json({ message: 'An error occurred', error: error.message || error });
  }
};


export const getShowroomOrders = async (req, res) => {
  try {
    const showroomOrders = await Order.find({ serialId: 'showroom' });
    res.status(200).json(showroomOrders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching showroom orders', error });
  }
};
// controllers/orderController.js
import fetch from 'node-fetch';
import mongoose from 'mongoose';
import Order from '../models/order.js'; // Adjust the import path based on your file structure
import Product from "../models/product.js";
import moment from 'moment';
import UserPaymentOption from '../models/UserPaymentOption.js'; // Assuming this is the model for user payment options
import CourierAccount from '../models/courierAccount.js';
import Expense from '../models/expense.js';
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
    const { orderId } = req.params;
    const { adminName, noteContent } = req.body;
    console.log(orderId, adminName, noteContent);
    if (!adminName || !noteContent) {
      return res.status(400).json({ message: 'Both adminName and noteContent are required' });
    }
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
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
  let text = req.query.search || '';
  let searchOrderNo = req.query.searchOrderNo || '';
  let status = req.query.status;
  let date = req.query.date; // Local date in 'YYYY-MM-DD' format

  try {
    let query = { $and: [] };



    if (text) {
      status = ''
      date = ''
      searchOrderNo = ''
      query['$and'].push({
        $or: [
          { invoice: { $regex: text, $options: "i" } },
          { phone: { $regex: text, $options: "i" } },
        ]
      });
    }



    if (searchOrderNo) {
      status = ''
      date = ''
      text = ''
      query['$and'].push({
        $or: [
          { orderNo: searchOrderNo },
        ]
      });
    }

    // Filter by serialId
    query['$and'].push({
      serialId: { $in: ["E-commerce", "Store", "Facebook", "WhatsApp", "App"] }
    });

    // Filter by status if provided
    if (status) {
      query['$and'].push({
        'lastStatus.name': status
      });
    }

    // Filter by date if provided
    if (date) {
      const startDateLocal = new Date(`${date}T00:00:00`);
      const endDateLocal = new Date(`${date}T23:59:59`);

      query['$and'].push({
        createdAt: {
          $gte: startDateLocal.toISOString(),
          $lt: endDateLocal.toISOString()
        }
      });
    }

    // If no conditions were pushed to $and, use an empty object (fetch all orders)
    if (query['$and'].length === 0) {
      query = {};
    }

    const orders = await Order.find(query)
      // .sort({ updatedAt: -1, createdAt: -1 }) // Prioritize updatedAt, fallback to createdAt
      .sort({ 'lastStatus.timestamp': -1 })
      .skip((page - 1) * size)
      .limit(size)
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
    res.status(500).json({ error: 'Failed to fetch orders', details: error.message });
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
    // Define the list of serialIds
    const serialIds = ["E-commerce", "Store", "Facebook", "WhatsApp"];

    // Fetch counts for each status using Order.countDocuments
    const new_orders = await Order.countDocuments({
      'lastStatus.name': 'new',
      serialId: { $in: serialIds }
    });

    const pending = await Order.countDocuments({
      'lastStatus.name': 'pending',
      serialId: { $in: serialIds }
    });

    const pendingPayment = await Order.countDocuments({
      'lastStatus.name': 'pendingPayment',
      serialId: { $in: serialIds }
    });

    const confirm = await Order.countDocuments({
      'lastStatus.name': 'confirm',
      serialId: { $in: serialIds }
    });

    const hold = await Order.countDocuments({
      'lastStatus.name': 'hold',
      serialId: { $in: serialIds }
    });

    const processing = await Order.countDocuments({
      'lastStatus.name': 'processing',
      serialId: { $in: serialIds }
    });

    const sendToCourier = await Order.countDocuments({
      'lastStatus.name': 'sendToCourier',
      serialId: { $in: serialIds }
    });

    const courierProcessing = await Order.countDocuments({
      'lastStatus.name': 'courierProcessing',
      serialId: { $in: serialIds }
    });

    const delivered = await Order.countDocuments({
      'lastStatus.name': 'delivered',
      serialId: { $in: serialIds }
    });

    const partialReturn = await Order.countDocuments({
      'lastStatus.name': 'partialReturn',
      serialId: { $in: serialIds }
    });

    const returnWithDeliveryCharge = await Order.countDocuments({
      'lastStatus.name': 'returnWithDeliveryCharge',
      serialId: { $in: serialIds }
    });

    const return_delivery = await Order.countDocuments({
      'lastStatus.name': 'return',
      serialId: { $in: serialIds }
    });

    const exchange = await Order.countDocuments({
      'lastStatus.name': 'exchange',
      serialId: { $in: serialIds }
    });

    const cancel = await Order.countDocuments({
      'lastStatus.name': 'cancel',
      serialId: { $in: serialIds }
    });

    const doubleOrderCancel = await Order.countDocuments({
      'lastStatus.name': 'doubleOrderCancel',
      serialId: { $in: serialIds }
    });

    const courierReturn = await Order.countDocuments({
      'lastStatus.name': 'courierReturn',
      serialId: { $in: serialIds }
    });

    // Send the results as a response
    res.status(200).send({
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
      doubleOrderCancel,
      courierReturn
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: 'An error occurred while fetching order status counts' });
  }
};







// Utility function to delay execution for a given number of milliseconds
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function sendSMS(primaryUrl) {
  let smsSent = false;
  let retryCount = 0;
  const maxRetries = 5; // Set a limit for retries
  const retryDelay = 200;

  while (!smsSent && retryCount < maxRetries) {
    try {
      // Attempt to send SMS with the primary URL
      const response = await fetch(primaryUrl, { method: 'GET' });
      const data = await response.json();

      if (data.Status === "0" && data.Text === "ACCEPTD") {
        console.log('SMS sent successfully with primary URL:', data);
        smsSent = true; // Exit the loop when SMS is sent successfully
        return data;
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

export const createOrder = async (req, res) => {
  try {
    const {
      orderNotes, name, address, area, phone, notes,
      advanced, condition, cartItems, paymentMethod,
      userId,coupon,serialId
    } = req.body;

    console.log( orderNotes, name, address, area, phone, notes,
      advanced, condition, cartItems, paymentMethod,
      userId,coupon);
    


    const invoice = generateInvoiceNumber();
    const initialStatus = [{ name: 'new', user: null }];

    // Find the last order and get the highest orderNo
    // const lastOrder = await Order.countDocuments();
    const lastOrder = await Order.findOne().sort({ orderNo: -1 }).select('orderNo');
    
    // Set the orderNo to be last order's orderNo + 1 or 1 if this is the first order
    const newOrderNo = lastOrder.orderNo ? parseInt(lastOrder.orderNo + 1) : 1;

    let totalDiscount = 0;
    let totalAmount = 0;
    let deliveryCharge = 0;

    if (area === 'Inside Dhaka') {
      deliveryCharge = 60;
    } else if (area === 'Outside Dhaka') {
      deliveryCharge = 120;
    }
    const updatedCartItems = await Promise.all(cartItems.map(async (item) => {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }
      const sizeDetail = product.sizeDetails.find(size => size.size === item.size);
      const price = sizeDetail ? sizeDetail.salePrice : product.salePrice;
      const discountAmount = sizeDetail ? sizeDetail.discountAmount : (product.discount?.amount || 0);


      totalAmount += price * item.quantity;
      totalDiscount += discountAmount * item.quantity;

      return {
        ...item,
        price,
        discountAmount
      };
    }));
    const grandTotal = totalAmount + deliveryCharge - coupon?.discountAmount;
    const order = new Order({
      serialId: serialId || 'E-commerce',
      invoice,
      orderNotes,
      name,
      address,
      area,
      phone,
      notes,
      totalAmount,
      deliveryCharge,
      discount: totalDiscount,
      grandTotal,
      dueAmount: grandTotal,
      advanced,
      condition,
      cartItems: updatedCartItems,
      paymentMethod,
      userId,
      status: initialStatus,
      orderNo: newOrderNo,
      coupon: coupon
    });
    await order.save();
    return res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    console.error('Error placing order:', error);
    return res.status(500).json({ message: 'Server error', error });
  }
};


export const createOnlinePosOrder = async (req, res) => {
  try {
    // Extract order data from request
    const {
      serialId, orderNotes, name, address, area, phone, altPhone, notes,
      totalAmount, deliveryCharge, discount, grandTotal, advanced,
      condition, cartItems, paymentMethod, courier, employee, userId, manager, payments,
      exchangeDetails, exchangeAmount, adminDiscount
    } = req.body;

    // Fetch the UserPaymentOption based on the manager/userId
    const userPaymentOptions = await UserPaymentOption.findOne({ userId: manager });
    console.log(userPaymentOptions);


    if (!userPaymentOptions || !userPaymentOptions.paymentOption) {
      console.log('User Payment Options or accounts not found for this manager');

      return res.status(404).json({ message: 'User Payment Options or accounts not found for this manager' });
    }

    console.log(payments);
    
    // Validate payments before processing
    if (!payments || !Array.isArray(payments) || payments.length !== 0) {
      // Validate and update payment details
      for (const payment of payments) {
        const account = userPaymentOptions.paymentOption.accounts.find(acc => acc.accountType === payment.accountType);
        const paymentOption = account.payments.find(p => p.paymentOption === payment.paymentOption);
       if (paymentOption) {
        payment.accountNumber = paymentOption.accountNumber;
        paymentOption.amount += Number(payment.amount); // Ensure this is a number
       }
      }
      await userPaymentOptions.save();
    }

    const invoice = generateInvoiceNumber();
    const initialStatus = [{ name: 'new', user: null }];
    // Find the last order and get the highest orderNo
    // const lastOrder = await Order.countDocuments({});
    // // Set the orderNo to be last order's orderNo + 1 or 1 if this is the first order
    // const newOrderNo = lastOrder ? parseInt(lastOrder + 1) : 1;

    const lastOrder = await Order.findOne().sort({ orderNo: -1 }).select('orderNo');  
    // Set the orderNo to be last order's orderNo + 1 or 1 if this is the first order
    const newOrderNo = lastOrder.orderNo ? parseInt(lastOrder.orderNo + 1) : 1;

    // Create the order with the given data
    const order = new Order({
      serialId,
      invoice,
      orderNotes,
      orderNo: newOrderNo,
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
      payments, // Include the updated payments
      exchangeDetails,
      exchangeAmount,
      adminDiscount,
      orderNo: newOrderNo
    });

    // Update stock for each cart item (reduce stock)
    // for (const item of cartItems) {
    //   console.log(item.productId);
    //   const product = await Product.findById(item.productId);
    //   console.log(product);
    //   if (product) {
    //     const sizeDetail = product.sizeDetails.find(size => size.size === item.size);
    //     if (sizeDetail) {
    //       sizeDetail.openingStock -= item.quantity; // Reduce stock
    //       await product.save(); // Save updated product
    //     }
    //   }
    // }

    // Update stock for each exchange item (increase stock)
    if (exchangeDetails && exchangeDetails.items) {
      // Loop through the exchanged items
      for (const exchangeItem of exchangeDetails.items) {
        const product = await Product.findById(exchangeItem.productId);
        if (product) {
          const sizeDetail = product.sizeDetails.find(size => size.size === exchangeItem.size);
          if (sizeDetail) {
            sizeDetail.openingStock += exchangeItem.quantity; // Increase stock for exchange
            await product.save(); // Save updated product
          }
        }
      }

      // Find the order by the exchangeDetails invoiceNo
      const order = await Order.findOne({ "invoice": exchangeDetails.invoiceNo });
      if (order) {
        // Update the lastStatus to 'exchange'
        order.lastStatus = {
          name: 'exchange',
          timestamp: new Date()
        };

        // Save the updated order
        await order.save();
      } else {
        console.log('Order with this invoice number not found.');
      }
    }

    await order.save();

    return res.status(201).json({ message: 'Order placed successfully' });
  } catch (error) {
    console.error('Error placing order:', error);
    return res.status(500).json({ message: 'Server error', error });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid userId format' });
    }
    const order = await Order.findById(orderId);
    // Find the order by ID
    if (status === 'delivered') {
      const amount = order.grandTotal - order.advanced;
      const account = await CourierAccount.findOne();
      account.availableAmount += amount;
      order.advanced = order.grandTotal;
      await account.save();
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Define status groups based on the rules
    const beforeConfirmAllowed = ['new', 'pending', 'pendingPayment', 'cancel', 'doubleOrderCancel'];
    const beforeConfirmRestricted = [
      'hold', 'processing', 'sendToCourier', 'courierProcessing',
      'delivered', 'partialReturn', 'returnWithDeliveryCharge',
      'return', 'exchange', 'courierReturn'
    ];

    const afterConfirmAllowed = [
      'hold', 'processing', 'sendToCourier', 'courierProcessing',
      'delivered', 'partialReturn', 'returnWithDeliveryCharge',
      'return', 'exchange', 'courierReturn'
    ];
    const afterConfirmRestricted = ['new', 'pending', 'pendingPayment', 'cancel', 'confirm', 'doubleOrderCancel'];

    const isConfirmed = order.status.some(s => s.name === 'confirm');
    const isCancelled = order.status.some(s => s.name === 'cancel');
    const isDoubleOrderCancel = order.status.some(s => s.name === 'doubleOrderCancel');

    const currentStatus = order.lastStatus?.name;

    // Restrict all statuses if the order is already canceled
    if (isCancelled || isDoubleOrderCancel) {
      return res.status(400).json({
        error: `Order is already canceled. No further status updates are allowed.`
      });
    }

    // Restriction based on confirmation status
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
      // Additional condition after 'confirm' status
      const allowedAfterConfirm = ['hold', 'processing', 'sendToCourier'];
      if (!allowedAfterConfirm.includes(status) && currentStatus === 'confirm') {
        return res.status(400).json({
          error: `After 'confirm', status can only be updated to 'hold', 'processing', or 'sendToCourier' directly. Cannot skip to ${status}.`
        });
      }
      // Restriction on transitioning from 'hold' or 'processing'
      if (currentStatus === 'hold' || currentStatus === 'processing') {
        const notAllowedFromHoldOrProcessing = ['courierProcessing', 'delivered', 'courierReturn'];
        if (notAllowedFromHoldOrProcessing.includes(status)) {
          return res.status(400).json({
            error: `Cannot move to ${status} directly from '${currentStatus}'.`
          });
        }
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
      .populate('cartItems.productId', 'productName SKU sizeDetails selectedCategoryName selectedBrand ')
      .populate('exchangeDetails.items.productId', 'productName SKU sizeDetails') // Populate sizeDetails for exchange items
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
      const responseData = {
        phone: phone,
        name: '',
        address: '',
        orderList:[]
      };
  
      return res.status(404).json(responseData);
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

    const order = await Order.findOne({ invoice})
    .populate('userId', 'name email')
    .populate('cartItems.productId', 'productName SKU sizeDetails selectedCategoryName selectedBrand ')
    .populate('exchangeDetails.items.productId', 'productName SKU sizeDetails') // Populate sizeDetails for exchange items
    .populate('manager', 'fullName')
    .populate('employee', 'name');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getLastOrderBySerialId = async (req, res) => {
  try {
    const order = await Order.findOne({ serialId: "showroom" })
      .sort({ createdAt: -1 }) // Sort in descending order to get the latest
      .lean(); // Use lean() for faster response

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
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
    const { manager, payments, newPayments, name, address, phone, orderNotes, deliveryCharge, cartItems, advanced, discount, adminDiscount, totalAmount, grandTotal, dueAmount } = req.body;

    // Check if at least one field is provided
    if (
      name === undefined &&
      address === undefined &&
      phone === undefined &&
      orderNotes === undefined &&
      deliveryCharge === undefined &&
      cartItems === undefined &&
      advanced === undefined &&
      discount === undefined &&
      adminDiscount === undefined &&
      totalAmount === undefined &&
      grandTotal === undefined &&
      dueAmount === undefined &&
      payments === undefined &&
      newPayments === undefined

    ) {
      return res.status(400).json({ error: 'At least one field must be provided' });
    }

    // Validate orderId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    // Convert productId in cartItems to ObjectId if it's a string
    if (cartItems && Array.isArray(cartItems)) {
      cartItems.forEach(item => {
        if (item.productId && typeof item.productId === 'string') {
          try {
            item.productId = mongoose.Types.ObjectId(item.productId);
          } catch (err) {
            console.error('Invalid productId:', item.productId);
            return res.status(400).json({ error: 'Invalid productId in cart items' });
          }
        }
      });
    }

    // Prepare fields to update
    const updateFields = {};
    if (deliveryCharge !== undefined) updateFields.deliveryCharge = deliveryCharge;
    if (orderNotes !== undefined) updateFields.orderNotes = orderNotes;
    if (phone !== undefined) updateFields.phone = phone;
    if (address !== undefined) updateFields.address = address;
    if (name !== undefined) updateFields.name = name;
    if (cartItems !== undefined) updateFields.cartItems = cartItems;
    if (advanced !== undefined) updateFields.advanced = advanced;
    if (discount !== undefined) updateFields.discount = discount;
    if (adminDiscount !== undefined) updateFields.adminDiscount = adminDiscount;
    if (totalAmount !== undefined) updateFields.totalAmount = totalAmount;
    if (grandTotal !== undefined) updateFields.grandTotal = grandTotal;
    if (dueAmount !== undefined) updateFields.dueAmount = dueAmount;
    if (payments !== undefined) updateFields.payments = payments;

    console.log('Update fields:', updateFields);

    // Update the order in the database
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );
    // Check if the order was found and updated
    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const userPaymentOptions = await UserPaymentOption.findOne({ userId: manager });
    if (!userPaymentOptions || !userPaymentOptions.paymentOption) {
      console.log('User Payment Options or accounts not found for this manager');
      return res.status(404).json({ message: 'User Payment Options or accounts not found for this manager' });
    }

    // Validate payments before processing
    if (!newPayments || !Array.isArray(newPayments) || newPayments.length === 0) {
      console.log('No payment information provided');

      return res.status(400).json({ message: 'No payment information provided' });
    }
    // Validate and update payment details
    if (newPayments.length === 0) {
      return res.status(400).json({ message: "No payments provided" });
    }

    for (const payment of newPayments) {
      const account = userPaymentOptions.paymentOption.accounts.find(acc => acc.accountType === payment.accountType);
      if (!account) {
        return res.status(400).json({ message: `Account type ${payment.accountType} not found` });
      }
      console.log(account);

      const paymentOption = account.payments.find(p => p.paymentOption === payment.paymentOption);
      if (!paymentOption) {
        return res.status(400).json({ message: `Payment option ${payment.paymentOption} not found for account type ${payment.accountType}` });
      }

      // Assign accountNumber and update the amount
      payment.accountNumber = paymentOption.accountNumber;

      // Ensure the amount is a number
      const amountToAdd = Number(payment.amount);
      if (isNaN(amountToAdd)) {
        return res.status(400).json({ message: `Invalid amount provided for payment option ${payment.paymentOption}` });
      }
      console.log(paymentOption);

      paymentOption.amount += amountToAdd; // Update the amount
    }

    // Save updated user payment options after modifying payment amounts
    await userPaymentOptions.save();

    // Return the updated order
    res.json(updatedOrder);

  } catch (error) {
    console.error('Error updating order:', error.message);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

export const getManagerSalesStats = async (req, res) => {
  try {
    const { singleDate, startDate, endDate } = req.query;
    const { managerId } = req.params;

    console.log(singleDate);
    

    // Validate managerId
    if (!mongoose.Types.ObjectId.isValid(managerId)) {
      return res.status(400).json({ message: 'Invalid managerId' });
    }
    // Initialize date filter
    const dateFilter = {};

    if (singleDate && !isNaN(new Date(singleDate).getTime())) {
      // If a single date is provided, set the filter for the whole day (local time)
      const startDateLocal = new Date(`${singleDate}T00:00:00`);
      const endDateLocal = new Date(`${singleDate}T23:59:59`);
      dateFilter.$gte = startDateLocal;
      dateFilter.$lte = endDateLocal;
    } else {
      // Handle date range for startDate and endDate with local time
      if (startDate && !isNaN(new Date(startDate).getTime())) {
        // Set startDate with local time at the start of the day
        const startDateLocal = new Date(`${startDate}T00:00:00`);
        dateFilter.$gte = startDateLocal;
      }

      if (endDate && !isNaN(new Date(endDate).getTime())) {
        // Set endDate with local time at the end of the day
        const endDateLocal = new Date(`${endDate}T23:59:59`);
        dateFilter.$lte = endDateLocal;
      }

      // If neither startDate nor endDate is provided, fallback to today's date range (optional)
      if (!startDate && !endDate) {
        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
        const endOfToday = new Date(today.setHours(23, 59, 59, 999));
        dateFilter.$gte = startOfToday;
        dateFilter.$lte = endOfToday;
      }
    }

    const expenses = await Expense.find({
      senderId: new mongoose.Types.ObjectId(managerId),
      createdAt: dateFilter,
      isApprove: true,
    }).lean();
    // Fetch orders with managerId, date filter, and serialId 'showroom'
    const orders = await Order.find({
      manager: new mongoose.Types.ObjectId(managerId),
      createdAt: dateFilter,
      serialId: 'showroom',
    }).lean();

    // Initialize counters
    let totalSellCount = 0;
    let totalSellAmount = 0;
    let totalExchangeAmount = 0;
    let totalExpense = 0;

    // Calculate totals
    expenses.forEach(order => {
      totalExpense += order.amount; 
    });
    orders.forEach(order => {
      totalSellCount += 1; 
      totalSellAmount += order.grandTotal || 0;  
      totalExchangeAmount += order.exchangeAmount || 0;  
    });

    res.status(200).json({
      totalSellCount,
      totalSellAmount,
      totalExchangeAmount,
      totalExpense
    });
  } catch (error) {
    console.error('Error fetching manager sales stats:', error);
    res.status(500).json({ message: 'An error occurred', error: error.message || error });
  }
};





export const getShowroomOrders = async (req, res) => {
  try {
    const { phone, invoice, date } = req.query;

    // Build the filter object
    const filters = { serialId: 'showroom' };

    // Add filters based on the provided query parameters
    if (phone) {
      filters.phone = phone;
    }
    if (invoice) {
      filters.invoice = invoice;
    }

    // Handle date filter
    if (!phone && !invoice) {
      if (date) {
        // If a specific date is provided, filter for that date
        const startDateLocal = new Date(`${date}T00:00:00`);
        const endDateLocal = new Date(`${date}T23:59:59`);
        filters.createdAt = {
          $gte: startDateLocal.toISOString(),
          $lt: endDateLocal.toISOString(),
        };
      } else {
        // If no date is provided, default to today's date
        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
        const endOfToday = new Date(today.setHours(23, 59, 59, 999));
        filters.createdAt = {
          $gte: startOfToday.toISOString(),
          $lte: endOfToday.toISOString(),
        };
      }
    }

    // Fetch showroom orders with the applied filters
    const showroomOrders = await Order.find(filters);
    res.status(200).json(showroomOrders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching showroom orders', error });
  }
};


// export const createPOSOrder = async (req, res) => {
//   try {
//     // Extract order data from request
//     const {
//       serialId, orderNotes, name, address, area, phone, altPhone, notes,
//       totalAmount, deliveryCharge, discount, grandTotal, advanced,
//       condition, cartItems, paymentMethod, courier, employee, userId, manager, payments,
//       exchangeDetails, exchangeAmount, adminDiscount
//     } = req.body;

//     // Fetch the UserPaymentOption based on the manager/userId
//     const userPaymentOptions = await UserPaymentOption.findOne({ userId: manager });
//     if (!userPaymentOptions || !userPaymentOptions.paymentOption) {
//       console.log('User Payment Options or accounts not found for this manager');
//       return res.status(404).json({ message: 'User Payment Options or accounts not found for this manager' });
//     }

//     // Validate payments before processing
//     if (!payments || !Array.isArray(payments) || payments.length === 0) {
//       // Validate and update payment details
//       for (const payment of payments) {
//         const account = userPaymentOptions.paymentOption.accounts.find(acc => acc.accountType === payment.accountType);
//         if (!account) {
//           return res.status(400).json({ message: `Account type ${payment.accountType} not found` });
//         }
//         const paymentOption = account.payments.find(p => p.paymentOption === payment.paymentOption);
//         if (!paymentOption) {
//           return res.status(400).json({ message: `Payment option ${payment.paymentOption} not found for account type ${payment.accountType}` });
//         }

//         // Assign accountNumber and update the amount
//         payment.accountNumber = paymentOption.accountNumber;
//         paymentOption.amount += Number(payment.amount); // Ensure this is a number
//       }
//       // Save updated user payment options after modifying payment amounts
//       await userPaymentOptions.save();
//     }

//     const invoice = generateInvoiceNumber();
//     const initialStatus = [{ name: 'new', user: null }];
//     const newOrderNo = await Order.countDocuments({}) + 1; // Get the new order number

//     // If exchange details are provided, update the existing order
//     if (exchangeDetails && exchangeDetails.invoiceNo) {
//       const existingOrder = await Order.findOne({ invoice: exchangeDetails.invoiceNo });
//       if (existingOrder) {
//         // Update the existing order with new details
//         existingOrder.serialId = serialId;
//         existingOrder.orderNotes = orderNotes;
//         existingOrder.totalAmount += totalAmount; // Adjust as needed
//         existingOrder.deliveryCharge = deliveryCharge;
//         existingOrder.discount = discount;
//         existingOrder.grandTotal = grandTotal + existingOrder.grandTotal;
//         existingOrder.advanced = advanced + existingOrder.advanced;
//         existingOrder.condition = condition;
//         existingOrder.cartItems.push(...cartItems); // Add new cart items
//         existingOrder.payments = payments; // Include updated payments
//         existingOrder.exchangeDetails = exchangeDetails; // Update exchange details if needed
//         existingOrder.adminDiscount = adminDiscount;

//         // Update stock for each cart item (reduce stock)
//         for (const item of cartItems) {
//           const product = await Product.findById(item.productId);
//           if (product) {
//             const sizeDetail = product.sizeDetails.find(size => size.size === item.size);
//             if (sizeDetail) {
//               sizeDetail.openingStock -= item.quantity; // Reduce stock
//               await product.save(); // Save updated product
//             }
//           }
//         }

//         // Handle exchange items if provided
//         if (exchangeDetails.items) {
//           for (const exchangeItem of exchangeDetails.items) {
//             const product = await Product.findById(exchangeItem.productId);
//             if (product) {
//               const sizeDetail = product.sizeDetails.find(size => size.size === exchangeItem.size);
//               if (sizeDetail) {
//                 sizeDetail.openingStock += exchangeItem.quantity; // Increase stock for exchange
//                 await product.save(); // Save updated product
//               }
//             }
//           }
//         }

//         // Update the lastStatus to 'exchange'
//         existingOrder.lastStatus = {
//           name: 'exchange',
//           timestamp: new Date()
//         };

//         // Save the updated existing order
//         await existingOrder.save();

//         // Optionally send SMS if applicable
//         // if (serialId === 'showroom' && phone) {
//         //   const primaryUrl = `https://smpp.revesms.com:7790/sendtext?apikey=2e2d49f9273cc83c&secretkey=f4bef7bd&callerID=1234&toUser=${phone}&messageContent=Thanks%20for%20Choosing%20'ESTARCH'%0AINV:%20${existingOrder.invoice}%0APaid:${existingOrder.totalAmount}TK%0AJoin%20us%20with%20Facebook%20:%20https://www.facebook.com/Estarch.com.bd%0AC.Care:%20+8801706060651`;
//         //   const response = await sendSMS(primaryUrl);
//         //   console.log('SMS sent:', response);
//         // }

//         return res.status(200).json({ message: 'Order updated successfully', order: existingOrder });
//       } else {
//         console.log('Order with this invoice number not found.');
//         return res.status(404).json({ message: 'Order with this invoice number not found.' });
//       }
//     }

//     // Create a new order if no exchange details provided
//     const order = new Order({
//       serialId,
//       invoice,
//       orderNotes,
//       orderNo: newOrderNo,
//       name,
//       address,
//       area,
//       phone,
//       altPhone,
//       notes,
//       totalAmount,
//       deliveryCharge,
//       discount,
//       grandTotal,
//       advanced,
//       condition,
//       cartItems,
//       paymentMethod,
//       courier,
//       employee,
//       userId,
//       manager,
//       status: initialStatus,
//       payments,
//       exchangeDetails,
//       exchangeAmount,
//       adminDiscount
//     });

//     // Update stock for each cart item (reduce stock)
//     for (const item of cartItems) {
//       const product = await Product.findById(item.productId);
//       if (product) {
//         const sizeDetail = product.sizeDetails.find(size => size.size === item.size);
//         if (sizeDetail) {
//           sizeDetail.openingStock -= item.quantity; // Reduce stock
//           await product.save(); // Save updated product
//         }
//       }
//     }

//     await order.save();
//     return res.status(201).json({ message: 'Order placed successfully', order });
//   } catch (error) {
//     console.error('Error placing order:', error);
//     return res.status(500).json({ message: 'Server error', error });
//   }
// };



export const createPOSOrder = async (req, res) => {
  try {
    // Extract order data from request
    const {
      serialId, orderNotes, name, address, area, phone, altPhone, notes,
      totalAmount, deliveryCharge, discount, grandTotal, advanced,
      condition, cartItems, paymentMethod, courier, employee, userId, manager, payments,
      exchangeDetails, exchangeAmount, adminDiscount, giftCard,membership
    } = req.body;
    // Fetch the UserPaymentOption based on the manager/userId
    const userPaymentOptions = await UserPaymentOption.findOne({ userId: manager });
    if (!userPaymentOptions || !userPaymentOptions.paymentOption) {
      return res.status(404).json({ message: 'User Payment Options or accounts not found for this manager' });
    }
    console.log(payments);
    
    // Validate payments before processing
    if (!payments || !Array.isArray(payments) || payments.length !== 0) {
      // Validate and update payment details
      for (const payment of payments) {
        const account = userPaymentOptions.paymentOption.accounts.find(acc => acc.accountType === payment.accountType);
        if (!account) {
          return res.status(400).json({ message: `Account type ${payment.accountType} not found` });
        }
        const paymentOption = account.payments.find(p => p.paymentOption === payment.paymentOption);
        console.log(paymentOption);
        
        if (!paymentOption) {
          return res.status(400).json({ message: `Payment option ${payment.paymentOption} not found for account type ${payment.accountType}` });
        }

        // Assign accountNumber and update the amount
        payment.accountNumber = paymentOption.accountNumber;
        paymentOption.amount += Number(payment.amount); // Ensure this is a number
      }
      // Save updated user payment options after modifying payment amounts

      await userPaymentOptions.save();
    }



    const invoice = generateInvoiceNumber();
    const initialStatus = [{ name: 'delivered', user: null }];
    const lastStatus = { name: 'delivered'};
    // Find the last order and get the highest orderNo
    // const lastOrder = await Order.countDocuments({});
    // // Set the orderNo to be last order's orderNo + 1 or 1 if this is the first order
    // const newOrderNo = lastOrder ? parseInt(lastOrder + 1) : 1;

    const lastOrder = await Order.findOne().sort({ orderNo: -1 }).select('orderNo');
    
    // Set the orderNo to be last order's orderNo + 1 or 1 if this is the first order
    const newOrderNo = lastOrder.orderNo ? parseInt(lastOrder.orderNo + 1) : 1;

    // Create the order with the given data
    const order = new Order({
      serialId,
      invoice,
      orderNotes,
      orderNo: newOrderNo,
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
      payments, // Include the updated payments
      exchangeDetails,
      exchangeAmount,
      adminDiscount,
      orderNo: newOrderNo,
      lastStatus:lastStatus,
      giftCard,
      membership
    });
    console.log(order);
    
    // Update stock for each cart item (reduce stock)
    for (const item of cartItems) {
      console.log(item.productId);
      const product = await Product.findById(item.productId);
      console.log(product);
      if (product) {
        const sizeDetail = product.sizeDetails.find(size => size.size === item.size);
        if (sizeDetail) {
          sizeDetail.openingStock -= item.quantity; // Reduce stock
          await product.save(); // Save updated product
        }
      }
    }

    // Update stock for each exchange item (increase stock)
    if (exchangeDetails && exchangeDetails.items) {
      // Loop through the exchanged items
      for (const exchangeItem of exchangeDetails.items) {
        const product = await Product.findById(exchangeItem.productId);
        if (product) {
          const sizeDetail = product.sizeDetails.find(size => size.size === exchangeItem.size);
          if (sizeDetail) {
            sizeDetail.openingStock += exchangeItem.quantity; // Increase stock for exchange
            await product.save(); // Save updated product
          }
        }
      }

      // Find the order by the exchangeDetails invoiceNo
      const order = await Order.findOne({ "invoice": exchangeDetails.invoiceNo });
      if (order) {
        // Update the lastStatus to 'exchange'
        order.lastStatus = {
          name: 'exchange',
          timestamp: new Date()
        };

        // Save the updated order
        await order.save();
      } else {
        console.log('Order with this invoice number not found.');
      }
    }

    // Send SMS only if serialId is 'showroom' and phone is provided
    // if (serialId === 'showroom' && phone) {
    //   try {
    //     const primaryUrl = `https://smpp.revesms.com:7790/sendtext?apikey=2e2d49f9273cc83c&secretkey=f4bef7bd&callerID=1234&toUser=${phone}&messageContent=Thanks%20for%20Choosing%20'ESTARCH'%0AINV:%20${invoice}%0APaid:${totalAmount}TK%0AJoin%20us%20with%20Facebook%20:%20https://www.facebook.com/Estarch.com.bd%0AC.Care:%20+8801706060651`;
    //     const response = await sendSMS(primaryUrl);
    //     console.log('SMS sent:', response);
    //   } catch (error) {
    //     console.error('Failed to send SMS:', error);
    //   }
    // }

    await order.save();

    return res.status(201).json({ message: 'Order placed successfully' , order });
  } catch (error) {
    console.error('Error placing order:', error);
    return res.status(500).json({ message: 'Server error', error });
  }
};

export const updateOrderNoForAllOrders = async (req, res) => {
  try {
    // Fetch all orders sorted by their creation date to ensure a consistent order
    const orders = await Order.find().sort({ createdAt: 1 });

    // Loop through each order and update its orderNo based on its index
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      order.orderNo = parseInt(i + 1); // Set orderNo to index + 1
      await order.save(); // Save the updated order
    }

    res.status(200).json({
      message: 'Order numbers updated successfully!',
      totalOrdersUpdated: orders.length
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update order numbers',
      error: error.message
    });
  }
};
export const getSentToCourierOrders = async (req, res) => {
  try {
    // Find orders where lastStatus.name is either 'sendToCourier' or 'courierProcessing'
    const orders = await Order.find({
      $or: [
        { 'lastStatus.name': 'sendToCourier' },

      ]
    });

    // Return the orders in the response
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error. Unable to retrieve orders.' });
  }
};


export const getCourierProcessingOrders = async (req, res) => {
  try {
    // Find orders where lastStatus.name is either 'sendToCourier' or 'courierProcessing'
    const orders = await Order.find({
      $or: [
        { 'lastStatus.name': 'courierProcessing' }
      ]
    });
    // Return the orders in the response
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error. Unable to retrieve orders.' });
  }
};

export const handleOrderReturns = async (req, res) => {
  const { products, orderId, amount,
    returnDeliveryCharge,userId,
    partialReturn  } = req.body;

  try {
    // Find the order by orderId
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    // Iterate through the products array to update each product's openingStock
    for (const product of products) {
      const { productId, quantity, size } = product;
      const targetSize = size;
      // Find the product by productId
      const productDetails = await Product.findById(productId);
      if (!productDetails) {
        return res.status(404).json({ message: `Product with ID ${productId} not found` });
      }

      console.log('targetSize', targetSize);

      const sizeDetail = productDetails.sizeDetails.find(size => size.size === targetSize);
      if (!sizeDetail) {
        console.log(`Size detail not found for barcode`);
        return res.status(404).json({ error: `Size detail not found for barcode` });


      }
      // Update the product's openingStock
      sizeDetail.openingStock += quantity;
      await productDetails.save();
    }
    // Determine the new status based on the flags
    if (returnDeliveryCharge) {
      order.lastStatus.name = 'returnWithDeliveryCharge';
      order.status.push({ name:'returnWithDeliveryCharge', user: userId, timestamp: new Date() });
    } else if (returnDeliveryCharge && partialReturn) {
      order.lastStatus.name = 'partialReturn';
      order.status.push({ name:'partialReturn', user: userId, timestamp: new Date() });
    } else {
      order.lastStatus.name = 'return';
      order.status.push({ name:'return', user: userId, timestamp: new Date() });
    }
   
    // // Update the order status
    await order.save();

    // Update the courier account if amount is greater than 0
    if (amount > 0) {
      const account = await CourierAccount.findOne();
      if (account) {
        account.availableAmount += amount;
        await account.save();
      }
    }

    return res.status(200).json({ message: 'Order return processed successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error });
  }
};

export const profitCountForShowroom = async (req, res) => {
  try {
    const { singleDate, startDate, endDate } = req.query;
    console.log({ singleDate, startDate, endDate });


    // Initialize date filter
    // Initialize date filter
    const dateFilter = {};

    if (singleDate && !isNaN(new Date(singleDate).getTime())) {
      // If a single date is provided, set the filter for the whole day (local time)
      const startDateLocal = new Date(`${singleDate}T00:00:00`);
      const endDateLocal = new Date(`${singleDate}T23:59:59`);
      dateFilter.$gte = startDateLocal;
      dateFilter.$lte = endDateLocal;
    } else {
      // Handle date range for startDate and endDate with local time
      if (startDate && !isNaN(new Date(startDate).getTime())) {
        // Set startDate with local time at the start of the day
        const startDateLocal = new Date(`${startDate}T00:00:00`);
        dateFilter.$gte = startDateLocal;
      }

      if (endDate && !isNaN(new Date(endDate).getTime())) {
        // Set endDate with local time at the end of the day
        const endDateLocal = new Date(`${endDate}T23:59:59`);
        dateFilter.$lte = endDateLocal;
      }

      // If neither startDate nor endDate is provided, fallback to today's date range (optional)
      if (!startDate && !endDate) {
        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
        const endOfToday = new Date(today.setHours(23, 59, 59, 999));
        dateFilter.$gte = startOfToday;
        dateFilter.$lte = endOfToday;
      }
    }


    // Fetch all orders with serialId 'showroom'
    const orders = await Order.find({
      createdAt: dateFilter,
      serialId: 'showroom',
    }).populate({
      path: 'cartItems.productId',
      select: 'title sizeDetails',
    }).lean();

    // Initialize counters
    let totalSellCount = 0;
    let totalSellAmount = 0;
    let totalExchangeAmount = 0;
    let totalProfit = 0;

    // Helper function to calculate the total purchase price of cart items
    const calculateTotalPurchasePrice = (cartItems) => {
      return cartItems.reduce((total, item) => {
        if (item && item.productId && Array.isArray(item.productId.sizeDetails)) {
          const sizeDetail = item.productId.sizeDetails.find(size => size.size === item.size);
          return total + (sizeDetail ? (sizeDetail.ospPrice || sizeDetail.sellPrice) * (item.quantity) : 0);
        }
        return total;
      }, 0);
    };

    // Array to hold updated previous orders
    const updatedOrders = [];

    for (let order of orders) {
      totalSellCount += 1;
      totalSellAmount += order.grandTotal || 0;
      totalExchangeAmount += order.exchangeAmount || 0;

      updatedOrders.push(order)

      // Check if exchangeDetails exist
      if (order.exchangeDetails && order.exchangeDetails.invoiceNo) {
        // Find the previous order using the invoiceNo
        const previousOrder = await Order.findOne({
          invoice: order.exchangeDetails.invoiceNo,
          serialId: 'showroom',
        }).populate({
          path: 'cartItems.productId',
          select: 'title sizeDetails',
        }).lean();

        // Filter out cartItems that match exchangeDetails items
        if (previousOrder && previousOrder.cartItems) {
          const exchangeItems = order.exchangeDetails.items || [];
          // Find cartItems that match exchangeItems by productId and size
          const updatedCartItems = previousOrder.cartItems.map(prevItem => {
            // Check if there's a corresponding exchange item
            const exchangeItem = exchangeItems.find(exchangeItem =>
              exchangeItem.productId.toString() === prevItem.productId._id.toString() &&
              exchangeItem.size === prevItem.size
            );

            if (exchangeItem) {
              // Calculate new quantity
              const newQuantity = prevItem.quantity - exchangeItem.quantity;
              return {
                ...prevItem,
                quantity: newQuantity // Allow zero quantity
              };
            }

            return prevItem; // Return the original item if no match found
          });

          // Update previousOrder's cartItems with the modified items
          previousOrder.cartItems = updatedCartItems; // Now previousOrder has updated cartItems

          // Remove any existing order with the same invoice
          const existingOrderIndex = updatedOrders.findIndex(existingOrder => existingOrder.invoice === previousOrder.invoice);
          if (existingOrderIndex !== -1) {
            // Remove the existing order if found
            updatedOrders.splice(existingOrderIndex, 1);
          }

          // Add the current previousOrder to the updatedOrders array
          updatedOrders.push(previousOrder);
        }
      }
    }

    // Calculate purchase price for all filtered cart items from updatedOrders
    const totalPurchasePrice = updatedOrders.reduce((total, order) => {
      return total + calculateTotalPurchasePrice(order.cartItems);
    }, 0);

    console.log(updatedOrders);

    // Calculate total profit
    totalProfit = totalSellAmount - totalPurchasePrice;

    // Return the results including totalProfit
    res.status(200).json({
      totalSellCount,
      totalSellAmount,
      totalExchangeAmount,
      totalProfit,
      updatedOrders
    });
  } catch (error) {
    console.error('Error fetching manager sales stats:', error);
    res.status(500).json({ message: 'An error occurred', error: error.message || error });
  }
};


// const { startOfDay, endOfDay } = require('date-fns'); // You might need to adjust if you're using different date libraries

// Helper function to get the start of the day
const startOfDay = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

// Helper function to get the end of the day
const endOfDay = (date) => {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
};

// this getBestSellingReport is deprecated for not handling the exchange amount
// export const getBestSellingReport = async (req, res) => {
//   try {
//     const { singleDate, startDate, endDate, serialId, sku } = req.query;
//     console.log({ singleDate, startDate, endDate, serialId, sku });

//     // Initialize date filter
//     const dateFilter = {};

//     if (singleDate && !isNaN(new Date(singleDate).getTime())) {
//       const startDateLocal = startOfDay(singleDate);
//       const endDateLocal = endOfDay(singleDate);
//       dateFilter.$gte = startDateLocal;
//       dateFilter.$lte = endDateLocal;
//     } else if (startDate && !isNaN(new Date(startDate).getTime()) && endDate && !isNaN(new Date(endDate).getTime())) {
//       const startDateLocal = startOfDay(startDate);
//       const endDateLocal = endOfDay(endDate);
//       dateFilter.$gte = startDateLocal;
//       dateFilter.$lte = endDateLocal;
//     }

//     // Initialize serialId filter
//     let serialIdFilter = {};

//     if (serialId === 'showroom') {
//       serialIdFilter = { serialId: 'showroom' };
//     } else if (serialId === 'online') {
//       serialIdFilter = {
//         serialId: { $in: ['E-commerce', 'Store', 'Facebook', 'WhatsApp'] },
//       };
//     }

//     // Initialize SKU filter
//     const skuFilter = sku ? { 'product.SKU': { $regex: sku, $options: "i" } } : {};

//     // Aggregate orders based on the date or date range (or lifetime if no date is provided)
//     const orders = await Order.aggregate([
//       {
//         $match: {
//           ...(dateFilter.$gte && dateFilter.$lte
//             ? { createdAt: { $gte: dateFilter.$gte, $lte: dateFilter.$lte } }
//             : {}),
//           ...serialIdFilter,
//           "lastStatus.name": { $in: ["delivered", "exchange"] },
//         },
//       },
//       {
//         $unwind: '$cartItems', // Flatten the cart items array
//       },
//       {
//         $group: {
//           _id: '$cartItems.productId',
//           totalQuantity: { $sum: '$cartItems.quantity' },
//           totalRevenue: { $sum: { $multiply: ['$cartItems.quantity', '$cartItems.price'] } },
//         },
//       },
//       {
//         $lookup: {
//           from: 'products',
//           localField: '_id',
//           foreignField: '_id',
//           as: 'product',
//         },
//       },
//       {
//         $unwind: '$product',
//       },
//       {
//         $match: {
//           ...skuFilter, // Apply the SKU filter
//         },
//       },
//       {
//         $lookup: {
//           from: 'categories',
//           localField: 'product.selectedCategoryName',
//           foreignField: 'name',
//           as: 'category',
//         },
//       },
//       {
//         $unwind: { path: '$category', preserveNullAndEmptyArrays: true },
//       },
//       {
//         $lookup: {
//           from: 'subcategories',
//           localField: 'product.selectedSubCategory',
//           foreignField: 'name',
//           as: 'subcategory',
//         },
//       },
//       {
//         $unwind: { path: '$subcategory', preserveNullAndEmptyArrays: true },
//       },
//       {
//         $sort: { totalQuantity: -1 }, // Sort by total quantity sold
//       },
//       {
//         $limit: 20, // Limit to top 10 best sellers
//       },
//       {
//         $project: {
//           productId: '$_id',
//           productName: '$product.productName',
//           SKU: '$product.SKU', // Include SKU in output
//           totalQuantity: 1,
//           totalRevenue: 1,
//           images: '$product.images',
//           categoryName: { $ifNull: ['$category.name', null] },  // If no category, return null
//           subcategoryName: { $ifNull: ['$subcategory.name', null] }  // If no subcategory, return null
//         }
//       },
//     ]);

//     // Return the aggregated best-selling products
//     return res.status(200).json(orders);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: 'Something went wrong' });
//   }
// };


export const getBestSellingReport = async (req, res) => {
  try {
    const { singleDate, startDate, endDate, serialId, sku } = req.query;
    console.log({ singleDate, startDate, endDate, serialId, sku });

    const dateFilter = {};
    if (singleDate) {
      dateFilter.$gte = startOfDay(singleDate);
      dateFilter.$lte = endOfDay(singleDate);
    } else if (startDate && endDate) {
      dateFilter.$gte = startOfDay(startDate);
      dateFilter.$lte = endOfDay(endDate);
    }

    let serialIdFilter = {};
    if (serialId === 'showroom') serialIdFilter = { serialId: 'showroom' };
    else if (serialId === 'online') serialIdFilter = { serialId: { $in: ['E-commerce', 'Store', 'Facebook', 'WhatsApp'] } };

    const skuFilter = sku ? { 'product.SKU': { $regex: sku, $options: 'i' } } : {};

    const orders = await Order.aggregate([
      {
        $match: {
          ...(dateFilter.$gte && dateFilter.$lte
            ? { createdAt: { $gte: dateFilter.$gte, $lte: dateFilter.$lte } }
            : {}),
          ...serialIdFilter,
          "lastStatus.name": { $in: ["delivered", "exchange"] },
        },
      },
      {
        $unwind: '$cartItems', // Flatten the cart items array
      },
      {
        $group: {
          _id: '$cartItems.productId',
          totalQuantity: { $sum: '$cartItems.quantity' }, // Total quantity sold
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      {
        $unwind: '$product',
      },
      {
        $match: {
          ...skuFilter, // Apply the SKU filter
        },
      },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'exchangeDetails.items.productId',
          as: 'exchangeOrders',
        },
      },
      {
        $unwind: {
          path: '$exchangeOrders',
          preserveNullAndEmptyArrays: true, // Keep products without exchanges
        },
      },
      {
        $unwind: {
          path: '$exchangeOrders.exchangeDetails.items',
          preserveNullAndEmptyArrays: true, // Keep products without exchanges
        },
      },
      {
        $group: {
          _id: '$_id',
          totalQuantity: { $first: '$totalQuantity' }, // Retain the total quantity sold
          exchangedQuantity: {
            $sum: {
              $cond: [
                { $eq: ['$exchangeOrders.exchangeDetails.items.productId', '$_id'] },
                '$exchangeOrders.exchangeDetails.items.quantity',
                0,
              ],
            },
          }, // Total quantity exchanged for this product
        },
      },
      {
        $project: {
          productId: '$_id',
          totalQuantity: { $subtract: ['$totalQuantity', '$exchangedQuantity'] }, // Adjust for exchanges
          totalRevenue: { $sum: { $multiply: ['$cartItems.quantity', '$cartItems.price'] } },

        },
      },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      {
        $unwind: '$product',
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'product.selectedCategoryName',
          foreignField: 'name',
          as: 'category',
        },
      },
      {
        $unwind: { path: '$category', preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: 'subcategories',
          localField: 'product.selectedSubCategory',
          foreignField: 'name',
          as: 'subcategory',
        },
      },
      {
        $unwind: { path: '$subcategory', preserveNullAndEmptyArrays: true },
      },
      {
        $sort: { totalQuantity: -1 }, // Sort by adjusted total quantity
      },
      {
        $limit: 20, // Limit to top 20 best sellers
      },
      {
        $project: {
          productId: '$_id',
          productName: '$product.productName',
          SKU: '$product.SKU',
          totalQuantity: 1,
          totalRevenue: { $multiply: ['$product.salePrice', '$totalQuantity'] }, 
          images: '$product.images',
          categoryName: { $ifNull: ['$category.name', null] },
          subcategoryName: { $ifNull: ['$subcategory.name', null] },
        },
      },
    ]);

    return res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};






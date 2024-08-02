import Order from '../models/order.js';

export const createOrder = async (req, res) => {
  try {
    const { name, phone, altPhone, email, district, address, orderNotes, cartItems, paymentMethod, totalAmount } = req.body;

    const newOrder = new Order({
      name,
      phone,
      altPhone,
      email,
      district,
      address,
      orderNotes,
      cartItems,
      paymentMethod,
      totalAmount,
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error });
  }
};
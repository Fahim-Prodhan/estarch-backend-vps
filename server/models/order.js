import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  altPhone: { type: String },
  email: { type: String },
  district: { type: String, required: true },
  address: { type: String, required: true },
  orderNotes: { type: String },
  cartItems: [
    {
    //   productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      title: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  paymentMethod: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  orderStatus: { type: String, default: 'Pending' },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

export default Order;

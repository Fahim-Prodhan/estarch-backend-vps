import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  serialId: { type: String, required: true },
  invoice: { type: String, required: true },
  date: { type: Date, required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  notes: { type: String },
  totalBill: { type: Number, required: true },
  deliveryCharge: { type: Number, required: true },
  discount: { type: Number, required: true },
  grandTotal: { type: Number, required: true },
  advanced: { type: Number, required: true },
  condition: { type: String, required: true },
  cartItems: [
    {
      title: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  paymentMethod: { type: String },
  status: { type: String, enum: ['new', 'pending', 'confirm', 'processing', 'courier', 'delivered', 'cancel'], required: true },
  courier: { type: String, required: true },
  visitor: { type: String, required: true },
  note: { type: String },
  lastNote: { type: String }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

export default Order;

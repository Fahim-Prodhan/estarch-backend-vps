import mongoose from 'mongoose';

// Define the note schema for individual notes
const noteSchema = new mongoose.Schema({
  adminName: { type: String, required: true },
  noteContent: { type: String, required: true },
}, { _id: false });  // Optional: If you don't need individual _id for notes

// Define the order schema
const orderSchema = new mongoose.Schema({
  serialId: { type: String, required: true },
  invoice: { type: String, default: '' },
  orderNotes: { type: String, default: '' },
  name: { type: String, required: true },
  address: { type: String, required: true },
  area: { type: String, required: true },
  phone: { type: String, required: true },
  altPhone: { type: String, default: '' },
  totalAmount: { type: Number, required: true },
  deliveryCharge: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 }, 
  advanced: { type: Number, default: 0 },
  condition: { type: Number, default: 0 },
  cartItems: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      title: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      size: { type: String, required: true, default: '' }
    }
  ],
  paymentMethod: { type: String },
  status: [
    {
      name: { type: String, enum: ['new', 'pending', 'confirm', 'processing', 'courier', 'delivered', 'cancel'], default: 'new' },
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
    }
  ],
  courier: { type: String, default: '' },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  notes: [noteSchema],  // Multiple notes can be stored in this array
}, { timestamps: true });

// Create and export the Order model
const Order = mongoose.model('Order', orderSchema);

export default Order;

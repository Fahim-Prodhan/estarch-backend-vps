import mongoose from 'mongoose';
const orderSchema = new mongoose.Schema({
  // serialId: { type: String, required: true },
  invoice: { type: String, default: '' },
  orderNotes: { type: String, default: '' },
  // date: { type: Date, required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  altPhone: { type: String, default: '' },
  notes: { type: String, default:'' },
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
      size:{type:String, require:true, default: ''}
    },
  ],
  paymentMethod: { type: String },
  status:[{name:{ type: String, enum: ['new', 'pending', 'confirm', 'processing', 'courier', 'delivered', 'cancel'], default: 'new' },user:{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }}] ,
  courier: { type: String, default: '' },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  note: { type: String },
  lastNote: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

export default Order;


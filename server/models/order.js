import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  serialId: { type: String, required: true },
  invoice: { type: String, default: '' },
  orderNo: { type: Number, unique: true },
  orderNotes: { type: String, default: '' },
  orderNo: { type: Number, unique: true }, 
  name: { type: String,  default: 'guest' },
  address: { type: String , default: ''},
  area: { type: String  , default: ''},
  phone: { type: String ,  default:'guest'},
  altPhone: { type: String, default: '' },
  totalAmount: { type: Number, required: true },
  deliveryCharge: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  adminDiscount: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
  advanced: { type: Number, default: 0 },
  dueAmount: { type: Number, default: 0 },
  condition: { type: Number, default: 0 },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  cartItems: [
    {
      productId: {type: mongoose.Schema.Types.ObjectId, ref: 'Product' , require: true},
      title: { type: String, required: true },
      quantity: { type: Number, required: true },
      discountAmount: { type: Number },
      price: { type: Number, required: true },
      size: { type: String, required: true, default: '' }
    }
  ],
  paymentMethod: { type: String },
  status: [
    {
      name: {
        type: String,
        enum: ['new', 'pending', 'pendingPayment', 'confirm', 'hold',
          'processing', 'sendToCourier', 'courierProcessing',
          'delivered', 'partialReturn', 'returnWithDeliveryCharge',
          'return', 'exchange', 'cancel', 'doubleOrderCancel','courierReturn']
        ,
        default: 'new'
      },
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  courier: { type: String, default: '' },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  notes: [
    {
      adminName: { type: String, required: true },
      noteContent: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  lastStatus: {
    name: {
      type: String,
      required: true, 
      default: 'new'
    },
      timestamp: { type: Date, default: Date.now }
  },
  isPrint:{type: Boolean, default:false},
  payments:[],
  exchangeDetails:{
    invoiceNo: { type: String},
    items: [{
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      title: { type: String, required: true },
      quantity: { type: Number, required: true },
      discountAmount: { type: Number, default:0 },
      price: { type: Number, required: true },
      size: { type: String, required: true },
    }]
  },
  
  coupon: {
    name: { type: String, default: null },
    discountAmount: { type: Number, default: 0 },
  },
  giftCard: {
    code: { type: String, default: null },
    giftAmount: { type: Number, default: 0 },
  },
  membership: {
    cardNumber: { type: Number, default: 0 },
    membershipDiscount: { type: Number, default: 0 },
    phone: { type: Number, default: 0 },
  },

  exchangeAmount:{ type: Number, default: null }

}, { timestamps: true });

// Middleware to update lastStatus.timestamp when lastStatus.name changes
orderSchema.pre('save', function (next) {
  if (this.isModified('lastStatus.name')) {
    this.lastStatus.timestamp = new Date(); // Update the timestamp
  }
  next();
});

// Create and export the Order model
const Order = mongoose.model('Order', orderSchema);

export default Order;

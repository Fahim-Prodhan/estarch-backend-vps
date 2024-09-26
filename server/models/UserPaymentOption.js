import mongoose from 'mongoose';
import PaymentOption from './PaymentOption.js';

const userPaymentOptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  paymentOption: {
    type: PaymentOption.schema, // Embed the PaymentOption schema
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const UserPaymentOption = mongoose.model('UserPaymentOption', userPaymentOptionSchema);

export default UserPaymentOption;

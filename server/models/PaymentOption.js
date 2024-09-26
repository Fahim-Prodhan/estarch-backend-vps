import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  paymentOption: {
    type: String,
  },
  accountNumber: {
    type: String,
  },
  amount:{
    type:Number,
    default: 0
  },
  withdraw:{
    type:Number,
    default: 0
  },
});

const AccountSchema = new mongoose.Schema({
  accountType: {
    type: String,
  },
  payments: [PaymentSchema],
});

const PaymentOptionSchema = new mongoose.Schema({
  accountName: {
    type: String,
    enum: ['showroom', 'online', 'wholesale'],
  },
  accounts: [AccountSchema],
}, { timestamps: true });

const PaymentOption = mongoose.model('PaymentOption', PaymentOptionSchema);

export default PaymentOption;

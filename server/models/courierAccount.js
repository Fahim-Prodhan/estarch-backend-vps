// models/courierAccount.model.js
import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  deliveryCharge: { type: Number, required: true },
  codCharge: { type: Number, required: true },
  netAmount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const courierAccountSchema = new mongoose.Schema({
  totalEarned: { type: Number, default: 0 },
  availableAmount: { type: Number, default: 0 },
  totalWithdrawAmount: { type: Number, default: 0 },
  withdrawals: [withdrawalSchema],
});

const CourierAccount = mongoose.model('CourierAccount', courierAccountSchema);

export default CourierAccount;

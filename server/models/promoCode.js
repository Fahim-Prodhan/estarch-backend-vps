

import mongoose from 'mongoose';

const PromoCodeSchema = new mongoose.Schema({
  promoCode: {
    type: String,
    required: true,
    unique: true
  },
  minAmount: {
    type: Number,
    required: true
  },
  discountType: {
    type: String,
    required: true
  },
  discountAmount: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  }
});

const PromoCode = mongoose.model('PromoCode', PromoCodeSchema);

export default PromoCode;

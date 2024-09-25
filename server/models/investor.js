import mongoose from 'mongoose';

const investorSchema = new mongoose.Schema({
  investorName: {
    type: String,
    required: true,
  },
  investedAmount: {
    type: Number,
    required: true,
    default: 0
  },
  withdrawAmount: {
    type: Number,
    required: true,
    default: 0
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null 
  }
}, { timestamps: true });

const Investor = mongoose.model('Investor', investorSchema);
export default Investor;

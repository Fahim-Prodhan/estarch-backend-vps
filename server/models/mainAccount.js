import mongoose from 'mongoose';

const mainAccountSchema = new mongoose.Schema({
  accountantName: {
    type: String,
    required: true,
  },
  earnAmount: {
    type: Number,
    required: true,
    default: 0
  },
  spendAmount: {
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

const MainAccount = mongoose.model('MainAccount', mainAccountSchema);
export default MainAccount;

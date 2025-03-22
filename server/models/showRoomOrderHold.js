import mongoose from 'mongoose';

const showroomOrderHoldSchema = new mongoose.Schema({
  orderItems: {
    type: [mongoose.Schema.Types.Mixed],
    default: [],  
  },
  userInfo: {
    name: {
      type: String,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
  },
  note: {
    type: String,
    default: '',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,  
  },
}, {
  timestamps: true,
});

export default mongoose.model('ShowroomOrderHold', showroomOrderHoldSchema);

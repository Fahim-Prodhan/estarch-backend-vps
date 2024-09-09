import mongoose from 'mongoose';

const showroomOrderHoldSchema = new mongoose.Schema({
  orderItems: {
    type: [mongoose.Schema.Types.Mixed],  // Allows pushing any type of data into the array
    default: [],  // Initializes the array as empty by default
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
}, {
  timestamps: true,
});

export default mongoose.model('ShowroomOrderHold', showroomOrderHoldSchema);


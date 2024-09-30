import mongoose from 'mongoose';

const courierApiSchema = new mongoose.Schema({
  secretKey: {
    type: String,
    required: true,
  },
  apiKey: {
    type: String,
    required: true,
  }
}, {
  timestamps: true 
});

const CourierApi = mongoose.model('CourierApi', courierApiSchema);

export default CourierApi;

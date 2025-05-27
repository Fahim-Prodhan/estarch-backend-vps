import mongoose from 'mongoose';

const SalesmanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  target: { type: Number, default: 0 },
  sale: { type: Number, default: 0 },
}, { timestamps: true });

const Salesman = mongoose.model('Salesman', SalesmanSchema);
export default Salesman;

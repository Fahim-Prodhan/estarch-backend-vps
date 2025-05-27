import mongoose from 'mongoose';

const visitSchema = new mongoose.Schema({
  ip: { type: String, required: true },
  lastVisit: { type: Date, required: true },
  visitDate: { type: String, required: true },
  visitCount: { type: Number, default: 1 }
});

const Visit = mongoose.model('Visit', visitSchema);

export default Visit;

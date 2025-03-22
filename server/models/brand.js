// models/brandModel.js
import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
    name: { type: String, required: true },
});

export default mongoose.model('Brand', brandSchema);

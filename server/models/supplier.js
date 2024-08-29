// models/Supplier.js

import mongoose from 'mongoose';

const SupplierSchema = new mongoose.Schema({
    name: { type: String, required: true },
    businessName: { type: String },
    email: { type: String },
    mobile: { type: String, required: true },
    area: { type: String },
    address: { type: String },
    due: { type: Number, default: 0 },
    date: { type: Date, default: Date.now },
    note: { type: String },
});

const Supplier = mongoose.model('Supplier', SupplierSchema);
export default Supplier;

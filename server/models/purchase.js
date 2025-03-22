import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema({
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    invoiceNo: { type: String },
    purchaseDate: { type: Date, required: true },
    reference: { type: String },
    note: { type: String },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default:null }, // Optional field
        asset: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductAsset', default:null }, // Optional field
        quantity: { type: Number, required: true },
        purchasePrice: { type: Number, required: true },
        subtotal: { type: Number, required: true },
        total: { type: Number, required: true },
        barcode: { type: String, default:'' },
    }],
    paymentTypes: [
        {
            type: { type: String },
            amount: { type: Number },
        }
    ],
    totalAmount: { type: Number, required: true },
    totalQuantity: { type: Number, required: true },
    due: { type: Number, required: true },
});

export default mongoose.model('Purchase', purchaseSchema);

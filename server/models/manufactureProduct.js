import mongoose from 'mongoose';

const manufacturerProductSchema = new mongoose.Schema({
    // Reference to the existing product
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    assets: [{
        assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductAsset', required: true },
        usedQuantity: { type: Number, required: true, default: 0 } 
    }],
    totalProduct: {
        type: Number, 
        default: 0,
        required: true
    },
    otherCost: {
        type: Number, 
        default: 0
    },
    costPerProduct: {
        type: Number, 
        default: 0
    },
    version: { type: Number, required: true } 
}, { timestamps: true });

// Create and export the ManufactureProduct model
const ManufactureProduct = mongoose.model('ManufactureProduct', manufacturerProductSchema);

export default ManufactureProduct;

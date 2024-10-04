
import mongoose from 'mongoose';


const productAssetSchema = new mongoose.Schema({
    assetName: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        default:0
    },
    perItemPrice: {
        type: Number,
        default:0
    },
}, { timestamps: true }); 

const ProductAsset = mongoose.model('ProductAsset', productAssetSchema);

export default ProductAsset;

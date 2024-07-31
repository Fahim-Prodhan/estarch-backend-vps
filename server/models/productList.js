import mongoose from 'mongoose';

const ProductListSchema = new mongoose.Schema({
    serialId: {
        type: String,
        required: true
    },
    images: {
        type: [String],
        required: [true, 'Images are required'],
        validate: {
            validator: Array.isArray,
            message: 'Images should be an array of strings',
        },
    },
    supplier: {
        type: String,
        required: true
    },
    totalBill: {
        type: Number,
        required: true
    },
    notes: {
        type: String,
        required: true
    }
});

const ProductList = mongoose.model('ProductList', ProductListSchema);

export default ProductList;

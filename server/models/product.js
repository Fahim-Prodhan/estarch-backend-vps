import mongoose from 'mongoose';



const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
    },
    sku: {
        type: String,
        required: [true, 'SKU is required'],
    },
    sizes: {
        type: [Number],
        required: [true, 'Sizes are required'],
        validate: {
            validator: Array.isArray,
            message: 'Sizes should be an array of numbers',
        },
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
    },
    discountedPrice: {
        type: Number,
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
    },
    images: {
        type: [String],
        required: [true, 'Images are required'],
        validate: {
            validator: Array.isArray,
            message: 'Images should be an array of strings',
        },
    },
    description: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    isBestSelling: {
        type: Boolean,
        default: false,
    },
    isNewArrival: {
        type: Boolean,
        default: false,
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
    },
});

const Product = mongoose.model('Product', productSchema);

export default Product;

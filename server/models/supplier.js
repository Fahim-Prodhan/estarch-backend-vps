import mongoose from 'mongoose';

const SupplierSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
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
    enableToggle: {
        type: Boolean,
        default: true
    }
});

const Supplier = mongoose.model('Supplier', SupplierSchema);

export default Supplier;

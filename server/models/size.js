import mongoose from 'mongoose';

const sizeSchema = new mongoose.Schema({
    sizeType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SizeType',
        required: true
    },
    sizes: {
        type: [String], // Array of strings to hold sizes like 'x', 'm', 'l', 'xl'
        required: true
    }
}, { timestamps: true });

const Size = mongoose.model('Size', sizeSchema);

export default Size;

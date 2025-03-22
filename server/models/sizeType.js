import mongoose from 'mongoose';

const sizeTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    }
}, { timestamps: true });

const SizeType = mongoose.model('SizeType', sizeTypeSchema);

export default SizeType;

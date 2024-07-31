import mongoose from 'mongoose';

const AttributeListSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    values: {
        type: [String],
        required: [true, 'Values are required'],
        validate: {
            validator: Array.isArray,
            message: 'Values should be an array of strings',
        },
    },
    statusToggle: {
        type: Boolean,
        default: true
    }
});

const AttributeList = mongoose.model('AttributeList', AttributeListSchema);

export default AttributeList;

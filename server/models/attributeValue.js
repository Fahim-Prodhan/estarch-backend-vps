import mongoose from 'mongoose';

const AttributeValueSchema = new mongoose.Schema({
    attribute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Attribute',
        required: true
    },
    valueName: {
        type: String,
        required: true
    }
});

const AttributeValue = mongoose.model('AttributeValue', AttributeValueSchema);

export default AttributeValue;

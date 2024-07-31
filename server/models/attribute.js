import mongoose from 'mongoose';

const AttributeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    enableToggle: {
        type: Boolean,
        default: true
    }
});

const Attribute = mongoose.model('Attribute', AttributeSchema);

export default Attribute;

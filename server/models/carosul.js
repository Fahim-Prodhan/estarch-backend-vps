import mongoose from "mongoose";

const CarosulSchema = new mongoose.Schema({
    images: {
        type: [String],
        required: [true, 'Images are required'],
        validate: {
            validator: Array.isArray,
            message: 'Images should be an array of strings',
        },
    },
})

const Carosul = mongoose.model('Carosul', CarosulSchema);
export default Carosul
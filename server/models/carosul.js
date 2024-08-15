import mongoose from "mongoose";

const CarosulSchema = new mongoose.Schema({
    images: [String], // Array of image paths
    link: { type: String, default: '' }, // Link associated with the carousel
    active: { type: Boolean, default: true } // Toggle for active status
}, {
    timestamps: true
});


const Carosul = mongoose.model('Carosul', CarosulSchema);
export default Carosul
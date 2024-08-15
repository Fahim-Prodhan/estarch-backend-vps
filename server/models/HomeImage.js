import mongoose from "mongoose";

const HomeImageSchema = new mongoose.Schema({
    name:{type:string},
    images: [String], // Array of image paths
    link: { type: String, default: '' }, // Link associated with the carousel
    active: { type: Boolean, default: true } // Toggle for active status
}, {
    timestamps: true
});


const HomeImage = mongoose.model('HomeImage',HomeImageSchema);
export default HomeImage
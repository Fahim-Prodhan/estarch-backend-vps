import mongoose from "mongoose";

const VideoSchema = new mongoose.Schema({
    name: {type:String},
     // Array of image paths
    link: { type: String, default: '' }, // Link associated with the carousel
    active: { type: Boolean, default: true } // Toggle for active status
}, {
    timestamps: true
});


const Video = mongoose.model('Video',VideoSchema);
export default Video
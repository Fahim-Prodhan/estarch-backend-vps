import mongoose from 'mongoose';

const typeSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    image: { type: String, default:'' } 
});

const Type = mongoose.model('Type', typeSchema);
export default Type;

import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    image: { type: String },  
    type: { type: mongoose.Schema.Types.ObjectId, ref: 'Type', required: true },
    subcategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory' }]
});

const Category = mongoose.model('Category', categorySchema);
export default Category;

import mongoose from 'mongoose';

const subCategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    image: { type: String } ,
    active: { type: Boolean, default: true }
});

const SubCategory = mongoose.model('SubCategory', subCategorySchema);
export default SubCategory;

import mongoose from 'mongoose';


const CategorySchema = new mongoose.Schema({
    parentCategory: {
        type: String,
        required: true
    },
    categoryName: {
        type: String,
        required: true
    },
    images: {
        type: [String],
        required: [true, 'Images are required'],
        validate: {
            validator: Array.isArray,
            message: 'Images should be an array of strings',
        },
    },
    featureToggle: {
        type: Boolean,
        default: true
    }
});

const Category = mongoose.model('Category', CategorySchema);

export default Category;

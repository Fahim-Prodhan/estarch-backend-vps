import Category from '../models/category.js';
import SubCategory from '../models/subCategory.js';
import Brand from '../models/brand.js';

// Create Category
export const createCategory = async (req, res) => {
    try {
        const { name, image } = req.body;
        const newCategory = new Category({ name, image });
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all Categories with SubCategories
export const getCategoriesWithSubCategories = async (req, res) => {
    try {
        const categories = await Category.find().populate('subcategories');
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update Category
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, image } = req.body;
        const updatedCategory = await Category.findByIdAndUpdate(id, { name, image }, { new: true });
        res.json(updatedCategory);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete Category
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await Category.findByIdAndDelete(id);
        res.json({ message: 'Category deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get SubCategories by Category
export const fetchSubCategories = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const subCategories = await SubCategory.find({ category: categoryId }).populate('category');
        if (subCategories.length === 0) {
            return res.status(404).json({ message: 'No subcategories found for this category' });
        }
        res.json(subCategories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create SubCategory
export const createSubCategory = async (req, res) => {
    try {
        const { name, categoryId } = req.body;
        const newSubCategory = new SubCategory({ name, category: categoryId });
        await newSubCategory.save();
        await Category.findByIdAndUpdate(categoryId, { $push: { subcategories: newSubCategory._id } });
        res.status(201).json(newSubCategory);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update SubCategory
export const updateSubCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, categoryId } = req.body;
        const updatedSubCategory = await SubCategory.findByIdAndUpdate(id, { name, category: categoryId }, { new: true });
        res.json(updatedSubCategory);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete SubCategory
export const deleteSubCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await SubCategory.findByIdAndDelete(id);
        res.json({ message: 'SubCategory deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all SubCategories
export const getSubCategories = async (req, res) => {
    try {
        const subCategories = await SubCategory.find().populate('category');
        res.json(subCategories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new brand
export const createBrand = async (req, res) => {
    try {
        const { name } = req.body;
        const brand = new Brand({ name });
        await brand.save();
        res.status(201).json(brand);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all brands
export const getBrands = async (req, res) => {
    try {
        const brands = await Brand.find();
        res.json(brands);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a brand
export const updateBrand = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const brand = await Brand.findByIdAndUpdate(id, { name }, { new: true });
        res.json(brand);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a brand
export const deleteBrand = async (req, res) => {
    try {
        const { id } = req.params;
        await Brand.findByIdAndDelete(id);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

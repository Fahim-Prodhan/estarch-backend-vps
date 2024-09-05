import Category from '../models/category.js';
import SubCategory from '../models/subCategory.js';
import Brand from '../models/brand.js';
import Type from '../models/type.js';

// Create Category
// export const createCategory = async (req, res) => {
//     try {
//         const { name, type, image } = req.body;
//         console.log(name, type, image);
        
//         if (!name || !type) {
//             return res.status(400).json({ error: 'Name and type are required' });
//         }
//         const newCategory = new Category({ name, type, image });
//         await newCategory.save();
//         res.status(201).json(newCategory);
//     } catch (err) {
//         console.error('Error creating category:', err); // Log the error to the server console
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };

export const createCategory = async (req, res) => {
    console.log('File received:', req.file);

    try {
        const { name, type, image } = req.body;
        if (!name || !type) {
            return res.status(400).json({ error: 'Name and type are required' });
        }
        const newCategory = new Category({
            name,
            type,
            image 
        });

        await newCategory.save(); 

        res.status(201).json(newCategory); 
    } catch (err) {
        console.error('Error creating category:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};






// get category by categoryID
export const getCategoryById = async (req, res) =>{
    const { id } = req.params;
    try {
        const result = await Category.findById(id)
        res.send(result)
    } catch (error) {
        res.send(error)
    }
}


// Get all Categories with SubCategories
export const getCategoriesWithSubCategories = async (req, res) => {
    try {
        const categories = await Category.find().populate('type');
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Categories by Type
export const getCategoriesByTypeName = async (req, res) => {
    try {
        const { typeName } = req.params;
        
        // Find the Type object by name
        const type = await Type.findOne({ name: typeName });

        if (!type) {
            return res.status(404).json({ message: 'Type not found' });
        }

        // Find categories that match the typeId
        const categories = await Category.find({ type: type._id })
            .populate('type')  // Populate the type field if needed
            .populate({
                path: 'subcategories',
                populate: {
                    path: 'category'
                }
            });

        if (categories.length === 0) {
            return res.status(404).json({ message: 'No categories found for this type' });
        }

        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getCategoriesWithSubCategoriesAndTypes = async (req, res) => {
    try {
        // Fetch only active types
        const activeTypes = await Type.find({ active: true }).select('_id');

        if (activeTypes.length === 0) {
            return res.status(404).json({ message: 'No active types found' });
        }

        // Extract active type IDs
        const activeTypeIds = activeTypes.map(type => type._id);

        // Fetch categories with only active types
        const categories = await Category.find({ type: { $in: activeTypeIds } })
            .populate('type', 'name') // Populate the type field with relevant details (e.g., name)
            .populate({
                path: 'subcategories',
                match: { active: true }, // Ensure only active subcategories are included
                populate: {
                    path: 'category', // Populate the category field within each subcategory, if it exists
                }
            });

        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


export const toggleCategoryStatus = async (req, res) => {
    try {
        const { active } = req.body;

        const updatedCategoryStatus = await Category.findByIdAndUpdate(
            req.params.id,
            { active },
            { new: true }
        );

        if (!updatedCategoryStatus) {
            return res.status(404).send('Category not found');
        }

        res.json(updatedCategoryStatus);
    } catch (error) {
        console.error('Error updating updatedCategoryStatus status:', error);
        res.status(500).send('Server error');
    }
};
export const toggleSubCategoryStatus = async (req, res) => {
    try {
        const { active } = req.body; // The desired status from the client

        // Find and update the subcategory
        const updatedSubCategoryStatus = await SubCategory.findByIdAndUpdate(
            req.params.id,
            { active }, // Set the status based on the provided value
            { new: true }
        );

        if (!updatedSubCategoryStatus) {
            return res.status(404).send('Subcategory not found');
        }

        res.json(updatedSubCategoryStatus);
    } catch (error) {
        console.error('Error updating subcategory status:', error);
        res.status(500).send('Server error');
    }
};




// Update Category
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, image } = req.body;
        const updatedCategory = await Category.findByIdAndUpdate(id, { name, type, image }, { new: true });
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

// Get SubCategories by Category ID
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
        const { name, categoryId, image } = req.body; // Include image in the request body
        const newSubCategory = new SubCategory({ name, category: categoryId, image });
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
        const { name, categoryId, image } = req.body; // Include image in the request body
        const updatedSubCategory = await SubCategory.findByIdAndUpdate(
            id, 
            { name, category: categoryId, image }, // Include image in the update
            { new: true }
        );
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

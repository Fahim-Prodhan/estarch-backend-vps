// routes/categoryRoutes.js
import { Router } from 'express';
import {
    createCategory,
    createSubCategory,
    updateCategory,
    updateSubCategory,
    deleteCategory,
    deleteSubCategory,
    getSubCategories,
    fetchSubCategories,
    createBrand,
    getBrands,
    updateBrand,
    deleteBrand,
    getCategoriesWithSubCategoriesAndTypes,
    getCategoriesByTypeName,
    getCategoryById,
    toggleCategoryStatus,
    toggleSubCategoryStatus
} from '../controllers/categoryController.js';
import uploader from '../middleware/uploader.js';

const router = Router();

// router.post('/categories', createCategory);
router.post('/categories', uploader.single('image'), createCategory);

router.post('/subcategories',uploader.single('image'), createSubCategory);
router.get('/find/:id', getCategoryById);
router.get('/subcategories', getSubCategories);
router.get('/categories', getCategoriesWithSubCategoriesAndTypes);
router.get('/categories/:typeName', getCategoriesByTypeName);
router.get('/subcategories/:categoryId', fetchSubCategories);
router.put('/categories/:id', updateCategory);
router.put('/subcategories/:id', updateSubCategory);
router.delete('/categories/:id', deleteCategory);
router.delete('/subcategories/:id', deleteSubCategory);
router.post('/brands', createBrand);
router.get('/brands', getBrands);
router.put('/brands/:id', updateBrand);
router.delete('/brands/:id', deleteBrand);
router.patch('/categories/:id/status', toggleCategoryStatus);
router.patch('/subcategories/:id/status', toggleSubCategoryStatus);

export default router;

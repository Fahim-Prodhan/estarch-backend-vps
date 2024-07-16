import express from 'express';
import { createCategory, getCategories, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import featureToggle from '../middleware/categoryMiddleware.js';
import uploader from '../middleware/uploader.js';

const router = express.Router();

// Create a new category
router.post('/', uploader.array('images', 10), featureToggle, createCategory);

// Get all categories
router.get('/', getCategories);

// Update a category
router.put('/:id', featureToggle, updateCategory);

// Delete a category
router.delete('/:id', deleteCategory);

export default router;

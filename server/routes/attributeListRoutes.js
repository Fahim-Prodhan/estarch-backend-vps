import express from 'express';
import { createAttribute, getAttributes, updateAttribute, deleteAttribute } from '../controllers/attributeListController.js';

const router = express.Router();

// Create a new attribute
router.post('/', createAttribute);

// Get all attributes
router.get('/', getAttributes);

// Update an attribute
router.put('/:id', updateAttribute);

// Delete an attribute
router.delete('/:id', deleteAttribute);

export default router;

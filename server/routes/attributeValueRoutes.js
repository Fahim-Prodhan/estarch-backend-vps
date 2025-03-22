import express from 'express';
import { createAttributeValue, getAttributeValues, updateAttributeValue, deleteAttributeValue } from '../controllers/attributeValueController.js';

const router = express.Router();

// Create a new attribute value
router.post('/', createAttributeValue);

// Get all attribute values
router.get('/', getAttributeValues);

// Update an attribute value
router.put('/:id', updateAttributeValue);

// Delete an attribute value
router.delete('/:id', deleteAttributeValue);

export default router;

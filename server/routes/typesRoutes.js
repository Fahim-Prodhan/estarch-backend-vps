import express from 'express';
import { createType, getTypes, updateType, deleteType } from '../controllers/typeController.js';

const router = express.Router();

router.post('/', createType);
router.get('/', getTypes);
router.put('/:id', updateType);
router.delete('/:id', deleteType);

export default router;

import express from 'express';
import { createType, getTypes, updateType, deleteType,getTypeById } from '../controllers/typeController.js';
import uploader from '../middleware/uploader.js';

const router = express.Router();

router.post('/',uploader.single('image'), createType);
router.get('/', getTypes);
router.get('/:id', getTypeById);
router.put('/:id', updateType);
router.delete('/:id', deleteType);

export default router;

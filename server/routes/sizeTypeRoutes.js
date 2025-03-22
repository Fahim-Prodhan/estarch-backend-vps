import express from 'express';
import { getAllSizeTypes, createSizeType, updateSizeType, deleteSizeType } from '../controllers/sizeTypeController.js';

const router = express.Router();

router.get('/', getAllSizeTypes);
router.post('/', createSizeType);
router.put('/:id', updateSizeType);
router.delete('/:id', deleteSizeType);

export default router;

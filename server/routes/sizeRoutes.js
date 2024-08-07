import express from 'express';
import { getAllSizes, createSize, updateSize, deleteSize,getSizesBySizeTypeName } from '../controllers/sizeController.js';

const router = express.Router();

router.get('/', getAllSizes);
router.post('/', createSize);
router.put('/:id', updateSize);
router.delete('/:id', deleteSize);
router.get('/by-size-type-name/:name', getSizesBySizeTypeName);

export default router;

import express from 'express';
import { getAllBrands } from '../controllers/branController.js';

const router = express.Router();

router.get('/', getAllBrands)

export default router;
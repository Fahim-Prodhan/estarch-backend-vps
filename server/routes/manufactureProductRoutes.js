import express from 'express';
import { createManufacture,getAllManufactureProducts } from '../controllers/manufactureProductController.js';

const router = express.Router();


router.post('/create', createManufacture)
router.get('/', getAllManufactureProducts)


export default router;
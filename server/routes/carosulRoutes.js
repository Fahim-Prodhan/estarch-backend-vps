import express from 'express';
import {getCarosul,createCarosul,updateCarosul,deleteCarosul } from '../controllers/carosulController.js';

const router = express.Router();

router.post('/', createCarosul);
router.get('/', getCarosul);
router.put('/:id', updateCarosul);
router.delete('/:id', deleteCarosul);

export default router;

import express from 'express';
import { createManufacture } from '../controllers/manufactureProductController.js';

const router = express.Router();


router.post('/create', createManufacture)


export default router;
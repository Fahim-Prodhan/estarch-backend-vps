import express from 'express';
import { createCourierApi, getAllCourierApis, getCourierApiById, updateCourierApi } from '../controllers/courierApiController.js';

const router = express.Router();

router.post('/', createCourierApi);

router.get('/', getAllCourierApis);

router.get('/:id', getCourierApiById);

router.put('/:id', updateCourierApi);

export default router;
import express from 'express';
import { getExtraSection,createExtraSection,update } from '../controllers/extraSectionRouteController.js';

const router = express.Router();

// Get the toggle states
router.get('/', getExtraSection);
router.post('/', createExtraSection);
router.put('/:id', update);


export default router;

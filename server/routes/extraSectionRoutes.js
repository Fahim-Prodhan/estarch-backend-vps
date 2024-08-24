import express from 'express';
import { getExtraSection,createExtraSection } from '../controllers/extraSectionRouteController.js';

const router = express.Router();

// Get the toggle states
router.get('/', getExtraSection);
router.post('/', createExtraSection);


export default router;

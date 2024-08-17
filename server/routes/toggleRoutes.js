import express from 'express';
import { getToggleStates, updateToggleStates } from '../controllers/toggleController.js';

const router = express.Router();

// Get the toggle states
router.get('/toggleStates', getToggleStates);

// Update the toggle states
router.post('/toggleStates', updateToggleStates);

export default router;

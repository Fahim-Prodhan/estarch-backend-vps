// routes/chartRoutes.mjs
import express from 'express';
import { createChart, getCharts, getChartById, updateChart, deleteChart } from '../controllers/sizeChartController.js';

const router = express.Router();

// Create a new chart
router.post('/', createChart);

// Get all charts
router.get('/', getCharts);

// Get a single chart by ID
router.get('/:id', getChartById);

// Update a chart by ID
router.put('/:id', updateChart);

// Delete a chart by ID
router.delete('/:id', deleteChart);

export default router;

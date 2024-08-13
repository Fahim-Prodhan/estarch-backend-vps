// controllers/chartController.mjs
import Chart from '../models/sizeChart.js';

// Create a new chart
export const createChart = async (req, res) => {
    console.log('working');
    
    try {
        const chart = new Chart(req.body);
        await chart.save();
        res.status(201).json(chart);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all charts
export const getCharts = async (req, res) => {
    try {
        const charts = await Chart.find();
        res.status(200).json(charts);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get a single chart by ID
export const getChartById = async (req, res) => {
    try {
        const chart = await Chart.findById(req.params.id);
        if (!chart) {
            return res.status(404).json({ error: 'Chart not found' });
        }
        res.status(200).json(chart);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update a chart by ID
export const updateChart = async (req, res) => {
    try {
        const chart = await Chart.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!chart) {
            return res.status(404).json({ error: 'Chart not found' });
        }
        res.status(200).json(chart);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a chart by ID
export const deleteChart = async (req, res) => {
    try {
        const chart = await Chart.findByIdAndDelete(req.params.id);
        if (!chart) {
            return res.status(404).json({ error: 'Chart not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// models/chartModel.mjs
import mongoose from 'mongoose';

const chartSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    data: {
        type: [[String]], // 2D array of strings
        required: true,
    },
}, { timestamps: true });

const Chart = mongoose.model('Chart', chartSchema);

export default Chart;

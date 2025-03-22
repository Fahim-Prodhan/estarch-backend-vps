import mongoose from 'mongoose';

// Define CashEntry Schema
const cashEntrySchema = new mongoose.Schema({
    cashList: [
        {
            denomination: {
                type: Number,
                required: true,
            },
            pieces: {
                type: Number,
                required: true,
            }
        },
    ],
    total: {
        type: Number,
        required: true,
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Create and export the model
const CashEntry = mongoose.model('CashEntry', cashEntrySchema);
export default CashEntry;

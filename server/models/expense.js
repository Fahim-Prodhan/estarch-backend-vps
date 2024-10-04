import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    expenseType: {
        type: String,
        required: false,
    },
    details: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: false,
    },
    assetName: {
        type: String,
        required: false,
    },
    isAsset: {
        type: Boolean,
        required: true,
        default: false,
    },
    isApprove: {
        type: Boolean,
        required: true,
        default: false,
    },
}, { timestamps: true });

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;

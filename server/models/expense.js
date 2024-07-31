import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    expenseType: {
        type: String,
        required: true
    },
    paymentType: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    details: {
        type: String,
        required: true
    }
});

const Expense = mongoose.model('Expense', ExpenseSchema);

export default Expense;

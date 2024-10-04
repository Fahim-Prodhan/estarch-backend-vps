import mongoose from 'mongoose';

const expenseHeadSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }
});

const ExpenseHead = mongoose.model('ExpenseHead', expenseHeadSchema);
export default ExpenseHead;

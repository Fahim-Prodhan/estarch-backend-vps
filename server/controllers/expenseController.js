import Expense from '../models/expense.js';
import Asset from '../models/Assect.js';
import User from '../models/user.js';
import UserPaymentOption from "../models/UserPaymentOption.js";
// Create a new expense
export const createExpense = async (req, res) => {
    const { amount,
        expenseType,
        details,
        quantity,
        isAsset,
        isApprove,
        assetName,
        senderId } = req.body
    const accountants = await User.findOne({ role: 'accountant' });
    try {
        const data = {
            amount,
            expenseType,
            details,
            quantity,
            isAsset,
            isApprove,
            assetName,
            senderId,
            receiverId: accountants._id
        }
        const expense = new Expense(data);
        await expense.save();
        res.status(201).json({ message: 'Expense created successfully', expense });
    } catch (error) {
        res.status(400).json({ message: 'Error creating expense', error: error.message });
    }
};

// Get all expenses
export const getAllExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find();
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching expenses', error: error.message });
    }
};

// Get a single expense by ID
export const getExpenseById = async (req, res) => {
    try {
        const { id } = req.params;
        const expense = await Expense.findById(id);
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        res.status(200).json(expense);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching expense', error: error.message });
    }
};

// Update an expense by ID
export const updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedExpense = await Expense.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedExpense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        res.status(200).json({ message: 'Expense updated successfully', updatedExpense });
    } catch (error) {
        res.status(400).json({ message: 'Error updating expense', error: error.message });
    }
};

// Delete an expense by ID
export const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedExpense = await Expense.findByIdAndDelete(id);
        if (!deletedExpense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting expense', error: error.message });
    }
};

export const handleApprove = async (req, res) => {
    try {
        const { id } = req.params;
        const expense = await Expense.findById(id);

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        const accountUser = await User.findOne({ _id: expense.senderId });
        const accountPayment = await UserPaymentOption.findOne({ userId: accountUser._id });
        const accounts = accountPayment.paymentOption.accounts.find(acc => acc.accountType.toLowerCase() === 'cash');
        const paymentDetails = accounts.payments.find(p => p.paymentOption === '');
        paymentDetails.amount -= parseInt(expense.amount, 10);
        await accountPayment.save();
        expense.isApprove = true;
        await expense.save();

        if (expense.isAsset) {
            const asset = new Asset({
                name: expense.assetName,
                quantity: expense.quantity,
                price: expense.amount / expense.quantity,
            });

            await asset.save();
        }

        res.status(200).json({ message: 'Expense approved successfully', expense });
    } catch (error) {
        res.status(500).json({ message: 'Error approving expense', error: error.message });
    }
};
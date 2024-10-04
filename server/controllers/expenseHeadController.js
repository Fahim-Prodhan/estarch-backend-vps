import ExpenseHead from '../models/ExpenseHead.js';  // Assuming your model is in models folder

// Create an ExpenseHead
export const createExpenseHead = async (req, res) => {
    const { name } = req.body;

    try {
        const newExpenseHead = new ExpenseHead({ name });
        await newExpenseHead.save();
        res.status(201).json({ message: 'Expense head created successfully', data: newExpenseHead });
    } catch (error) {
        res.status(400).json({ message: 'Error creating expense head', error: error.message });
    }
};

// Get all ExpenseHeads
export const getAllExpenseHeads = async (req, res) => {
    try {
        const expenseHeads = await ExpenseHead.find();
        res.status(200).json({ message: 'Expense heads retrieved successfully', data: expenseHeads });
    } catch (error) {
        res.status(400).json({ message: 'Error retrieving expense heads', error: error.message });
    }
};

// Get ExpenseHead by ID
export const getExpenseHeadById = async (req, res) => {
    const { id } = req.params;

    try {
        const expenseHead = await ExpenseHead.findById(id);
        if (!expenseHead) {
            return res.status(404).json({ message: 'Expense head not found' });
        }
        res.status(200).json({ message: 'Expense head retrieved successfully', data: expenseHead });
    } catch (error) {
        res.status(400).json({ message: 'Error retrieving expense head', error: error.message });
    }
};

// Update an ExpenseHead
export const updateExpenseHead = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        const updatedExpenseHead = await ExpenseHead.findByIdAndUpdate(id, { name }, { new: true, runValidators: true });
        if (!updatedExpenseHead) {
            return res.status(404).json({ message: 'Expense head not found' });
        }
        res.status(200).json({ message: 'Expense head updated successfully', data: updatedExpenseHead });
    } catch (error) {
        res.status(400).json({ message: 'Error updating expense head', error: error.message });
    }
};

// Delete an ExpenseHead
export const deleteExpenseHead = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedExpenseHead = await ExpenseHead.findByIdAndDelete(id);
        if (!deletedExpenseHead) {
            return res.status(404).json({ message: 'Expense head not found' });
        }
        res.status(200).json({ message: 'Expense head deleted successfully', data: deletedExpenseHead });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting expense head', error: error.message });
    }
};

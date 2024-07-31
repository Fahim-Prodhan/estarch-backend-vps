import express from 'express';
import { createExpense, getExpenses, updateExpense, deleteExpense } from '../controllers/expenseController.js';

const router = express.Router();

// Create a new expense
router.post('/', createExpense);

// Get all expenses
router.get('/', getExpenses);

// Update an expense
router.put('/:id', updateExpense);

// Delete an expense
router.delete('/:id', deleteExpense);

export default router;

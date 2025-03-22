import express from 'express';
import {handleApprove, createExpense, getAllExpenses, getExpenseById, updateExpense, deleteExpense } from '../controllers/expenseController.js';

const router = express.Router();

router.post('/expenses', createExpense); 
router.get('/expenses', getAllExpenses); 
router.get('/expenses/:id', getExpenseById); 
router.put('/expenses/:id', updateExpense); 
router.delete('/expenses/:id', deleteExpense); 
router.put('/expenses/approve/:id', handleApprove);

export default router;

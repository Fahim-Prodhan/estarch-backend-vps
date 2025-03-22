import express from 'express';
import { 
    createExpenseHead, 
    getAllExpenseHeads, 
    getExpenseHeadById, 
    updateExpenseHead, 
    deleteExpenseHead 
} from '../controllers/expenseHeadController.js';  // Assuming controllers are in controllers folder

const router = express.Router();

// Create a new ExpenseHead
router.post('/expense-heads', createExpenseHead);

// Get all ExpenseHeads
router.get('/expense-heads', getAllExpenseHeads);

// Get an ExpenseHead by ID
router.get('/expense-heads/:id', getExpenseHeadById);

// Update an ExpenseHead
router.put('/expense-heads/:id', updateExpenseHead);

// Delete an ExpenseHead
router.delete('/expense-heads/:id', deleteExpenseHead);

export default router;

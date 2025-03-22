import express from 'express';
import { createTransaction,getTransactionsByReceiverId,getTransactionsBySenderId,getTransactionsById, approveTransaction, declineTransaction } from '../controllers/transactionController.js';


const router = express.Router();

router.post('/create', createTransaction)
router.patch('/approve/:transactionId', approveTransaction)
router.patch('/decline/:transactionId', declineTransaction)
router.get('/get-notification/:receiverId', getTransactionsByReceiverId)
router.get('/get-transaction/:senderId', getTransactionsBySenderId)
router.get('/get-my-transaction/:id', getTransactionsById)


export default router;
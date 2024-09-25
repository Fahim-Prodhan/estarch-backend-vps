import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    tId: {
        type: String,
        required: true,
        unique: true 
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
    amount: {
        type: Number,
        required: true,
        min: 0 
    },
    type: {
        type: String,
        required: true 
    },
    accountType: {
        type: String,
        required: true 
    },
    paymentOption: {
        type: String,
        required: true ,
        default:'cash'
    },
    isApprove: {
        type: Boolean,
        default: false 
    },
    isDecline: {
        type: Boolean,
        default: false 
    }
}, { timestamps: true }); 

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;

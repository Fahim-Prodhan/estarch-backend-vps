// controllers/courierAccount.controller.js
import CourierAccount from '../models/courierAccount.js';
import User from '../models/user.js';
import UserPaymentOption from "../models/UserPaymentOption.js";
// Get courier account data
export const getCourierAccount = async (req, res) => {
    try {
        const account = await CourierAccount.findOne();
        if (!account) return res.status(404).json({ message: 'Account not found' });

        res.json(account);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create or initialize the courier account
export const createAccount = async (req, res) => {
    try {
        const account = new CourierAccount(req.body);
        await account.save();
        res.status(201).json(account);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Make a withdrawal
export const makeWithdrawal = async (req, res) => {
    const { amount, deliveryCharge, codCharge } = req.body;
   
    try {
        const account = await CourierAccount.findOne();
        if (!account) return res.status(404).json({ message: 'Account not found' });

        if (amount > account.availableAmount) {
          return res.status(400).json({ message: 'Insufficient balance' });
        }

        const netAmount = amount - deliveryCharge - codCharge;

        const newWithdrawal = { amount, deliveryCharge, codCharge, netAmount };
        account.withdrawals.push(newWithdrawal);
        account.availableAmount -= amount;
        account.totalWithdrawAmount += amount;
        const accountants = await User.findOne({ role: 'accountant' });
        const accountPayment = await UserPaymentOption.findOne({ userId: accountants._id });
        const accounts = accountPayment.paymentOption.accounts.find(acc => acc.accountType.toLowerCase() === 'cash');
        const paymentDetails = accounts.payments.find(p => p.paymentOption === '');
        paymentDetails.amount += parseInt(netAmount, 10);
        await accountPayment.save();
        await account.save();
        res.json({ message: 'Withdrawal successful', account });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

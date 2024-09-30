import Investor from "../models/investor.js";
import MainAccount from "../models/mainAccount.js";
import Transaction from "../models/transaction.js";
import User from "../models/user.js";
import UserPaymentOption from "../models/UserPaymentOption.js";

const generateTransactionId = () => {
    const prefix = "EST-TN-";
    const uniqueNumber = Math.floor(10000000 + Math.random() * 90000000); // Generate 8-digit unique number
    return `${prefix}${uniqueNumber}`;
};


// Function to create a transaction
export const createTransaction = async (req, res) => {
    const { senderId, receiverId, amount, type, accountType, paymentOption, payments } = req.body;

    try {
        const transaction = new Transaction({
            tId: generateTransactionId(), // Generate the transaction ID
            senderId,
            receiverId,
            amount,
            type,
            accountType,
            paymentOption,
            isApprove: false,
            payments
        });

        await transaction.save();
        res.status(201).json({ message: "Transaction created successfully", transaction });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Function to approve a transaction
export const approveTransaction = async (req, res) => {
    const { transactionId } = req.params;

    try {
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        // Check if the transaction is already approved
        if (transaction.isApprove) {
            return res.status(400).json({ message: "Transaction is already approved" });
        }




        if (transaction.type == 'invest') {
            // Update sender's and receiver's balances
            const sender = await User.findOne({ userId: transaction.senderId });
            const receiver = await MainAccount.findOne({ userId: transaction.receiverId });

            if (sender && receiver) {
                // Deduct from sender's balance
                sender.investedAmount += transaction.amount; // Assuming spendAmount tracks outgoings
                // Add to receiver's balance
                receiver.earnAmount += transaction.amount; // Assuming earnAmount tracks incomings

                await sender.save();
                await receiver.save();

                res.status(200).json({ message: "Transaction approved and accounts updated", transaction });
            } else {
                return res.status(404).json({ message: "Sender or receiver not found" });
            }

        } else if (transaction.type == 'withdraw') {
            // Update sender's and receiver's balances
            const sender = await MainAccount.findOne({ userId: transaction.senderId });
            const receiver = await Investor.findOne({ userId: transaction.receiverId });

            if (sender && receiver) {
                // Deduct from sender's balance
                sender.spendAmount += transaction.amount;
                // Add to receiver's balance
                receiver.withdrawAmount += transaction.amount;

                await sender.save();
                await receiver.save();

                res.status(200).json({ message: "Transaction approved and accounts updated", transaction });
            } else {
                return res.status(404).json({ message: "Sender or receiver not found" });
            }
        }
        else if (transaction.type === 'showroom-Withdraw') {
            // Update sender's and receiver's balances
            const sender = await User.findOne({ _id: transaction.senderId });
            const receiver = await MainAccount.findOne({ userId: transaction.receiverId });

            if (sender && receiver) {
                const userPayment = await UserPaymentOption.findOne({ userId: transaction.senderId });
                // Iterate over transaction payments
                for (const payment of transaction.payments) {
                    const { accountType, paymentOption, amount } = payment;

                    // Find the matching account based on accountType
                    const account = userPayment.paymentOption.accounts.find(acc => acc.accountType === accountType);

                    if (account) {
                        // Find the payment option inside the account that matches the paymentOption
                        const paymentDetails = account.payments.find(p => p.paymentOption === paymentOption);

                        if (paymentDetails) {
                            // Subtract the amount from the user's payment balance
                            paymentDetails.amount -= amount;

                            if (paymentDetails.amount < 0) {
                                return res.status(400).json({ message: "Insufficient funds in account" });
                            }

                            console.log(`Updated balance for ${paymentOption}: ${paymentDetails.amount}`);
                        } else {
                            return res.status(404).json({ message: `Payment option ${paymentOption} not found` });
                        }
                    } else {
                        return res.status(404).json({ message: `Account type ${accountType} not found` });
                    }
                }

                // Add the transaction amount to the receiver's earnings
                receiver.earnAmount += transaction.amount;

                // Save the updated balances for both the sender and receiver
                await userPayment.save();
                await receiver.save();

                res.status(200).json({ message: "Transaction approved and accounts updated", transaction });
            } else {
                return res.status(404).json({ message: "Sender or receiver not found" });
            }
        }
        // Approve the transaction
        transaction.isApprove = true;
        await transaction.save();

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Function to decline a transaction
export const declineTransaction = async (req, res) => {
    const { transactionId } = req.params;

    try {
        // Find the transaction by its ID
        const transaction = await Transaction.findById(transactionId);

        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        // Check if the transaction is already declined
        if (transaction.isDecline) {
            return res.status(400).json({ message: "Transaction is already declined" });
        }

        // Set isDecline to true
        transaction.isDecline = true;
        await transaction.save();

        // Respond with success message
        res.status(200).json({ message: "Transaction declined successfully", transaction });
    } catch (error) {
        // Handle any errors
        res.status(500).json({ message: "An error occurred", error: error.message });
    }
};

// Get all transactions by receiverId
export const getTransactionsByReceiverId = async (req, res) => {
    const { receiverId } = req.params;
    try {
        // Find transactions where receiverId matches the provided id
        const transactions = await Transaction.find({ receiverId, isApprove: false, isDecline: false }).populate('senderId', 'fullName role email').populate('receiverId', 'fullName role email');

        if (!transactions.length) {
            return res.status(404).json({ message: "No transactions found for this receiver." });
        }

        // Return the transactions
        res.status(200).json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error. Unable to retrieve transactions." });
    }
};

// Get all transactions by receiverId
export const getTransactionsBySenderId = async (req, res) => {
    const { senderId } = req.params;
    try {
        // Find transactions where receiverId matches the provided id
        const transactions = await Transaction.find({ senderId, isApprove: false, isDecline: false }).populate('senderId', 'fullName role email').populate('receiverId', 'fullName role email');

        if (!transactions.length) {
            return res.status(404).json({ message: "No transactions found for this receiver." });
        }

        // Return the transactions
        res.status(200).json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error. Unable to retrieve transactions." });
    }
};


// Get all transactions by id (can be senderId or receiverId)
export const getTransactionsById = async (req, res) => {
    const { id } = req.params; // Change senderId to id
    const page = parseInt(req.query.page) || 1; // Default to 1 if page is not provided
    const size = parseInt(req.query.size) || 10;
    let text = req.query.search || '';
    try {
        // Find transactions where either senderId or receiverId matches the provided id
        const transactions = await Transaction.find({
            $or: [
                { senderId: id },
                { receiverId: id }
            ]
        })
            .sort({ createdAt: -1 })
            .skip((page - 1) * size)
            .limit(size)
            .populate('senderId', 'fullName role email')
            .populate('receiverId', 'fullName role email');

        if (!transactions.length) {
            return res.status(404).json({ message: "No transactions found for this id." });
        }

        // Count total products matching the query
        const totalTransaction = await Transaction.countDocuments();
        // Calculate total pages
        const totalPages = Math.ceil(totalTransaction / size);


        // Return the transactions
        res.status(200).json({ transactions, totalTransaction, currentPage: parseInt(page), totalPages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error. Unable to retrieve transactions." });
    }
};


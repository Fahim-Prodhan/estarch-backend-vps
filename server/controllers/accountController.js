import MainAccount from "../models/mainAccount.js";
import Investor from "../models/investor.js";
import User from "../models/user.js";
import bcrypt from 'bcryptjs';
import Transaction from "../models/transaction.js";

// Create a new Main Account
export const createMainAccount = async (req, res) => {
    try {
        const { accountantName, earnAmount, spendAmount, userId } = req.body;

        // Validate the input
        if (!accountantName || earnAmount < 0 || spendAmount < 0) {
            return res.status(400).json({ message: "Invalid input" });
        }

        // Create a new Main Account instance
        const newAccount = new MainAccount({
            accountantName,
            earnAmount,
            spendAmount,
            userId: userId || null // Set userId to null if not provided
        });

        // Save the new account to the database
        const savedAccount = await newAccount.save();

        return res.status(201).json({ message: "Main Account created successfully", account: savedAccount });
    } catch (error) {
        console.error("Error creating Main Account:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getMainAccountByUserId = async (req, res) => {
    const userId = req.params.id; 
    try {
        // Check if userId is provided
        if (!userId) {
            return res.status(400).json({ message: "User ID is required." });
        }

        // Find the main account based on userId
        const account = await MainAccount.findOne({ userId: userId });

        // If no account is found, return a 404 error
        if (!account) {
            return res.status(404).json({ message: "No account found for the given user." });
        }

        // Return the account data
        res.status(200).json(account);
    } catch (error) {
        // Handle any errors during the process
        console.error("Error fetching account:", error);
        res.status(500).json({ message: "An error occurred while fetching the account." });
    }
};

export const getMainAccount = async (req, res) => {
    try {

        // Find the main account based on userId
        const account = await MainAccount.findOne();

        // If no account is found, return a 404 error
        if (!account) {
            return res.status(404).json({ message: "No account found for the given user." });
        }
        // Return the account data
        res.status(200).json(account);
    } catch (error) {
        // Handle any errors during the process
        console.error("Error fetching account:", error);
        res.status(500).json({ message: "An error occurred while fetching the account." });
    }
};

// Controller to fetch all investors
export const getAllInvestors = async (req, res) => {
    try {
      // Fetch all investors from the database
      const investors = await Investor.find();
  
      // Send the list of investors as a response
      res.status(200).send(investors);
    } catch (error) {
      console.error("Error fetching investors:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch investors. Please try again later.",
        error: error.message,
      });
    }
  };


// Controller to fetch all investors
export const getSingleInvestor = async (req, res) => {

  const {userId} = req.params

    try {
      // Fetch all investors from the database
      const investors = await Investor.findOne({userId:userId});
  
      // Send the list of investors as a response
      res.status(200).send(investors);
    } catch (error) {
      console.error("Error fetching investors:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch investors. Please try again later.",
        error: error.message,
      });
    }
  };



// Register Investor and create investor account
export const registerInvestor = async (req, res) => {
  const { fullName, mobile, email, password, gender } = req.body;

  try {
    // Check if a user already exists by email
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ msg: 'User already exists with this email' });
    }

    // Hash the password before saving to the database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user with the investor role
    user = new User({
      fullName,
      mobile,
      email,
      gender,
      password: hashedPassword,
      role: 'investor',  // Set role to 'investor'
      isActive: true  // Optionally set the account as active
    });

    // Save the user to the database
    await user.save();

    // Create the associated investor account with the new user's ID
    const investor = new Investor({
      investorName: fullName,
      investedAmount: 0,
      withdrawAmount: 0, 
      userId: user._id, 
    });

    // Save the investor account to the database
    await investor.save();

    // Respond with a success message and created user and investor account
    res.status(201).json({
      msg: 'Investor registered successfully',
      user,  // Optionally return the created user data
      investor  // Optionally return the created investor account
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Function to calculate the balance (invest - withdraw)
export const calculateInvestedBalance = async (req, res) => {

  
  try {
      // Calculate total amount for "invest" transactions
      const investTotal = await Transaction.aggregate([
          { $match: { type: "invest", isApprove: true } },   // Match transactions where type is "invest"
          { $group: { _id: null, total: { $sum: "$amount" } } } // Sum the amounts
      ]);

      // Calculate total amount for "withdraw" transactions
      const withdrawTotal = await Transaction.aggregate([
          { $match: { type: "withdraw", isApprove: true } }, // Match transactions where type is "withdraw"
          { $group: { _id: null, total: { $sum: "$amount" } } } // Sum the amounts
      ]);

      // Extract the total amounts or default to 0 if no transactions found
      const totalInvest = investTotal.length > 0 ? investTotal[0].total : 0;
      const totalWithdraw = withdrawTotal.length > 0 ? withdrawTotal[0].total : 0;

      // Calculate the balance (invest - withdraw)
      const balance = totalInvest - totalWithdraw;

      // Respond with the result
      res.status(200).json({
          message: "Balance calculated successfully",
          totalInvest,
          totalWithdraw,
          balance
      });
  } catch (error) {
      // Handle any errors
      res.status(500).json({ message: "An error occurred", error: error.message });
  }
};



import UserPaymentOption from '../models/UserPaymentOption.js'; // Adjust the path as needed

// Controller to get user payment option by userId
export const getUserPaymentOptionByUserId = async (req, res) => {
  const { userId } = req.params; // Extract userId from route parameters
  console.log(userId);

  try {
    // Find the UserPaymentOption document by userId
    const userPaymentOption = await UserPaymentOption.findOne({ userId }).populate('userId'); // Populate the user details if needed

    if (!userPaymentOption) {
      return res.status(404).json({ message: 'User payment option not found' });
    }

    // Extract the accounts from the userPaymentOption
    const accounts = userPaymentOption.paymentOption.accounts;

    let totalAmount = 0;
    const accountDetails = accounts.map(account => {
      let accountTypeTotal = 0;
      const paymentList = account.payments.map(payment => {
        accountTypeTotal += payment.amount;
        return {
          paymentOption: payment.paymentOption,
          amount: payment.amount
        };
      });

      totalAmount += accountTypeTotal;

      return {
        accountType: account.accountType,
        totalAmount: accountTypeTotal,
        payments: paymentList
      };
    });

    // Construct the modified response data
    const modifiedResponse = {
      totalAmount,
      accountDetails
    };

    // Respond with the modified data
    res.status(200).json(modifiedResponse);
  } catch (error) {
    // Handle any potential errors
    res.status(500).json({ message: 'Server error', error });
  }
};


import PaymentOption from '../models/PaymentOption.js';
import UserPaymentOption from '../models/UserPaymentOption.js';
// Create a new payment option
export const createPaymentOption = async (req, res) => {
  try {
    const paymentOption = new PaymentOption(req.body);
    const savedPaymentOption = await paymentOption.save();
    res.status(201).json(savedPaymentOption);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all payment options
export const getAllPaymentOptions = async (req, res) => {
  try {
    const paymentOptions = await PaymentOption.find();
    res.status(200).json(paymentOptions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single payment option by ID
export const getPaymentOptionById = async (req, res) => {
  try {
    const paymentOption = await PaymentOption.findById(req.params.id);
    if (!paymentOption) {
      return res.status(404).json({ message: 'Payment Option not found' });
    }
    res.status(200).json(paymentOption);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a payment option by ID
export const updatePaymentOption = async (req, res) => {
  console.log('working');
  
  try {
    const  paymentOptionId  = req.params.id; // ID of the PaymentOption to update
    const updateData = req.body; // Updated payment option data
console.log(paymentOptionId , updateData);

    // Find and update the PaymentOption itself
    const paymentOption = await PaymentOption.findByIdAndUpdate(
      paymentOptionId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!paymentOption) {
      return res.status(404).json({ message: 'Payment Option not found' });
    }

    // Find all UserPaymentOptions that have the given paymentOptionId
    const userPaymentOptions = await UserPaymentOption.find({ 'paymentOption._id': paymentOptionId });

    // Update each UserPaymentOption with the updated PaymentOption data
    for (let userPaymentOption of userPaymentOptions) {
      userPaymentOption.paymentOption = {
        ...userPaymentOption.paymentOption.toObject(),
        ...updateData
      };
      await userPaymentOption.save(); // Save the updated UserPaymentOption
    }

    res.status(200).json({
      message: 'Payment option updated for all users',
      updatedPaymentOption: paymentOption,
    });
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ error: error.message });
  }
};

// Delete a payment option by ID
export const deletePaymentOption = async (req, res) => {
  try {
    const paymentOption = await PaymentOption.findByIdAndDelete(req.params.id);
    if (!paymentOption) {
      return res.status(404).json({ message: 'Payment Option not found' });
    }
    res.status(200).json({ message: 'Payment Option deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getShowroomAccounts = async (req, res) => {
  try {
    // Find PaymentOption documents where accountName is 'showroom'
    const showroomAccounts = await PaymentOption.find({ accountName: 'showroom' });

    // If no showroom accounts are found
    if (!showroomAccounts || showroomAccounts.length === 0) {
      return res.status(404).json({ message: 'No showroom account data found.' });
    }

    // Return the showroom accounts data
    res.status(200).json(showroomAccounts);
  } catch (error) {
    // Handle errors and return 500 response
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
export const getOnlineAccounts = async (req, res) => {
  try {
    // Find PaymentOption documents where accountName is 'showroom'
    const showroomAccounts = await PaymentOption.find({ accountName: 'online' });

    // If no showroom accounts are found
    if (!showroomAccounts || showroomAccounts.length === 0) {
      return res.status(404).json({ message: 'No showroom account data found.' });
    }

    // Return the showroom accounts data
    res.status(200).json(showroomAccounts);
  } catch (error) {
    // Handle errors and return 500 response
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
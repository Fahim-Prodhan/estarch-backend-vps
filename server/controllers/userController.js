import User from '../models/user.js';
import { sendOtp } from './otpController.js'; // Import sendOtp function

export const registerUser = async (req, res) => {
    const { mobileNumber, password } = req.body;

    if (!mobileNumber || !password) {
        return res.status(400).json({ error: 'Mobile number and password are required' });
    }

    try {
        // Create a new user
        let user = new User({ mobile: mobileNumber, password });

        await user.save();

        // Automatically send OTP after registration
        const response = await sendOtp({ body: { mobileNumber } }, res); // Call sendOtp function with appropriate parameters

        if (response.status === 200) {
            res.json({ success: true, message: 'User registered and OTP sent successfully' });
        } else {
            res.status(500).json({ error: 'Failed to send OTP after registration' });
        }

    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

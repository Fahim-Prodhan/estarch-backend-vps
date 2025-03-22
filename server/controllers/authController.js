import User from '../models/user.js';
import PaymentOption from '../models/PaymentOption.js';
import UserPaymentOption from '../models/UserPaymentOption.js';
import generateTokenAndSetCookie from "../utils/generateToken.js";
import crypto from 'crypto';
import axios from 'axios';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

// Send OTP function
const sendOtp = async (mobile, otp) => {
  const url = `https://smpp.revesms.com:7790/sendtext?apikey=2e2d49f9273cc83c&secretkey=f4bef7bd&callerID=ESTARCH&toUser=${mobile}&messageContent=Your OTP is ${otp}`;
  await axios.get(url);
};

export const registerUser = async (req, res) => {
  const { mobile } = req.body;
  console.log(mobile);
  
  // Validate mobile number
  if (!mobile || !/^\+880[0-9]{10}$/.test(mobile)) {
    return res.status(400).json({ message: 'Invalid mobile number' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      // If OTP has expired, regenerate OTP
      if (existingUser.otpExpires < Date.now()) {
        const otp = crypto.randomInt(100000, 999999).toString();
        existingUser.otp = otp;
        existingUser.otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
        await existingUser.save();
        await sendOtp(mobile, otp);
        return res.status(200).json({ message: 'OTP sent to mobile', userId: existingUser._id });
      }
      return res.status(200).json({
        message: 'OTP already sent, please check your mobile',
        userId: existingUser._id
      });
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    // Create new user
    const user = new User({
      mobile,
      email: undefined, // Ensure email is either a string or undefined
      otp,
      otpExpires: Date.now() + 10 * 60 * 1000 // OTP expires in 10 minutes
    });



    // Save user to the database
    await user.save();

    // Send OTP via SMS
    generateTokenAndSetCookie(user._id, res);
    // await sendOtp(mobile, otp);

    res.status(201).json({
      message: 'User registered, OTP sent to mobile',
      userId: user._id
    });
  } catch (error) {
    if (error instanceof mongoose.Error && error.code === 11000) {
      // Handle duplicate key error
      return res.status(400).json({ message: 'Mobile number or email already exists' });
    }
    console.error('Error in registerUser:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};


export const verifyOtp = async (req, res) => {
  const { userId, otp } = req.body;
  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    user.otp = null; // Clear OTP
    user.otpExpires = null; // Clear OTP expiry time
    user.isActive = true; // Activate user
    await user.save();

    res.status(200).json({ message: 'OTP verified, account activated' });
  } catch (error) {
    console.error('Error in verifyOtp:', error);
    res.status(500).json({ message: 'Error verifying OTP', error: error.message });
  }
};


export const setPassword = async (req, res) => {
  const { userId, password } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user || !user.isActive) {
      return res.status(400).json({ message: 'User not found or not active' });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password set successfully' });
  } catch (error) {
    console.error('Error in setPassword:', error);
    res.status(500).json({ message: 'Error setting password', error: error.message });
  }
};


export const loginUser = async (req, res) => {
  const { mobile, password } = req.body;
  const fullMobileNumber = `+88${mobile}`

  try {
    // Find user by mobile number
    const user = await User.findOne({ mobile: fullMobileNumber });
    // console.log('user:',user);

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Check if the user is active
    if (!user.isActive) {
      return res.status(400).json({ message: 'Account not activated' });
    }

    // Check if the password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Generate JWT token and set cookie
    generateTokenAndSetCookie(user._id, res);

    // Successful login
    res.status(200).json({ message: 'Login successful', userId: user._id });
  } catch (error) {
    console.error('Error in loginUser:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

export const getUserByMobile = async (req, res) => {
  const { mobile } = req.query;

  try {
    const user = await User.findOne({ mobile }).select('mobile'); // Exclude password
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ mobile: user.mobile });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Error fetching user data', error: error.message });
  }
};


// Controller for logout
export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id; 
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      mobile: user.mobile,
      email: user.email,
      role: user.role,
      // verified: user.verified,
      isActive: user.isActive,
      // profilePic:user.profilePic
    });
  } catch (error) {
    console.log("Error in getUserById controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// register admin
export const registerAdmin = async (req, res) => {
  try {
    const { fullName, mobile, email, gender, password, role } = req.body;
    console.log(role);
    
    // Map role to account name
    const roleToAccountNameMap = {
      admin: 'online',
      showroom_manager: 'showroom',
      wholesale: 'wholesale',
      main:'main'
    };

    // Find the corresponding payment option for the role
    const accountName = roleToAccountNameMap[role];

    if (!accountName) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    // Fetch the PaymentOption from the database based on accountName
    const existingPaymentOption = await PaymentOption.findOne({ accountName });

    if (!existingPaymentOption) {
      return res.status(404).json({ message: `Payment option not found for role: ${role}` });
    }

    // Create a new UserPaymentOption with the found PaymentOption
    const userPaymentOption = new UserPaymentOption({
      userId: null, // Will be updated after creating the user
      paymentOption: existingPaymentOption
    });

    const savedUserPaymentOption = await userPaymentOption.save();
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create the new user and associate the UserPaymentOption
    const newUser = new User({
      fullName,
      mobile,
      email,
      gender,
      password:hashedPassword,
      role, // Set the role from req.body
      userPaymentOption: savedUserPaymentOption._id // Link the UserPaymentOption
    });

    // Save the new user and update the userId in UserPaymentOption
    const savedUser = await newUser.save();
    
    savedUserPaymentOption.userId = savedUser._id;
    await savedUserPaymentOption.save();

    res.status(201).json({
      message: 'User and associated Payment Option created successfully',
      user: savedUser
    });
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ error: error.message });
  }
};


export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;


  try {
    // Find user by email
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Check if the user is active
    if (!user.isActive) {
      return res.status(400).json({ message: 'Account not activated' });
    }

    // Check if the user has the admin role
    if (user.role !== 'admin' && user.role !== 'accountant' && user.role !== 'investor' && user.role !== 'main') {
      return res.status(403).json({ message: 'Unauthorized: Admins and accountant only' });
    }

    // Check if the password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Generate JWT token and set cookie
    generateTokenAndSetCookie(user._id, res);

    // Successful login
    res.status(200).json({ message: 'Login successful', userId: user._id });
  } catch (error) {
    console.error('Error in loginAdmin:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};


export const loginShowroomManager = async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);

  try {
    // Find user by email
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Check if the user is active
    if (!user.isActive) {
      return res.status(400).json({ message: 'Account not activated' });
    }

    // Check if the user has the admin role
    if (user.role !== 'showroom_manager') {
      return res.status(403).json({ message: 'Unauthorized: Showroom Manager only' });
    }

    // Check if the password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Generate JWT token and set cookie
    generateTokenAndSetCookie(user._id, res);

    // Successful login
    res.status(200).json({ message: 'Login successful', userId: user._id });
  } catch (error) {
    console.error('Error in loginAdmin:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};


export const findUsersByRole = async (req, res) => {
  try {
    const users = await User.findOne({ role:'accountant' });

    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found with this role.' });
    }

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
export const registerUserApp = async (req, res) => {
  try {
    const { fullName, address, mobile, email, password } = req.body;

    // Check if the mobile number is already registered
    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return res.status(400).json({ message: 'Mobile number is already registered' });
    }
    // Check if the email is already registered (if provided)
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email is already registered' });
      }
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create a new user
    const newUser = new User({
      fullName,
      address,
      mobile,
      email: email || undefined, 
      password: hashedPassword,
    });

    await newUser.save();

    return res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const loginUserApp = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    return res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const loginWithPhoneNumber = async (req, res) => {
  try {
    const { mobile } = req.body;
    // Check if user exists
    let user = await User.findOne({ mobile });
    if (!user) {
      user = new User({ mobile }); // Create new user with only mobile number
      await user.save();
    }
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
    await user.save();
    // Send OTP
    await sendOtp(mobile, otp);
    return res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const verifyOtpForApp = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    // Check if user exists
    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Verify OTP
    if (user.otp !== otp || new Date() > user.otpExpires) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Clear OTP after successful verification
    user.otp = null;
    user.otpExpires = null;
    user.isActive = true;
    await user.save();

    return res.status(200).json({ message: 'OTP verified successfully', user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const getUsersForSidebar = async (req, res) => {
	try {
		const loggedInUserId = req.user._id;

		const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

		res.status(200).json(filteredUsers);
	} catch (error) {
		console.error("Error in getUsersForSidebar: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

// controllers/user.controller.js

export const updateBalance = async (req, res) => {
    try {
		const userId = req.user._id;
        const { balance } = req.body;

        // Find the user by userId
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const finalBalance = user.balance - balance;
        // Update user's balance
        user.balance = finalBalance;
        await user.save();

        res.status(200).json({ message: "Balance updated successfully", balance: user.balance });
    } catch (error) {
        console.log("Error in updateBalance controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


// controllers/user.controller.js

export const updateProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const { fullName, gender } = req.body;

        // Find the user by userId
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Update user's profile
        user.fullName = fullName;
        user.gender = gender;
        await user.save();

        res.status(200).json({ message: "Profile updated successfully", user });
    } catch (error) {
        console.log("Error in updateProfile controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};



// controllers/user.controller.js

// controllers/user.controller.js

export const updatePassword = async (req, res) => {
    try {
        const userId = req.user._id;
        const { oldPassword, newPassword } = req.body;

        // Find the user by userId
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isPasswordCorrect = await bcrypt.compare(oldPassword, user?.password || "");
        // Check if the old password matches
        if (!isPasswordCorrect) {
			return res.status(400).json({ message: "Invalid  password" });
		}
        // HASH PASSWORD HERE
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(newPassword, salt);
        // Update user's password
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.log("Error in updatePassword controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


// controllers/user.controller.js

export const findUserById = async (req, res) => {
    try {

		const userId = req.user._id;
       

        // Find the user by userId
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.log("Error in findUserById controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};



export const deleteUserById = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Delete the user by userId
        const result = await User.deleteOne({ _id: userId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.log("Error in deleteUserById controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


export const updateLocation = async (req, res) => {
    const { lat, lng } = req.body; // Assuming lat and lng are provided in the request body
    const userId = req.user._id; // Assuming userId is passed as a parameter in the URL
    
    try {
      // Find the user by ID
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Update the user's location
      user.location = { lat, lng };
      
      // Save the updated user
      await user.save();
  
      return res.status(200).json({ message: 'User location updated successfully', user });
    } catch (error) {
      console.error('Error updating user location:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

// Controller to get all riders
export const getAllRiders = async (req, res) => {
    try {
      // Find all users with role 'rider'
      const riders = await User.find({ role: 'Rider' });
      res.status(200).json(riders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // Controller to update available seats for a rider
  export const updateAvailableSit = async (req, res) => {
    const { userId, newAvailableSit } = req.body;
  
    try {
      // Find the user by userId
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Update availableSit field
      user.availableSit = newAvailableSit;
      await user.save();
  
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // Controller to get number of available seats by user ID
export const getAvailableSitById = async (req, res) => {
    const userId = req.params.id; // Assuming the user ID is passed in the URL parameter
    console.log(userId);
    try {
      // Find the user by ID
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      console.log(user.seats);
      // Get the availableSit field from the user
      res.status(200).json({ availableSit: user.seats});
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };


 export const getUsers = async (req, res) => {
    const role = 'User';
    try {
      const users = await User.find({ role }).select("-password");
      if (!users || users.length === 0) {
        return res.status(404).json({ message: "Users not found for this role" });
      }
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
 export const getRiders = async (req, res) => {
    const role = 'Rider';
    try {
      const users = await User.find({ role }).select("-password");
      if (!users || users.length === 0) {
        return res.status(404).json({ message: "Users not found for this role" });
      }
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  


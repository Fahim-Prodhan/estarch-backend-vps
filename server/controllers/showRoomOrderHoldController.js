import ShowroomOrderHold from '../models/showRoomOrderHold.js'; 

// Create a new showroom order hold
export const createShowroomOrderHold = async (req, res) => {
  try {
    const showroomOrderHold = new ShowroomOrderHold(req.body);
    await showroomOrderHold.save();
    res.status(201).json(showroomOrderHold);
  } catch (error) {
    res.status(500).json({ message: 'Error creating showroom order hold', error });
  }
};

// Get all showroom order holds
export const getAllShowroomOrderHolds = async (req, res) => {
  try {
    const showroomOrderHolds = await ShowroomOrderHold.find();
    res.status(200).json(showroomOrderHolds);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching showroom order holds', error });
  }
};

// Get a single showroom order hold by ID
export const getShowroomOrderHoldById = async (req, res) => {
  try {
    const showroomOrderHold = await ShowroomOrderHold.findById(req.params.id);
    if (!showroomOrderHold) {
      return res.status(404).json({ message: 'Showroom order hold not found' });
    }
    res.status(200).json(showroomOrderHold);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching showroom order hold', error });
  }
};

// Update a showroom order hold by ID
export const updateShowroomOrderHold = async (req, res) => {
  try {
    const showroomOrderHold = await ShowroomOrderHold.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!showroomOrderHold) {
      return res.status(404).json({ message: 'Showroom order hold not found' });
    }
    res.status(200).json(showroomOrderHold);
  } catch (error) {
    res.status(500).json({ message: 'Error updating showroom order hold', error });
  }
};

// Delete a showroom order hold by ID
export const deleteShowroomOrderHold = async (req, res) => {
  try {
    const showroomOrderHold = await ShowroomOrderHold.findByIdAndDelete(req.params.id);
    if (!showroomOrderHold) {
      return res.status(404).json({ message: 'Showroom order hold not found' });
    }
    res.status(200).json({ message: 'Showroom order hold deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting showroom order hold', error });
  }
};

export const getOrdersByUser = async (req, res) => {
  const userId = req.params.userId; 
  console.log(userId);
  try {
    const orders = await ShowroomOrderHold.find({ user: userId })

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this user' });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error, please try again later' });
  }
};
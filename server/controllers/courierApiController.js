import CourierApi from '../models/courierApi.js'; // Import the CourierApi model

// Create a new Courier API entry
export const createCourierApi = async (req, res) => {
  try {
    const { secretKey, apiKey } = req.body;

    // Check if both secretKey and apiKey are provided
    if (!secretKey || !apiKey) {
      return res.status(400).json({ message: 'Both secretKey and apiKey are required' });
    }
    // Create a new CourierApi instance
    const newCourierApi = new CourierApi({
      secretKey,
      apiKey
    });

    // Save to the database
    const savedCourierApi = await newCourierApi.save();

    // Send the saved data as a response
    res.status(201).json({
      message: 'Courier API created successfully',
      data: savedCourierApi
    });
  } catch (error) {
    // Handle any errors
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Get all Courier API entries
export const getAllCourierApis = async (req, res) => {
    try {
      const courierApis = await CourierApi.find(); // Fetch all records
      res.status(200).json({
        message: 'Courier APIs fetched successfully',
        data: courierApis,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  

  // Get a single Courier API entry by ID
  export const getCourierApiById = async (req, res) => {
    try {
      const { id } = req.params; // Get the id from route params
      const courierApi = await CourierApi.findById(id); // Fetch record by ID
  
      if (!courierApi) {
        return res.status(404).json({ message: 'Courier API not found' });
      }
  
      res.status(200).json({
        message: 'Courier API fetched successfully',
        data: courierApi,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

// Update a Courier API entry by ID
export const updateCourierApi = async (req, res) => {
    try {
      const { id } = req.params; // Get the id from route params
      const { secretKey, apiKey } = req.body; // Get the updated data from request body
  
      // Validate that both fields are provided
      if (!secretKey || !apiKey) {
        return res.status(400).json({ message: 'Both secretKey and apiKey are required' });
      }
  
      // Find the CourierApi by ID and update
      const updatedCourierApi = await CourierApi.findByIdAndUpdate(
        id,
        { secretKey, apiKey }, // Fields to update
        { new: true, runValidators: true } // Return the updated document
      );
  
      if (!updatedCourierApi) {
        return res.status(404).json({ message: 'Courier API not found' });
      }
  
      // Send the updated document as a response
      res.status(200).json({
        message: 'Courier API updated successfully',
        data: updatedCourierApi,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
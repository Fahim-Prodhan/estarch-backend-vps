import CashEntry from '../models/cash.js';

// Create a new cash entry
export const createCashEntry = async (req, res) => {
    console.log('working');

    try {
        const { cashList, total, manager } = req.body;

        // Validate input
        if (!cashList || !total || !manager) {
            return res.status(400).json({ message: 'Cash list, total, and manager are required.' });
        }

        // Create a new CashEntry
        const newCashEntry = new CashEntry({
            cashList,
            total,
            manager,
        });
        console.log(newCashEntry);

        // Save to the database
        await newCashEntry.save();

        res.status(201).json({ message: 'Cash entry added successfully!', cashEntry: newCashEntry });
    } catch (error) {
        console.log(error);
        
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get all cash entries
export const getAllCashEntries = async (req, res) => {
    try {
      // Get query parameters
      const { page = 1, limit = 10, specificDate } = req.query;
  
      // Convert query parameters to numbers
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
  
      // Build the query
      let query = {};
      if (specificDate) {
        // Create a date object from the specific date
        const date = new Date(specificDate);
        // Set the query to match entries created on that specific date
        query.createdAt = {
          $gte: new Date(date.setHours(0, 0, 0, 0)), // Start of the day
          $lt: new Date(date.setHours(23, 59, 59, 999)) // End of the day
        };
      }
  
      // Get total count of entries for pagination
      const totalEntries = await CashEntry.countDocuments(query);
      
      // Fetch the entries with pagination
      const cashEntries = await CashEntry.find(query)
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum)
        .populate('manager') // Optionally populate the manager field if you want
        .exec();
  
      // Return the response
      res.status(200).json({
        total: totalEntries,
        page: pageNum,
        totalPages: Math.ceil(totalEntries / limitNum),
        cashEntries,
      });
    } catch (error) {
      res.status(500).json({ message: 'Server Error', error: error.message });
    }
  };

// Delete a cash entry by ID (optional feature)
export const deleteCashEntry = async (req, res) => {
    try {
        const { id } = req.params;
        await CashEntry.findByIdAndDelete(id);
        res.status(200).json({ message: 'Cash entry deleted successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
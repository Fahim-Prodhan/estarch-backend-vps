import Salesman from '../models/Salesman.js';

// Get all salesmen
export const getSalesmen = async (req, res) => {
  try {
    const salesmen = await Salesman.find();
    res.status(200).json(salesmen);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a salesman
export const createSalesman = async (req, res) => {
  try {
    const newSalesman = new Salesman(req.body);
    const saved = await newSalesman.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update salesman by ID
export const updateSalesman = async (req, res) => {
  try {
    const updated = await Salesman.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Salesman not found" });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete salesman by ID
export const deleteSalesman = async (req, res) => {
  try {
    const deleted = await Salesman.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Salesman not found" });
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const getTop3AndTotals = async (req, res) => {
  try {
    // Get top 3 salesmen by sale descending
    const top3Salesmen = await Salesman.find()
      .sort({ sale: -1 })
      .limit(3)
      .select('name phone email sale target');

    // Aggregate total sales and total target
    const totals = await Salesman.aggregate([
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$sale' },
          totalTarget: { $sum: '$target' },
        }
      }
    ]);

    const totalSales = totals.length > 0 ? totals[0].totalSales : 0;
    const totalTarget = totals.length > 0 ? totals[0].totalTarget : 0;

    res.status(200).json({
      top3Salesmen,
      totalSales,
      totalTarget,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

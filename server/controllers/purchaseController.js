import Purchase from '../models/purchase.js'; // Adjust path to where your model is located

// Create a new purchase
export const createPurchase = async (req, res) => {
    try {
        const newPurchase = new Purchase(req.body);
        const savedPurchase = await newPurchase.save();
        res.status(201).json(savedPurchase);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all purchases
export const getAllPurchases = async (req, res) => {
    try {
        const purchases = await Purchase.find().populate('supplier').populate('items.product');
        res.status(200).json(purchases);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single purchase by ID
export const getPurchaseById = async (req, res) => {
    try {
        const purchase = await Purchase.findById(req.params.id).populate('supplier').populate('items.product');
        if (!purchase) {
            return res.status(404).json({ message: 'Purchase not found' });
        }
        res.status(200).json(purchase);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a purchase by ID
export const updatePurchase = async (req, res) => {
    try {
        const updatedPurchase = await Purchase.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('supplier').populate('items.product');
        if (!updatedPurchase) {
            return res.status(404).json({ message: 'Purchase not found' });
        }
        res.status(200).json(updatedPurchase);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a purchase by ID
export const deletePurchase = async (req, res) => {
    try {
        const deletedPurchase = await Purchase.findByIdAndDelete(req.params.id);
        if (!deletedPurchase) {
            return res.status(404).json({ message: 'Purchase not found' });
        }
        res.status(200).json({ message: 'Purchase deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
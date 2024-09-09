import Purchase from '../models/purchase.js'; // Adjust path to where your model is located
import Product from '../models/product.js';
// Create a new purchase
export const createPurchase = async (req, res) => {
    try {
        const { items } = req.body;

        // Loop through each item to update product stock and price
        for (const item of items) {
            // Find the product by ID
            const product = await Product.findById(item.product);
            
            if (!product) {
                return res.status(404).json({ error: `Product not found for ID ${item.product}` });
            }

            // Find the size detail by matching the barcode
            const sizeDetail = product.sizeDetails.find(size => size.barcode === item.barcode);
            
            if (!sizeDetail) {
                return res.status(404).json({ error: `Size detail not found for barcode ${item.barcode}` });
            }

            // Update openingStock and purchasePrice
            sizeDetail.openingStock += item.quantity;
            sizeDetail.purchasePrice = item.purchasePrice;

            // Save the updated product
            await product.save();
        }

        // Create a new purchase after updating products
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
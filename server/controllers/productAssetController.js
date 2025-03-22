import ProductAsset from "../models/productAsset.js";

// Example of creating a new ProductAsset
export const createProductAsset = async (req, res) => {
    const { assetName, quantity, perItemPrice } = req.body;

    // Validation (Example)
    if (!assetName || quantity < 0 || perItemPrice < 0) {
        return res.status(400).json({ message: 'Invalid asset data.' });
    }

    try {
        const newAsset = new ProductAsset({ assetName, quantity, perItemPrice });
        await newAsset.save();
        res.status(201).json(newAsset); // Respond with the created asset
    } catch (error) {
        console.error('Error creating asset:', error);
        res.status(500).json({ message: 'Failed to create asset.' });
    }
};

// Controller to get all product assets
export const getAllProductAssets = async (req, res) => {
    const { name } = req.query; // Assuming the search term is passed as a query parameter

    try {
        let assets;

        // Check if name is provided and apply the regex search accordingly
        if (name) {
            assets = await ProductAsset.find({
                assetName: { $regex: name, $options: 'i' } // Case-insensitive search
            });
        } else {
            // If no name is provided, fetch all assets
            assets = await ProductAsset.find();
        }

        res.status(200).json(assets);
    } catch (error) {
        console.error('Error fetching product assets:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Controller to update a product asset
export const updateProductAsset = async (req, res) => {
    const { id } = req.params;
    const updatedAssetInfo = req.body;

    try {
        // Find the asset by ID and update it
        const updatedAsset = await ProductAsset.findByIdAndUpdate(id, updatedAssetInfo, {
            new: true, // Return the updated document
            runValidators: true, // Ensure validation is applied during update
        });

        if (!updatedAsset) {
            return res.status(404).json({ message: 'Product asset not found' });
        }

        res.status(200).json(updatedAsset); // Send the updated asset as a response
    } catch (error) {
        console.error('Error updating product asset:', error);
        res.status(500).json({ message: 'Error updating product asset' });
    }
};
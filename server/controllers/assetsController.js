import Asset from "../models/Assect.js";


// Example of creating a new ProductAsset
export const createAsset = async (req, res) => {
    const { name, quantity, price } = req.body;

    // Validation (Example)
    if (!name || quantity < 0 || price < 0) {
        return res.status(400).json({ message: 'Invalid asset data.' });
    }

    try {
        const newAsset = new Asset({ name, quantity, price });
        await newAsset.save();
        res.status(201).json(newAsset); // Respond with the created asset
    } catch (error) {
        console.error('Error creating asset:', error);
        res.status(500).json({ message: 'Failed to create asset.' });
    }
};

// Controller to get all product assets
export const getAllAssets = async (req, res) => {
    const { name } = req.query; // Assuming the search term is passed as a query parameter

    try {
        let assets;

        // Check if name is provided and apply the regex search accordingly
        if (name) {
            assets = await Asset.find({
                assetName: { $regex: name, $options: 'i' } // Case-insensitive search
            });
        } else {
            // If no name is provided, fetch all assets
            assets = await Asset.find();
        }

        res.status(200).json(assets);
    } catch (error) {
        console.error('Error fetching product assets:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Controller to update a product asset
export const updateAsset = async (req, res) => {
    const { id } = req.params;
    const updatedAssetInfo = req.body;

    try {
        // Find the asset by ID and update it
        const updatedAsset = await Asset.findByIdAndUpdate(id, updatedAssetInfo, {
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
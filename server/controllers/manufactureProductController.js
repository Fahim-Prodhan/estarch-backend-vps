import ManufactureProduct from "../models/manufactureProduct.js";
import Product from "../models/product.js";
import ProductAsset from "../models/productAsset.js";

export const createManufacture = async (req, res) => {
    const { productId, assets, totalProduct, otherCost, costPerProduct } = req.body;
    // return console.log({productId, assets, totalProduct, otherCost, costPerProduct});
    

    // Validation
    if (!productId || !assets || totalProduct <= 0 || otherCost < 0) {
        return res.status(400).json({ message: 'Invalid manufacturing data.' });
    }

    try {
        // Find the selected product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Validate and check asset availability
        for (const asset of assets) {
            const { assetId, usedQuantity } = asset;

            const productAsset = await ProductAsset.findById(assetId);
            console.log(usedQuantity);
            
            if (!productAsset) {
                return res.status(404).json({ message: `Asset with ID ${assetId} not found` });
            }

            if (productAsset.quantity < usedQuantity) {
                return res.status(400).json({ message: `Not enough ${productAsset.assetName} in stock.` });
            }
        }


        // Check if there are existing manufacture records for this product
        const manufactureRecords = await ManufactureProduct.find({ productId });

        // Determine the version for this manufacturing process
        let version;
        if (manufactureRecords.length > 0) {
            version = manufactureRecords.length + 1;  // If product exists, increment the version
        } else {
            version = 1;  // Otherwise, start with version 1
        }

        // Create a new manufacture record
        const newManufacture = new ManufactureProduct({
            productId,
            assets,
            totalProduct,
            otherCost,
            totalCost: otherCost + (totalProduct * costPerProduct),  // Example cost calculation
            costPerProduct,
            version  // Add the calculated version number here
        });

        // Save the manufacture order
        await newManufacture.save();

        // Update asset quantities
        for (const asset of assets) {
            const { assetId, usedQuantity } = asset;

            await ProductAsset.findByIdAndUpdate(assetId, {
                $inc: { quantity: -usedQuantity }
            });
        }

        // Respond with the created manufacture order
        res.status(201).json({ newManufacture });
    } catch (error) {
        console.error('Error processing purchase:', error);
        res.status(500).json({ message: 'Failed to process manufacturing.' });
    }
};

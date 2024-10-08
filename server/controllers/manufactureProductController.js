import ManufactureProduct from "../models/manufactureProduct.js";
import Product from "../models/product.js";
import ProductAsset from "../models/productAsset.js";

export const createManufacture = async (req, res) => {
    const { productId, assets, totalProduct, otherCost, costPerProduct } = req.body;
  
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
        if (!productAsset) {
          return res.status(404).json({ message: `Asset with ID ${assetId} not found` });
        }
  
        if (productAsset.quantity < usedQuantity) {
          return res.status(400).json({ message: `Not enough ${productAsset.assetName} in stock.` });
        }
      }
  
      // Check if there are existing manufacture records for this product
      const existingManufactureRecord = await ManufactureProduct.findOne({ productId }).sort({ version: -1 });
  
      if (existingManufactureRecord) {
        // Update existing manufacture record
        existingManufactureRecord.assets = assets;
        existingManufactureRecord.totalProduct = totalProduct;
        existingManufactureRecord.otherCost = otherCost;
        existingManufactureRecord.costPerProduct = costPerProduct;
        existingManufactureRecord.totalCost = otherCost + (totalProduct * costPerProduct);
        existingManufactureRecord.version += 1; // Increment the version for the update
  
        // Save the updated manufacture record
        await existingManufactureRecord.save();
      } else {
        // If no existing record, create a new one
        const newManufacture = new ManufactureProduct({
          productId,
          assets,
          totalProduct,
          otherCost,
          totalCost: otherCost + (totalProduct * costPerProduct),  // Example cost calculation
          costPerProduct,
          version: 1  // Start with version 1
        });
  
        // Save the new manufacture order
        await newManufacture.save();
      }
  
      // Update asset quantities
      for (const asset of assets) {
        const { assetId, usedQuantity } = asset;
  
        await ProductAsset.findByIdAndUpdate(assetId, {
          $inc: { quantity: -usedQuantity }
        });
      }
  
      // Respond with the created or updated manufacture order
      res.status(201).json({ message: 'Manufacturing order processed successfully.' });
    } catch (error) {
      console.error('Error processing manufacturing:', error);
      res.status(500).json({ message: 'Failed to process manufacturing.' });
    }
  };
  


export const getAllManufactureProducts = async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const size = parseInt(req.query.size) || 10; // Default page size is 10 items per page
    const SKU = req.query.search || ''; // Search by SKU from query parameters
  
    try {
      let query = {};
  
      // If SKU is provided, fetch matching product IDs from Product collection
      if (SKU) {
        const matchingProducts = await Product.find({ SKU: { $regex: SKU, $options: 'i' } }).select('_id');
        const productIds = matchingProducts.map(product => product._id);
        if (productIds.length > 0) {
          query.productId = { $in: productIds }; // Only include manufacture products with matching product IDs
        } else {
          query.productId = null; // If no products match, set the query to ensure no results are found
        }
      }
  
      // Count total ManufactureProducts that match the query
      const totalProducts = await ManufactureProduct.countDocuments(query);
  
      // Fetch ManufactureProducts with pagination, populate related Product data, and asset data
      const manufactureProducts = await ManufactureProduct.find(query)
        .sort({ _id: -1 }) // Sort by newest first
        .skip((page - 1) * size)
        .limit(size)
        .populate({
          path: 'productId',
          select: 'SKU productName images',
        })
        .populate({
          path: 'assets.assetId', // Assuming assets is an array of objects with assetId
          select: 'assetName quantity perItemPrice',
        });
  
      // Calculate total pages
      const totalPages = Math.ceil(totalProducts / size);
  
      // Send response with the manufacture products and pagination details
      res.status(200).json({
        manufactureProducts,
        totalProducts,
        currentPage: page,
        totalPages,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  

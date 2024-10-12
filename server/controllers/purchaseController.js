import Purchase from '../models/purchase.js'; // Adjust path to where your model is located
import Product from '../models/product.js';
import Supplier from '../models/supplier.js';
import ProductAsset from '../models/productAsset.js'; // Import the ProductAsset model
// Create a new purchase
export const createPurchase = async (req, res) => {
    try {
        const { items, supplier, totalAmount } = req.body;

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
            sizeDetail.ospPrice = item.purchasePrice;

            // Save the updated product
            await product.save();
        }

        // Find the supplier and update purchaseTotal
        const foundSupplier = await Supplier.findById(supplier);
        if (!foundSupplier) {
            return res.status(404).json({ error: `Supplier not found for ID ${supplier}` });
        }

        // Add totalAmount to supplier's purchaseTotal
        foundSupplier.purchaseTotal += totalAmount;

        // Save the updated supplier
        await foundSupplier.save();

        // Create a new purchase after updating products and supplier
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
        const purchases = await Purchase.find().populate('supplier').populate('items.product').populate('items.asset');
        res.status(200).json(purchases);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Create a new purchase with asset items
export const createAssetPurchase = async (req, res) => {
    const {
        supplier,
        invoiceNo,
        purchaseDate,
        reference,
        note,
        items,
        paymentTypes,
        totalAmount,
        totalQuantity,
        due,
        
    } = req.body;

    console.log(req.body);

    try {
        // Create a new purchase instance
        const newPurchase = new Purchase({
            supplier,
            invoiceNo,
            purchaseDate,
            reference,
            note,
            items,
            paymentTypes,
            totalAmount,
            totalQuantity,
            due,
        });

        // Loop through asset items to update their quantities and prices
        for (const assetItem of items) {
            const { asset, quantity, purchasePrice } = assetItem; // Assuming assetId is passed in assetItems

            // Find the asset in the database
            const UpdateAsset = await ProductAsset.findById(asset);
            if (UpdateAsset) {
                // Update asset quantity and purchase price
                UpdateAsset.quantity += quantity; // Add incoming quantity to the existing quantity
                UpdateAsset.perItemPrice = purchasePrice; // Update the per item price (you may want to average it instead)

                // Save the updated asset back to the database
                await UpdateAsset.save();
                
            } else {
                console.error(`Asset with ID ${asset} not found.`);
            }
        }

          // Find the supplier and update purchaseTotal
          const foundSupplier = await Supplier.findById(supplier);
          if (!foundSupplier) {
              return res.status(404).json({ error: `Supplier not found for ID ${supplier}` });
          }
  
          // Add totalAmount to supplier's purchaseTotal
          foundSupplier.purchaseTotal += totalAmount;
  
          // Save the updated supplier
          await foundSupplier.save();

        // Save the purchase to the database
        await newPurchase.save();
        res.status(201).json({ message: 'Purchase created successfully', purchase: newPurchase });
    } catch (error) {
        console.error('Error creating purchase:', error);
        res.status(500).json({ message: 'An error occurred while creating the purchase', error: error.message });
    }
};


// Get a single purchase by ID
export const getPurchaseById = async (req, res) => {
    try {
        const purchase = await Purchase.findById(req.params.id).populate('supplier').populate('items.product').populate('items.asset');
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
        const updatedPurchase = await Purchase.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('supplier').populate('items.product').populate('items.asset');
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
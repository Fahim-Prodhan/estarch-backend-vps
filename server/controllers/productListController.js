import ProductList from '../models/productList.js';

// Get all product lists
export const getProductLists = async (req, res) => {
    try {
        const productLists = await ProductList.find();
        res.status(200).json(productLists);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single product list by ID
export const getProductListById = async (req, res) => {
    try {
        const productList = await ProductList.findById(req.params.id);
        if (!productList) return res.status(404).json({ message: 'Product list not found' });
        res.status(200).json(productList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new product list
export const createProductList = async (req, res) => {
    const { serialId, images, supplier, totalBill, notes } = req.body;
    const newProductList = new ProductList({
        serialId,
        images,
        supplier,
        totalBill,
        notes
    });

    try {
        const savedProductList = await newProductList.save();
        res.status(201).json(savedProductList);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update an existing product list
export const updateProductList = async (req, res) => {
    try {
        const updatedProductList = await ProductList.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProductList) return res.status(404).json({ message: 'Product list not found' });
        res.status(200).json(updatedProductList);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a product list
export const deleteProductList = async (req, res) => {
    try {
        const deletedProductList = await ProductList.findByIdAndDelete(req.params.id);
        if (!deletedProductList) return res.status(404).json({ message: 'Product list not found' });
        res.status(200).json({ message: 'Product list deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

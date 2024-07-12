import Product from "../models/product.js";

// Get all products
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// Get a single product by ID
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        res.json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Create a product
export const createProduct = async (req, res) => {
    const { name, sku, sizes, price, discountedPrice, quantity, images, description, category } = req.body;

    try {
        const newProduct = new Product({
            name,
            sku,
            sizes,
            price,
            discountedPrice,
            quantity,
            images,
            description,
            category,
        });

        const product = await newProduct.save();
        res.json(product);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// Update a product
export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, sku, sizes, price, discountedPrice, quantity, images, description, category } = req.body;

    try {
        let product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        product = await Product.findByIdAndUpdate(
            id,
            { $set: { name, sku, sizes, price, discountedPrice, quantity, images, description, category } },
            { new: true }
        );

        res.json(product);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// Delete a product
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        await product.deleteOne();

        res.json({ msg: 'Product removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get new arrivals
export const getNewArrivals = async (req, res) => {
    try {
        const newArrivals = await Product.find({ isNewArrival: true }).sort({ createdAt: -1 }).limit(10);
        res.json(newArrivals);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get best selling products
export const getBestSelling = async (req, res) => {
    try {
        const bestSelling = await Product.find({ isBestSelling: true }).limit(10);
        res.json(bestSelling);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get products by category
export const getProductsByCategory = async (req, res) => {
    const { category } = req.params;
    try {
        const products = await Product.find({ category });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Set product as new arrival
export const setNewArrival = async (req, res) => {
    const { id } = req.params;
    const { isNewArrival } = req.body;
    try {
        const product = await Product.findByIdAndUpdate(id, { isNewArrival }, { new: true });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Set product as best selling
export const setBestSelling = async (req, res) => {
    const { id } = req.params;
    const { isBestSelling } = req.body;
    try {
        const product = await Product.findByIdAndUpdate(id, { isBestSelling }, { new: true });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

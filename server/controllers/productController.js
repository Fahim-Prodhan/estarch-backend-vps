import Product from "../models/product.js";
// Create a new product
export const createProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    // return console.log(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all products by types

export const getAllProductsByType = async (req, res) => {
  const { type } = req.params;
  const { ranges, categories } = req.query;

  try {
    // Parse the ranges parameter into an array of objects with min and max properties
    let parsedRanges = [];
    if (ranges) {
      parsedRanges = JSON.parse(ranges).map((range) => ({
        min: Number(range.min),
        max: Number(range.max),
      }));
    }

    // Parse the categories parameter into an array of category strings
    let parsedCategories = [];
    if (categories) {
      parsedCategories = JSON.parse(categories);
    }

    // Build the query condition
    let query = { selectedType: type };

    // Add category filter if provided
    if (parsedCategories.length > 0) {
      query.selectedCategoryName = { $in: parsedCategories };
    }

    // If ranges are provided, add the price filtering condition
    if (parsedRanges.length > 0) {
      query = {
        ...query,
        $or: parsedRanges.map((range) => ({
          salePrice: { $gte: range.min, $lte: range.max },
        })),
      };
    }

    // Fetch products based on the type, categories, and price ranges
    const products = await Product.find(query);
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Get a product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a product
export const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a product
export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
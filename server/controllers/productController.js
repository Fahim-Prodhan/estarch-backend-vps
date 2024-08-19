import Product from "../models/product.js";
import Chart from '../models/sizeChart.js';

// Create a new product
export const createProduct = async (req, res) => {
  try {
    console.log(req.body);

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
    const products = await Product.find().sort({_id: -1}).populate('charts');
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
    const products = await Product.find(query).populate('charts');
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// getAllProductsByCategoryId with filter  main one (fahim)(this is deprecated)
export const getAllProductsByCategoryId = async (req, res) => {
  const { id } = req.params;
  const { ranges, subcategories, sizes, sortBy } = req.query;

  try {
    // Parse the ranges parameter into an array of objects with min and max properties
    let parsedRanges = [];
    if (ranges) {
      parsedRanges = JSON.parse(ranges).map((range) => ({
        min: Number(range.min),
        max: Number(range.max),
      }));
    }

    // Parse the subcategories parameter into an array
    let parsedSubcategories = [];
    if (subcategories) {
      parsedSubcategories = JSON.parse(subcategories);
    }

    // Parse the sizes parameter into an array
    let parsedSizes = [];
    if (sizes) {
      parsedSizes = JSON.parse(sizes);
    }

    // Build the query condition
    let query = { selectedCategory: id };
    let andConditions = [];

    // If subcategories are provided, add the subcategory filtering condition
    if (parsedSubcategories.length > 0) {
      andConditions.push({
        selectedSubCategory: { $in: parsedSubcategories },
      });
    }

    // If ranges are provided, add the price filtering condition
    if (parsedRanges.length > 0) {
      andConditions.push({
        $or: parsedRanges.map((range) => ({
          salePrice: { $gte: range.min, $lte: range.max },
        })),
      });
    }

    // If sizes are provided, add the size filtering condition
    if (parsedSizes.length > 0) {
      andConditions.push({
        selectedSizes: { $in: parsedSizes },
      });
    }

    // If there are any conditions, add them to the query
    if (andConditions.length > 0) {
      query = {
        ...query,
        $and: andConditions,
      };
    }

    // Determine the sort order
    let sortOptions = {};
    switch (sortBy) {
      case 'Price High to Low':
        sortOptions = { salePrice: -1 };
        break;
      case 'Price Low to High':
        sortOptions = { salePrice: 1 };
        break;
      case 'Sort by Latest':
        sortOptions = { createdAt: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 }; // Default sorting
        break;
    }

    // Fetch products based on the constructed query and sort order
    const products = await Product.find(query).sort(sortOptions).populate('charts');
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
};



// getAllProductsByCategoryName with filter main one (fahim)
export const getAllProductsByCategoryName = async (req, res) => {
  const { categoryName } = req.params;
  const { ranges, subcategories, sizes, sortBy } = req.query;

  try {
    // Decode the categoryName and trim spaces
    const decodedCategoryName = decodeURIComponent(categoryName).trim();

    // Parse query parameters
    let parsedRanges = [];
    if (ranges) {
      parsedRanges = JSON.parse(ranges).map((range) => ({
        min: Number(range.min),
        max: Number(range.max),
      }));
    }

    let parsedSubcategories = [];
    if (subcategories) {
      parsedSubcategories = JSON.parse(subcategories);
    }

    let parsedSizes = [];
    if (sizes) {
      parsedSizes = JSON.parse(sizes);
    }

    // Build the query condition
    let query = { selectedCategoryName: { $regex: new RegExp(`^${decodedCategoryName}$`, 'i') } };
    let andConditions = [];

    if (parsedSubcategories.length > 0) {
      andConditions.push({
        selectedSubCategory: { $in: parsedSubcategories },
      });
    }

    if (parsedRanges.length > 0) {
      andConditions.push({
        $or: parsedRanges.map((range) => ({
          salePrice: { $gte: range.min, $lte: range.max },
        })),
      });
    }

    if (parsedSizes.length > 0) {
      andConditions.push({
        selectedSizes: { $in: parsedSizes },
      });
    }

    if (andConditions.length > 0) {
      query = {
        ...query,
        $and: andConditions,
      };
    }

    // Determine the sort order
    let sortOptions = {};
    switch (sortBy) {
      case 'Price High to Low':
        sortOptions = { salePrice: -1 };
        break;
      case 'Price Low to High':
        sortOptions = { salePrice: 1 };
        break;
      case 'Sort by Latest':
        sortOptions = { createdAt: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
        break;
    }

    // Fetch products based on the constructed query and sort order
    const products = await Product.find(query).sort(sortOptions).populate('charts');
    console.log('Products:', products);
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
};



// get all the products of new arrival(fahim)
export const getAllNewArrivalProduct = async (req, res) => {
  const { ranges, subcategories, sizes, sortBy } = req.query;

  try {
    // Parse the ranges parameter into an array of objects with min and max properties
    let parsedRanges = [];
    if (ranges) {
      parsedRanges = JSON.parse(ranges).map((range) => ({
        min: Number(range.min),
        max: Number(range.max),
      }));
    }

    // Parse the subcategories parameter into an array
    let parsedSubcategories = [];
    if (subcategories) {
      parsedSubcategories = JSON.parse(subcategories);
    }

    // Parse the sizes parameter into an array
    let parsedSizes = [];
    if (sizes) {
      parsedSizes = JSON.parse(sizes);
    }

    // Build the query condition
    let query = {};
    let andConditions = [];

    // If subcategories are provided, add the subcategory filtering condition
    if (parsedSubcategories.length > 0) {
      andConditions.push({
        selectedSubCategory: { $in: parsedSubcategories },
      });
    }

    // If ranges are provided, add the price filtering condition
    if (parsedRanges.length > 0) {
      andConditions.push({
        $or: parsedRanges.map((range) => ({
          salePrice: { $gte: range.min, $lte: range.max },
        })),
      });
    }

    // If sizes are provided, add the size filtering condition
    if (parsedSizes.length > 0) {
      andConditions.push({
        selectedSizes: { $in: parsedSizes },
      });
    }

    // If there are any conditions, add them to the query
    if (andConditions.length > 0) {
      query = {
        ...query,
        $and: andConditions,
      };
    }

    // Determine the sort order
    let sortOptions = {};
    switch (sortBy) {
      case 'Price High to Low':
        sortOptions = { salePrice: -1 };
        break;
      case 'Price Low to High':
        sortOptions = { salePrice: 1 };
        break;
      case 'Sort by Latest':
        sortOptions = { createdAt: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 }; // Default sorting
        break;
    }

    // Fetch products based on the constructed query and sort order
    const products = await Product.find(query).sort(sortOptions).populate('charts');
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// get all the feature product
export const getAllFeatureProduct = async (req, res) => {
  const { ranges, subcategories, sizes, sortBy } = req.query;

  try {
    // Parse the ranges parameter into an array of objects with min and max properties
    let parsedRanges = [];
    if (ranges) {
      parsedRanges = JSON.parse(ranges).map((range) => ({
        min: Number(range.min),
        max: Number(range.max),
      }));
    }

    // Parse the subcategories parameter into an array
    let parsedSubcategories = [];
    if (subcategories) {
      parsedSubcategories = JSON.parse(subcategories);
    }

    // Parse the sizes parameter into an array
    let parsedSizes = [];
    if (sizes) {
      parsedSizes = JSON.parse(sizes);
    }

    // Build the query condition
    let query = { featureProduct: true }; // Only fetch products where featureProduct is true
    let andConditions = [];

    // If subcategories are provided, add the subcategory filtering condition
    if (parsedSubcategories.length > 0) {
      andConditions.push({
        selectedSubCategory: { $in: parsedSubcategories },
      });
    }

    // If ranges are provided, add the price filtering condition
    if (parsedRanges.length > 0) {
      andConditions.push({
        $or: parsedRanges.map((range) => ({
          salePrice: { $gte: range.min, $lte: range.max },
        })),
      });
    }

    // If sizes are provided, add the size filtering condition
    if (parsedSizes.length > 0) {
      andConditions.push({
        selectedSizes: { $in: parsedSizes },
      });
    }

    // If there are any conditions, add them to the query
    if (andConditions.length > 0) {
      query = {
        ...query,
        $and: andConditions,
      };
    }

    // Determine the sort order
    let sortOptions = {};
    switch (sortBy) {
      case 'Price High to Low':
        sortOptions = { salePrice: -1 };
        break;
      case 'Price Low to High':
        sortOptions = { salePrice: 1 };
        break;
      case 'Sort by Latest':
        sortOptions = { createdAt: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 }; // Default sorting
        break;
    }

    // Fetch products based on the constructed query and sort order
    const products = await Product.find(query).sort(sortOptions).populate('charts');
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
};




// get new arrival (fahim)
export const getNewArrival = async (req, res) => {
  try {
    // Fetch the latest 10 products sorted by the createdAt field in descending order
    const latestProducts = await Product.find().populate('charts')
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .limit(10); // Limit to 10 products

    res.json(latestProducts);
  } catch (err) {
    console.error("Error fetching latest products:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// get featured product (fahim)
export const getFeaturedProducts = async (req, res) => {
  try {
    // Fetch the latest 10 featured products sorted by the createdAt field in descending order
    const latestFeaturedProducts = await Product.find({ featureProduct: true }) // Filter for featured products
      .sort({ createdAt: -1 }).populate('charts') // Sort by createdAt in descending order

    res.json(latestFeaturedProducts);
  } catch (err) {
    console.error("Error fetching latest featured products:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// (this is deprecated)
 export const getProductById = async (req, res) => {
  // console.log(`Fetching product with ID: ${req.params.id}`); // Log the ID
  try {
    const product = await Product.findById(req.params.id)
      .populate('charts')
      .populate('relatedProducts.product'); // Populate related products
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error(error); // Log the error
    res.status(500).json({ message: error.message });
  }
};

// get single product by productName (Fahim)
export const getProductByName = async (req, res) => {
  const { productName } = req.params;

  try {
    // Decode and trim productName
    const decodedProductName = decodeURIComponent(productName).trim();

    // Query for the product by name
    const product = await Product.findOne({ productName: decodedProductName })
      .populate('charts')
      .populate('relatedProducts.product'); // Populate related products

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(error); // Log the error
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


// pos 

export const getProductsForPos = async (req, res) => {
  try {
    const { brand, category, subcategory, search } = req.query;
    console.log(brand, category, subcategory, search);

    // Build the query object
    let query = {};

    if (brand) {
      query.selectedBrand = brand;
    }

    if (category) {
      query.selectedCategoryName = category;
    }

    if (subcategory) {
      query.selectedSubCategory = subcategory;
    }

    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { SKU: { $regex: search, $options: 'i' } }
      ];
    }

    // Aggregate the products with total stock
    const productsWithTotalStock = await Product.aggregate([
      { $match: query },
      {
        $addFields: {
          totalStock: {
            $sum: "$sizeDetails.openingStock"
          }
        }
      }
    ]);

    res.status(200).json(productsWithTotalStock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const generateSku = async (req, res) => {
  try {
    const baseSku = 'EST'; // Base part of the SKU

    // Get the total number of products in the database
    const productCount = await Product.countDocuments();

    // Start the SKU number from 0000 + productCount
    let skuNumber = productCount + 1;

    let sku;

    while (true) {
      sku = `${baseSku}${skuNumber.toString().padStart(4, '0')}`; // Generate SKU like EST0001, EST0002, etc.
      const existingProduct = await Product.findOne({ SKU: sku });

      if (!existingProduct) {
        // If no product is found with the generated SKU, break the loop
        break;
      }

      // If a product is found, increment the SKU number and try again
      skuNumber++;
    }

    // Return the generated SKU
    res.status(200).json({ sku });
  } catch (error) {
    console.error('Error generating SKU:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



export const updateProductSerials = async (req, res) => {
  const { serialUpdates } = req.body;
  try {
    const updatePromises = serialUpdates.map(({ productId, serialNo }) => {
      return Product.findByIdAndUpdate(productId, { serialNo }, { new: true });
    });

    const updatedProducts = await Promise.all(updatePromises);
    res.json({ message: 'Serial numbers updated successfully', updatedProducts });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: 'Error updating serial numbers', error });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ serialNo: { $gt: 0 } }).sort({ serialNo: 1 });
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
};

export const searchProductListsByName = async (req, res) => {
  const { productName } = req.query;

  if (!productName) {
    return res.status(400).json({ message: 'Product name query parameter is required' });
  }

  try {
    // Using a case-insensitive search
    const productLists = await Product.find({
      productName: { $regex: productName, $options: 'i' }
    });

    if (productLists.length === 0) {
      return res.status(404).json({ message: 'No product lists found with the specified name' });
    }

    res.status(200).json(productLists);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const toggleSizeAvailability = async (req, res) => {
  const { productId, sizeDetailId } = req.body;

  if (!productId || !sizeDetailId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    // Find the product and the sizeDetails item
    const product = await Product.findOne({ _id: productId, 'sizeDetails._id': sizeDetailId });

    if (!product) {
      return res.status(404).json({ message: 'Product or size detail not found' });
    }

    // Find the specific sizeDetails item
    const sizeDetail = product.sizeDetails.id(sizeDetailId);

    if (!sizeDetail) {
      return res.status(404).json({ message: 'Size detail not found' });
    }

    // Toggle the availability
    sizeDetail.available = !sizeDetail.available;

    // Save the updated product
    await product.save();

    res.status(200).json({ message: 'Size availability toggled successfully', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const toggleBooleanField = async (req, res) => {
  const { productId, fieldName } = req.params;

  // List of allowed fields to toggle
  const allowedFields = ['showSize', 'freeDelivery', 'featureProduct', 'productStatus', 'posSuggestion'];

  if (!allowedFields.includes(fieldName)) {
      return res.status(400).json({ message: 'Invalid field name' });
  }

  try {
      // Find the product by ID
      const product = await Product.findById(productId);

      if (!product) {
          return res.status(404).json({ message: 'Product not found' });
      }

      // Toggle the value of the specified field
      product[fieldName] = !product[fieldName];

      // Save the updated product
      await product.save();

      return res.status(200).json({ message: `${fieldName} updated successfully`, product });
  } catch (error) {
      return res.status(500).json({ message: 'Server error', error });
  }
};
import Product from "../models/product.js";
import SubCategory from '../models/subCategory.js';
import Order from '../models/order.js';

// Create a new product
export const createProduct = async (req, res) => {
  try {

    const newProduct = new Product(req.body);
    // return console.log(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);

  }
};

// Get all products (admin)
export const getAllProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const size = parseInt(req.query.size) || 10;
  const text = req.query.search || '';
  const category = req.query.category || '';
  const subcategory = req.query.subcategory || '';
  const brand = req.query.brand || '';



  try {
    // Base query to match SKU with search text
    let query = { SKU: { $regex: text, $options: "i" } };

    // Extend query to match category, subcategory, and brand
    if (category) {
      query.selectedCategoryName = category;
    }
    if (subcategory) {
      query.selectedSubCategory = subcategory;
    }
    if (brand) {
      query.selectedBrand = brand;
    }

    // Count total products matching the query
    const totalProducts = await Product.countDocuments(query);

    // Fetch the products with pagination and populate 'charts'
    const products = await Product.find(query)
      .sort({ _id: -1 })
      .skip((page - 1) * size)
      .limit(size)
      .populate('charts');

    // Calculate total pages
    const totalPages = Math.ceil(totalProducts / size);

    // Send response with products, pagination info, and total count
    res.status(200).json({ products, totalProducts, currentPage: parseInt(page), totalPages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// for serial
export const getAllStatusOnProduct = async (req, res) => {
  try {
    const products = await Product.find({ productStatus: true }).sort({ serialNo: 1 }).populate('charts');
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

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
    let query = { selectedType: type, productStatus: true };

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
  // const { ranges, subcategories, sizes, sortBy } = req.query;
  const { ranges, subcategories, sizes, sortBy, page = 1, limit = 8 } = req.query;
  let limitForProduct = page * limit;

  try {
    // Decode the categoryName and trim spaces
    const decodedCategoryName = decodeURIComponent(categoryName).trim();
    // console.log(categoryName);


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
    let query = {
      selectedCategoryName: { $regex: new RegExp(`^${decodedCategoryName}$`, 'i') },
      // serialNo: { $gt: 0 },
      catSerialNo: { $gt: 0 },
      productStatus: true,
    };
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
      case 'Sort by Serial':
        sortOptions = { catSerialNo: 1 }; // Sorting by serial number in ascending order
        break;
      default:
        sortOptions = { catSerialNo: 1 }; // Default sorting
        break;
    }

    // Fetch products based on the constructed query and sort order
    const products = await Product.find(query)
    .sort(sortOptions)
    .limit(Number(limitForProduct))
    .populate('charts');
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// getAllProductsByCategoryNameApp no with filter main one (fahim) (no scroll loading)
export const getAllProductsByCategoryNameApp = async (req, res) => {
  const { categoryName } = req.params;
  // const { ranges, subcategories, sizes, sortBy } = req.query;
  // const { ranges, subcategories, sizes, sortBy, page = 1, limit = 8 } = req.query;

  try {
    // Decode the categoryName and trim spaces
    const decodedCategoryName = decodeURIComponent(categoryName).trim();
    // console.log(categoryName);

   // Build the query condition
   let query = {
    selectedCategoryName: { $regex: new RegExp(`^${decodedCategoryName}$`, 'i') },
    // serialNo: { $gt: 0 },
    catSerialNo: { $gt: 0 },
    productStatus: true,
  };
    const products = await Product.find(query)
    .populate('charts');
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// getAllProductsByCategoryName with filter main one (fahim)
export const getAllProductsByCategoryNameHome = async (req, res) => {
  const { categoryName } = req.params;

  try {
    // Decode the categoryName and trim spaces
    const decodedCategoryName = decodeURIComponent(categoryName).trim();
   
    let query = {
      selectedCategoryName: { $regex: new RegExp(`^${decodedCategoryName}$`, 'i') },
      // serialNo: { $gt: 0 },
      catSerialNo: { $gt: 0 },
      productStatus: true,
    };
  
    // Fetch products based on the constructed query and sort order
    const products = await Product.find(query)
    .limit(12)
    .populate('charts');
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// getAllProductsByCategoryNameStatusOn for serial in admin (fahim)
export const getAllProductsByCategoryNameStatusOn = async (req, res) => {
  const { categoryName } = req.params;

  try {
    // Decode the categoryName and trim spaces
    const decodedCategoryName = decodeURIComponent(categoryName).trim();

    // Build the query condition
    let query = { selectedCategoryName: { $regex: new RegExp(`^${decodedCategoryName}$`, 'i') }, productStatus: true };

    // Fetch products based on the constructed query and sort order
    const products = await Product.find(query).sort({ catSerialNo: 1 }).populate('charts');
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// get Product By subcategoryName
export const getAllProductsBySubcategoryNameHome = async (req, res) => {
  const { subcategoryName } = req.params; // Assuming you're passing the subcategory as a query parameter
  const decodedSubCategoryName = decodeURIComponent(subcategoryName).trim();

  try {
    const products = await Product.find({ selectedSubCategory: decodedSubCategoryName, SubcatSerialNo: { $gt: 0 } }).limit(12);
    const subcategory = await SubCategory.findOne({ name: subcategoryName }).populate('category')
    console.log(products);
    
    res.status(200).json({ products, subcategory });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
}

// getAllProductsByCategoryName with filter main one (fahim)
export const getAllProductsBySubcategoryName = async (req, res) => {
  const { subcategoryName } = req.params;
  const { ranges, sizes, sortBy } = req.query;



  try {
    // Decode the categoryName and trim spaces
    const decodedSubCategoryName = decodeURIComponent(subcategoryName).trim();
    console.log(decodedSubCategoryName);


    // Parse query parameters
    let parsedRanges = [];
    if (ranges) {
      parsedRanges = JSON.parse(ranges).map((range) => ({
        min: Number(range.min),
        max: Number(range.max),
      }));
    }


    let parsedSizes = [];
    if (sizes) {
      parsedSizes = JSON.parse(sizes);
    }

    // Build the query condition
    let query = {
      selectedSubCategory: { $regex: new RegExp(`^${decodedSubCategoryName}$`, 'i') },
      // serialNo: { $gt: 0 },
      SubcatSerialNo: { $gt: 0 },
      productStatus: true,
      productStatus: true,
    };

    let andConditions = [];

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
      case 'Sort by Serial':
        sortOptions = { catSerialNo: 1 }; // Sorting by serial number in ascending order
        break;
      default:
        sortOptions = { catSerialNo: 1 }; // Default sorting
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

// for serial admin site
export const getAllProductsBySubcategoryNameStatusOn = async (req, res) => {
  const { subcategoryName } = req.params; // Assuming you're passing the subcategory as a query parameter

  try {
    const products = await Product.find({ selectedSubCategory: subcategoryName, productStatus: true }).sort({ SubcatSerialNo: 1 });

    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
}



// get all the products of new arrival(fahim)
export const getAllNewArrivalProduct = async (req, res) => {
  const { ranges, subcategories, sizes, sortBy, page = 1, limit = 8 } = req.query;
  let limitForProduct = page * limit;
  try {
    // Parse the ranges, subcategories, and sizes parameters (same as before)
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

    // Build the query condition (same as before)
    let query = { serialNo: { $gt: 0 } };
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

    // Determine the sort order (same as before)
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
      case 'Sort by Serial':
        sortOptions = { serialNo: 1 };
        break;
      default:
        sortOptions = { serialNo: 1 };
        break;
    }

    // Fetch products with pagination
    const products = await Product.find(query)
      .sort(sortOptions)
      .limit(Number(limitForProduct))
      .populate('charts');
    res.json({
      products
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const getHomePageNewArrival = async (req, res) => {
  try {
    const newArrival = await Product.find({ serialNo: { $gt: 0 } }).sort({ serialNo: 1 }).limit(10)
    res.send(newArrival)
  } catch (error) {
    res.send(error)
  }
}


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
    let query = { featureProduct: true, serialNo: { $gt: 0 } }; // Only fetch products where featureProduct is true
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
      case 'Sort by Serial':
        sortOptions = { serialNo: 1 }; // Sorting by serial number in ascending order
        break;
      default:
        sortOptions = { serialNo: 1 }; // Default sorting
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
    const latestProducts = await Product.find({ serialNo: { $gt: 0 } }).populate('charts')
      .sort({ serialNo: 1 }) // Sort by createdAt in descending order
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
    const latestFeaturedProducts = await Product.find({ featureProduct: true, serialNo: { $gt: 0 } }) // Filter for featured products
      .sort({ serialNo: 1 }).populate('charts').limit(10) // Sort by createdAt in descending order

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
  const { sku } = req.params
console.log(sku);

  try {
    // Decode and trim productName
    const decodedProductName = decodeURIComponent(productName).trim();

    // Query for the product by name
    const product = await Product.findOne({ SKU: sku })
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

    // if (search) {
    //   query.$or = [
    //     { productName: { $regex: search, $options: 'i' } },
    //     { SKU: { $regex: search, $options: 'i' } }
    //   ];
    // }

    if (search) {
      query.$or = [
        { SKU: { $regex: `^${search}$`, $options: 'i' } }, // Exact match
        { SKU: { $regex: `${search}$`, $options: 'i' } }  // Ends with search term
      ];
    }
    

    // Aggregate the products with total stock and randomly select 8
    const productsWithTotalStock = await Product.aggregate([
      { $match: query },
      {
        $addFields: {
          totalStock: {
            $sum: "$sizeDetails.openingStock"
          }
        }
      },
      { $sample: { size: 8 } } // Randomly pick 8 products
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

export const updateProductCategorySerials = async (req, res) => {
  const { serialUpdates } = req.body;
  try {
    const updatePromises = serialUpdates.map(({ productId, catSerialNo }) => {
      return Product.findByIdAndUpdate(productId, { catSerialNo }, { new: true });
    });

    const updatedProducts = await Promise.all(updatePromises);
    res.json({ message: 'Serial numbers updated successfully', updatedProducts });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: 'Error updating serial numbers', error });
  }
};

export const updateProductSubcategorySerials = async (req, res) => {
  const { serialUpdates } = req.body;
  try {
    const updatePromises = serialUpdates.map(({ productId, SubcatSerialNo }) => {
      return Product.findByIdAndUpdate(productId, { SubcatSerialNo }, { new: true });
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
      productName: { $regex: productName, $options: 'i' }, productStatus: true
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
  const allowedFields = ['showSize', 'freeDelevary', 'featureProduct', 'productStatus', 'posSuggestion'];

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

    // Check if the field is 'productStatus' and update 'serialNo' accordingly
    if (fieldName === 'productStatus') {
      product.serialNo = 0;
    }

    // Save the updated product
    await product.save();

    return res.status(200).json({ message: `${fieldName} updated successfully`, product });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server error', error });
  }
};


//barcode seearching
export const searchProductByBarcode = async (req, res) => {
  const { barcode } = req.params;

  try {
    // Search for the product in the database by barcode within sizeDetails array
    const product = await Product.findOne(
      { 'sizeDetails.barcode': barcode },
      {
        'sizeDetails.$': 1, // Include only the matching size detail
        productName: 1,
        showSize: 1,
        freeDelevary: 1,
        featureProduct: 1,
        productStatus: 1,
        posSuggestion: 1,
        images: 1,
        videoUrl: 1,
        content: 1,
        guideContent: 1,
        selectedCategoryName: 1,
        selectedSubCategory: 1,
        selectedCategory: 1,
        selectedBrand: 1,
        selectedType: 1,
        discount: 1,
        regularPrice: 1,
        salePrice: 1,
        SKU: 1,
        charts: 1,
        serialNo: 1,
        relatedProducts: 1,
        // Add any other fields you want to include
      }
    );

    if (product) {
      return res.status(200).json(product);
    } else {
      return res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error fetching product:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProductByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;

    // Find the product that contains the specified barcode in any of its sizeDetails
    const product = await Product.findOne({ 'sizeDetails.barcode': barcode });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find the specific size detail with the given barcode
    const sizeDetail = product.sizeDetails.find(detail => detail.barcode === barcode);

    // Construct the response
    const response = {
      size: sizeDetail.size,
      productId: product,
      price: sizeDetail.salePrice,
      quantity: 1,
      title: product.productName,
      discountAmount: sizeDetail.discountAmount
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const updatePurchasePriceToRatio = async (req, res) => {
  try {
    // Find all products that have sizeDetails with purchasePrice field
    const products = await Product.find({ "sizeDetails.purchasePrice": { $exists: true } });

    // Update each product by renaming purchasePrice to ratio
    for (let product of products) {
      product.sizeDetails = product.sizeDetails.map(detail => {
        return {
          ...detail,
          ratio: detail.purchasePrice, // Assign purchasePrice value to ratio
          purchasePrice: undefined // Remove purchasePrice
        };
      });

      await product.save(); // Save the updated product
    }

    res.status(200).json({ message: 'Products updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating products', error });
  }
};



export const getProductByBarcodeForPos = async (req, res) => {
  try {
    const { barcode } = req.params;
    const product = await Product.findOne({ "sizeDetails.barcode": barcode }).lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const sizeDetail = product.sizeDetails.find(detail => detail.barcode === barcode);

    if (!sizeDetail) {
      return res.status(404).json({ message: "Size details not found" });
    }
    const response = {
      SKU: product.SKU,
      afterDiscount: sizeDetail.salePrice || 0,
      barcode: sizeDetail.barcode,
      discount: product.discount,
      discountAmount: sizeDetail.discountAmount,
      discountPercent: sizeDetail.discountPercent,
      images: product.images,
      openingStock: sizeDetail.openingStock,
      ospPrice: sizeDetail.ospPrice,
      productName: product.productName,
      quantity: 1,
      regularPrice: sizeDetail.regularPrice,
      salePrice: sizeDetail.salePrice,
      serialNo: product.serialNo,
      size: sizeDetail.size,
      sizeDetails: product.sizeDetails,
      totalStock: product.sizeDetails.reduce((total, detail) => total + detail.openingStock, 0),
      wholesalePrice: sizeDetail.wholesalePrice,
      _id: product._id,
      productId: product._id
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};


export const getBestSellingProducts = async (req, res) => {
  try {
    // Aggregate the order data to calculate total quantity sold for each product
    const bestSellingProducts = await Order.aggregate([
      { $unwind: '$cartItems' }, // Deconstruct the cartItems array
      {
        $group: {
          _id: '$cartItems.productId', // Group by productId
          totalQuantitySold: { $sum: '$cartItems.quantity' }, // Sum the quantities sold
        },
      },
      { $sort: { totalQuantitySold: -1 } }, // Sort by totalQuantitySold in descending order
      { $limit: 10 }, // Limit the results to top 10 best-selling products
    ]);

    // Populate product details
    const products = await Product.find({
      _id: { $in: bestSellingProducts.map(p => p._id) }
    });

    // Merge product details with the quantity sold data, and filter out products with serialNo < 1
    const result = bestSellingProducts
      .map(salesData => {
        const product = products.find(p => p._id.toString() === salesData._id.toString());
        if (product && product.serialNo >= 1) {
          return {
            ...product._doc,  // Spread product details if product is found and serialNo >= 1
            totalQuantitySold: salesData.totalQuantitySold // Add totalQuantitySold
          };
        }
        return null;  // Return null if product not found or serialNo < 1
      })
      .filter(item => item !== null); // Filter out null values

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching best-selling products:', error); // Log the error to the console
    res.status(500).json({
      message: 'Failed to fetch best-selling products',
      error: error.message || error
    });
  }
};




// Controller function to calculate the total stock and other prices for all products
export const calculateTotalStockAndPrices = async (req, res) => {
  try {
    // Fetch all products from the database
    const products = await Product.find();

    // Initialize variables to hold the total stock and prices
    let totalStock = 0;
    let totalPurchasePrice = 0;
    let totalRegularPrice = 0;
    let totalSalePrice = 0;
    let totalWholesalePrice = 0;
    let totalOspPrice = 0;

    // Loop through each product and calculate totals
    products.forEach((product) => {
      // Sum up stock and prices for each product's sizeDetails
      product.sizeDetails.forEach((sizeDetail) => {
        const stock = sizeDetail.openingStock || 0;
        totalStock += stock;

        // Multiply each price by its corresponding openingStock
        totalRegularPrice += (sizeDetail.regularPrice || 0) * stock;
        totalSalePrice += (sizeDetail.salePrice || 0) * stock;
        totalWholesalePrice += (sizeDetail.wholesalePrice || 0) * stock;
        totalOspPrice += (sizeDetail.ospPrice || 0) * stock;
        totalPurchasePrice += (sizeDetail.purchasePrice || 0) * stock;
      });
    });

    // Send the totals as a response
    res.status(200).json({
      totalStock,
      totalRegularPrice,
      totalSalePrice,
      totalWholesalePrice,
      totalOspPrice,
      totalPurchasePrice
    });
  } catch (error) {
    // Handle any errors
    console.error("Error calculating total stock and prices:", error);
    res.status(500).json({
      success: false,
      message: "Failed to calculate total stock and prices",
      error: error.message,
    });
  }
};


// export const getProductForSearch = async (req, res) => {
//   try {
//     // Find products where serialNo, catSerialNo, or SubcatSerialNo are greater than 0
//     const products = await Product.find({
//       $or: [
//         { serialNo: { $gt: 0 } },
//         { catSerialNo: { $gt: 0 } },
//         { SubcatSerialNo: { $gt: 0 } }
//       ]
//     });

//     // Check if products are found
//     if (products.length === 0) {
//       return res.status(404).json({ message: 'No products found with serial numbers greater than 0' });
//     }

//     // Send the products back as response
//     res.status(200).json(products);
//   } catch (error) {
//     // Handle errors
//     console.error('Error fetching products:', error);
//     res.status(500).json({ message: 'Server error. Please try again later.' });
//   }
// };

export const getProductForSearch = async (req, res) => {
  try {
    // Find products that have serial numbers > 0 and productStatus is true
    const products = await Product.find({
      productStatus: true,
      $or: [
        { serialNo: { $gt: 0 } },
        { catSerialNo: { $gt: 0 } },
        { SubcatSerialNo: { $gt: 0 } }
      ]
    });

    // Check if products are found
    if (products.length === 0) {
      return res.status(404).json({ message: "No active products found with serial numbers greater than 0" });
    }

    // Send the products back as response
    res.status(200).json(products);
  } catch (error) {
    // Handle errors
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

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


// getAllProductsByCategoryId with filter 
// export const getAllProductsByCategoryId = async (req, res) => {
//   const { id } = req.params;
//   const { ranges, subcategories } = req.query;

//   console.log("range", ranges);
//   console.log("categories", subcategories);

//   try {
//     // Parse the ranges parameter into an array of objects with min and max properties
//     let parsedRanges = [];
//     if (ranges) {
//       parsedRanges = JSON.parse(ranges).map((range) => ({
//         min: Number(range.min),
//         max: Number(range.max),
//       }));
//     }

//     // Parse the subcategories parameter into an array
//     let parsedSubcategories = [];
//     if (subcategories) {
//       parsedSubcategories = JSON.parse(subcategories);
//     }

//     // Build the query condition
//     let query = { selectedCategory: id };

//     // If subcategories are provided, add the subcategory filtering condition
//     if (parsedSubcategories.length > 0) {
//       query.selectedSubCategory = { $in: parsedSubcategories };
//     }

//         // If ranges are provided, add the price filtering condition
//         if (parsedRanges.length > 0) {
//           query = {
//             ...query,
//             $or: parsedRanges.map((range) => ({
//               salePrice: { $gte: range.min, $lte: range.max },
//             })),
//           };
//         }


//     // Fetch products based on the category, subcategories, and price ranges
//     const products = await Product.find(query);
//     res.json(products);
//   } catch (err) {
//     console.error("Error fetching products:", err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// export const getAllProductsByCategoryId = async (req, res) => {
//   const { id } = req.params;
//   const { ranges, subcategories, sizes } = req.query;

//   console.log("range", ranges);
//   console.log("categories", subcategories);
//   console.log("sizes", sizes);

//   try {
//     // Parse the ranges parameter into an array of objects with min and max properties
//     let parsedRanges = [];
//     if (ranges) {
//       parsedRanges = JSON.parse(ranges).map((range) => ({
//         min: Number(range.min),
//         max: Number(range.max),
//       }));
//     }

//     // Parse the subcategories parameter into an array
//     let parsedSubcategories = [];
//     if (subcategories) {
//       parsedSubcategories = JSON.parse(subcategories);
//     }

//     // Parse the sizes parameter into an array
//     let parsedSizes = [];
//     if (sizes) {
//       parsedSizes = JSON.parse(sizes);
//     }

//     // Build the query condition
//     let query = { selectedCategory: id };

//     // If subcategories are provided, add the subcategory filtering condition
//     if (parsedSubcategories.length > 0) {
//       query.selectedSubCategory = { $in: parsedSubcategories };
//     }

//     // If ranges are provided, add the price filtering condition
//     if (parsedRanges.length > 0) {
//       query = {
//         ...query,
//         $or: parsedRanges.map((range) => ({
//           salePrice: { $gte: range.min, $lte: range.max },
//         })),
//       };
//     }

//     // If sizes are provided, add the size filtering condition with $or
//     if (parsedSizes.length > 0) {
//       query = {
//         ...query,
//         $or: [
//           ...(query.$or || []),
//           { selectedSizes: { $in: parsedSizes } }
//         ]
//       };
//     }

//     // Fetch products based on the category, subcategories, price ranges, and sizes
//     const products = await Product.find(query);
//     res.json(products);
//   } catch (err) {
//     console.error("Error fetching products:", err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// getAllProductsByCategoryId with filter  main one (fahim)
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
    const products = await Product.find(query).sort(sortOptions);
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
    const latestProducts = await Product.find()
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
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order

    res.json(latestFeaturedProducts);
  } catch (err) {
    console.error("Error fetching latest featured products:", err);
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
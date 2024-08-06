import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  productName: { type: String, default: "Product Name" },
  showSize: { type: Boolean, default: false },
  freeDelevary: { type: Boolean, default: false },
  featureProduct: { type: Boolean, default: false },
  productStatus: { type: Boolean, default: false },
  posSuggestion: { type: Boolean, default: false },
  images: [String], 
  videoUrl: { type: String, default: '' },
  content: { type: String, default: '' },
  guideContent: { type: String, default: '' },
  selectedCategoryName: { type: String, default: '' },
  selectedSubCategory: { type: String, default: '' },
  selectedCategory: { type: String, default: '' },
  selectedBrand: { type: String, default: '' },
  selectedType: { type: String, default: '' },
  discount: {
    type: { type: String, enum: ['Flat', 'Percentage'], default: 'Flat' },
    amount: { type: Number, default: 0 }
  },
  regularPrice: { type: Number, default: 0 },
  salePrice: { type: Number, default: 0 },
  selectedSizes: [String], 
  sizeDetails: [{
    size: String,
    barcode: String,
    purchasePrice: Number,
    sellingPrice: Number,
    discountPercent: Number,
    discountAmount: Number,
    afterDiscount: Number,
    wholesalePrice: Number,
    openingStock: Number,
    ospPrice: Number
  }]
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

export default Product;

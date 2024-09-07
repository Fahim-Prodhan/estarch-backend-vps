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
  SKU: { type: String, default: 'EST0001' },
  sizeDetails: [{
    size: String,
    available: {type:Boolean , default: true},
    barcode: String,
    ratio: Number,
    regularPrice: Number,
    discountPercent: Number,
    discountAmount: Number,
    salePrice: Number,
    wholesalePrice: Number,
    openingStock: Number,
    ospPrice: Number
  }],
  charts: { type: mongoose.Schema.Types.ObjectId, ref: 'Chart' },
  serialNo: { type: Number, default: 0 },
  catSerialNo: { type: Number, default: 0 },
  SubcatSerialNo: { type: Number, default: 0 },
  relatedProducts: [{ 
    name : String ,
    SKU:String,
    product:{type: mongoose.Schema.Types.ObjectId, ref: 'Product'}
   }]  
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

export default Product;

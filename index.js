import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './server/DB/databaseConfigs.js';
import productRoutes from './server/routes/productRoutes.js';
import attributeRoutes from './server/routes/attributeRoutes.js';
// import attributeListRoutes from './server/routes/attributeListRoutes.js';
import userRoutes from './server/routes/userRoutes.js';
import categoryRoutes from './server/routes/categoryRoutes.js';
import supplierRoutes from './server/routes/supplierRoutes.js';
import expenseRoutes from './server/routes/expenseRoutes.js';
import attributeValueRoutes from './server/routes/attributeValueRoutes.js';
import promoCodeRoutes from './server/routes/promoCodeRoutes.js';
import carosulRoutes from './server/routes/carosulRoutes.js';
// import productListRoutes from './routes/productListRoutes.js';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { fileURLToPath } from 'url';
import uploader from './server/middleware/uploader.js';
import { uploadSingle } from './server/middleware/uploadSingle.js';
import bodyParser from 'body-parser';
import authRoutes from './server/routes/authRoutes.js';
import otpRoutes from './server/routes/otpRoutes.js';
import userRoutes from './server/routes/userRoutes.js';
dotenv.config();


cloudinary.config({ 
  cloud_name: 'dhn94c9k5', 
  api_key: '191656742611749', 
  api_secret: 'BEYlGBUvUbNm4sISIRNLOLd2ixU'
});

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); 
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Derive __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/attributes', attributeRoutes);
// app.use('/api/attribute-values', attributeValueRoutes);
app.use('/api/promo-codes', promoCodeRoutes);
app.use('/api/carosul', carosulRoutes);
// app.use('/api/productlists', productListRoutes);

app.post("/upload", uploader.single("file"), uploadSingle, async (req, res) => {
  res.send(req.body);
});
app.get("/", (req, res) => {
  res.send("Hello to online API");
});

app.listen(PORT, () => {
  connectDB();
  console.log(`Server Running on port ${PORT}`);
});

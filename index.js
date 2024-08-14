import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './server/DB/databaseConfigs.js';
import productRoutes from './server/routes/productRoutes.js';
import attributeRoutes from './server/routes/attributeRoutes.js';
import categoryRoutes from './server/routes/categoryRoutes.js';
import supplierRoutes from './server/routes/supplierRoutes.js';
import expenseRoutes from './server/routes/expenseRoutes.js';
import promoCodeRoutes from './server/routes/promoCodeRoutes.js';
import carosulRoutes from './server/routes/carosulRoutes.js';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { fileURLToPath } from 'url';
import uploader from './server/middleware/uploader.js';
import { uploadSingle } from './server/middleware/uploadSingle.js';
import bodyParser from 'body-parser';
import authRoutes from './server/routes/authRoutes.js';

// import jwt from 'jsonwebtoken';
import typeRoutes from './server/routes/typesRoutes.js';
import orderRoutes from './server/routes/orderRoutes.js';
import sizeTypeRoutes from './server/routes/sizeTypeRoutes.js';
import sizeRoutes from './server/routes/sizeRoutes.js';

dotenv.config();


cloudinary.config({
  cloud_name: 'dhn94c9k5',
  api_key: '191656742611749',
  api_secret: 'BEYlGBUvUbNm4sISIRNLOLd2ixU'
});

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors({
  origin: 'http://localhost:3000', // Ensure this matches your frontend URL
  credentials: true, // Allow cookies to be sent
}));
// app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Derive __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/attributes', attributeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/promo-codes', promoCodeRoutes);
app.use('/api/carosul', carosulRoutes);
app.use('/api/types', typeRoutes);
app.use('/api/sizeTypes', sizeTypeRoutes);
app.use('/api/sizes', sizeRoutes);
// Upload route
app.post("/upload", uploader.single("file"), uploadSingle, async (req, res) => {
  res.send(req.body);
});

// Root route
app.get("/", (req, res) => {
  res.send("Hello to online API");
});

// Start server and connect to the database
app.listen(PORT, () => {
  connectDB();
  console.log(`Server Running on port ${PORT}`);
});

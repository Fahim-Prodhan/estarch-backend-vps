import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './server/DB/databaseConfigs.js';
import productRoutes from './server/routes/productRoutes.js';
import userRoutes from './server/routes/userRoutes.js';
import categoryRoutes from './server/routes/categoryRoutes.js';
import supplierRoutes from './server/routes/supplierRoutes.js';
import expenseRoutes from './server/routes/expenseRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); 
app.use(cookieParser());

// Derive __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/products', productRoutes);
app.use('/api/user', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/expenses', expenseRoutes);



app.get("/", (req, res) => {
  res.send("Hello to online API");
});

app.listen(PORT, () => {
  connectDB();
  console.log(`Server Running on port ${PORT}`);
});

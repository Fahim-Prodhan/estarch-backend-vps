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
import homeImageRoutes from './server/routes/homeImageRoutes.js';
import videoRoutes from './server/routes/videoRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import authRoutes from './server/routes/authRoutes.js';
import chartRoutes from './server/routes/sizeChartRoutes.js';
import typeRoutes from './server/routes/typesRoutes.js';
import orderRoutes from './server/routes/orderRoutes.js';
import sizeTypeRoutes from './server/routes/sizeTypeRoutes.js';
import sizeRoutes from './server/routes/sizeRoutes.js';
import toggleRoutes from './server/routes/toggleRoutes.js';
import uploader from './server/middleware/uploader.js';
import { uploadSingle } from './server/middleware/uploadSingle.js';
import extraSectionRoutes from './server/routes/extraSectionRoutes.js';
import showroomOrderHoldRoutes from './server/routes/showRoomOrderHoldRoutes.js'; 
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Improved CORS configuration
const allowedOrigins = [
  'https://estarch-admin.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
  'https://next.estarch.online',
  'https://genz.estarch.online',
  'https://www.estarch.com.bd',
  'https://estarch.com.bd',
  'https://www.estarch.net',
  'https://estarch.net',
  'https://estarch.shop',
  'https://www.estarch.shop',
  'http://localhost:5173'
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

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
app.use('/api/toggle', toggleRoutes);
app.use('/api/extra-section', extraSectionRoutes);

app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/attributes', attributeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/promo-codes', promoCodeRoutes);
app.use('/api/carosul', carosulRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/home-image', homeImageRoutes);
app.use('/api/types', typeRoutes);
app.use('/api/sizeTypes', sizeTypeRoutes);
app.use('/api/sizes', sizeRoutes);
app.use('/api/charts', chartRoutes);
app.use('/api/showroomOrderHold', showroomOrderHoldRoutes);
// Upload route
app.post('/upload', uploadSingle, (req, res) => {
  res.json({ file: req.file ? req.file.path : null });
});


// Root route
app.get('/', (req, res) => {
  res.send('Hello to online API');
});

// Start server and connect to the database
app.listen(PORT, () => {
  connectDB().catch((err) => {
    console.error('Failed to connect to the database:', err);
    process.exit(1); // Exit the process with a failure code if DB connection fails
  });
  console.log(`Server Running on port ${PORT}`);
});

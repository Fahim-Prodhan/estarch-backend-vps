import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { createPayment, executePayment, queryPayment, searchTransaction, refundTransaction } from 'bkash-payment';
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
import purchaseRoutes from './server/routes/purchaseRoutes.js';
import uploader from './server/middleware/uploader.js';
import { uploadSingle } from './server/middleware/uploadSingle.js';
import extraSectionRoutes from './server/routes/extraSectionRoutes.js';
import showroomOrderHoldRoutes from './server/routes/showRoomOrderHoldRoutes.js'; 
import paymentOptionRoutes from './server/routes/paymentOptionRoutes.js';
import brandRoutes from './server/routes/brandRoutes.js'; 
import courierApi from './server/routes/courierApiRoutes.js'
import accountRoutes from './server/routes/accountRoutes.js'
import transactionRoutes from './server/routes/transactionRoutes.js'
import expenseHeadRoutes from './server/routes/ExpenseHeadRoutes.js';
import productAssetRoutes from './server/routes/productAssetRoutes.js'
import assetRoutes from './server/routes/assetsRoutes.js'
import manufactureProduct from './server/routes/manufactureProductRoutes.js'
import cashRoutes from './server/routes/cashRoutes.js';
import courierAccountRoutes from './server/routes/courierAccountRoutes.js';
import couponRoutes from './server/routes/couponRoutes.js';
import giftCardRoutes from './server/routes/giftCardRoutes.js';
import membershipRoutes from './server/routes/membershipRoutes.js';
import footerContentsRoutes from './server/routes/footerContentsRoutes.js';


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
  'http://www.estarch.com.bd',
  'https://estarch.com.bd',
  'http://estarch.com.bd',
  'https://www.estarch.net',
  'http://www.estarch.net',
  'https://estarch.net',
  'http://estarch.net',
  'https://estarch.shop',
  'https://www.estarch.shop',
  'http://localhost:5173',
  'https://showroom.estarch.com.bd',
  'http://192.168.0.103:8081',
  'https://estarch-admin.vercel.app',
  'http://localhost:8081'
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
app.use('/api/payment', paymentOptionRoutes);
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
app.use('/api/purchase', purchaseRoutes);
app.use('/api/brands',brandRoutes );
app.use('/api/courier',courierApi );
app.use('/api/account',accountRoutes)
app.use('/api/transaction',transactionRoutes)
app.use('/api/expense-heads', expenseHeadRoutes);
app.use('/api/cash', cashRoutes);
app.use('/api/product-asset',productAssetRoutes)
app.use('/api/others-asset',assetRoutes)
app.use('/api/manufacture-product',manufactureProduct)
app.use('/api/courier-account', courierAccountRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/giftcards', giftCardRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/footer-contents', footerContentsRoutes);
// Upload route
app.post('/upload', uploadSingle, (req, res) => {
  res.json({ file: req.file ? req.file.path : null });
});

const bkashConfig = {
  base_url : 'https://tokenized.sandbox.bka.sh/v1.2.0-beta',
  username: 'sandboxTokenizedUser02',
  password: 'sandboxTokenizedUser02@12345',
  app_key: '4f6o0cjiki2rfm34kfdadl1eqq',
  app_secret: '2is7hdktrekvrbljjh44ll3d9l1dtjo4pasmjvs5vl5qr3fug4b'
 }

app.post("/bkash-checkout", async(req, res) => {
  try {
    const { amount, callbackURL, orderID, reference } = req.body
    const paymentDetails = {
      amount: amount || 10,                                                 
      callbackURL : callbackURL || 'http://localhost:5000/bkash-callback',  
      orderID : orderID || 'Order_101',                                     
      reference : reference || '1'                                         
    }
    const result =  await createPayment(bkashConfig, paymentDetails)
    res.send(result)
    
  } catch (e) {
    console.log(e)
  }
})

app.get("/bkash-callback", async(req, res) => {
  try {
    const { status, paymentID } = req.query
    let result
    let response = {
      statusCode : '4000',
      statusMessage : 'Payment Failed'
    }
    if(status === 'success')  result =  await executePayment(bkashConfig, paymentID)

    if(result?.transactionStatus === 'Completed'){
      // payment success
      // insert result in your db
    }
    if(result) response = {
      statusCode : result?.statusCode,
      statusMessage : result?.statusMessage
    }
    // You may use here WebSocket, server-sent events, or other methods to notify your client
    res.send(response)
  } catch (e) {
    console.log(e)
  }
})

// Add this route under admin middleware
app.post("/bkash-refund", async (req, res) => {
  try {
    const { paymentID, trxID, amount } = req.body
    const refundDetails = {
      paymentID,
      trxID,
      amount,
    }
    const result = await refundTransaction(bkashConfig, refundDetails)
    res.send(result)
  } catch (e) {
    console.log(e)
  }
})

app.get("/bkash-search", async (req, res) => {
  try {
    const { trxID } = req.query
    const result = await searchTransaction(bkashConfig, trxID)
    res.send(result)
  } catch (e) {
    console.log(e)
  }
})

app.get("/bkash-query", async (req, res) => {
  try {
    const { paymentID } = req.query
    const result = await queryPayment(bkashConfig, paymentID)
    res.send(result)
  } catch (e) {
    console.log(e)
  }
})


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

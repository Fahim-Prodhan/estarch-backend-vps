import express from 'express'
import { createCoupon,applyCoupon,getCouponsWithUsage,updateCoupon } from '../controllers/couponController.js'

const router = express.Router();

router.post('/create', createCoupon);
router.post('/apply', applyCoupon);
router.get('/', getCouponsWithUsage);
router.put("/update/:couponId", updateCoupon);

export default router;
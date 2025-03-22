import Coupon from "../models/coupon.js";
import Order from "../models/order.js";

export const createCoupon = async(req,res) =>{
    try{
        const { name, startDate, endDate, discountRules } = req.body;
    // Validate inputs
    if (!name || !startDate || !endDate || !discountRules.length) {
        return res.status(400).json({ message: "All fields are required." });
      }
  
      // Ensure end date is after start date
      if (new Date(endDate) <= new Date(startDate)) {
        return res.status(400).json({ message: "End date must be after start date." });
      }
  
      // Check for duplicate coupon
      const existingCoupon = await Coupon.findOne({ name });
      if (existingCoupon) {
        return res.status(400).json({ message: "Coupon name already exists." });
      }
  
      // Create and save coupon
      const newCoupon = new Coupon({ name, startDate, endDate, discountRules });
      await newCoupon.save();
  
      res.status(201).json({ message: "Coupon created successfully!", coupon: newCoupon });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
    
}

export const applyCoupon = async (req, res) => {
  try {
    const { couponName, cartTotal } = req.body;

    // Check if coupon exists
    const coupon = await Coupon.findOne({ name: couponName, isActive: true });
    console.log(coupon);
    
    if (!coupon) {
      return res.status(400).json({ message: "Invalid or expired coupon." });
    }

    const now = new Date();
    const startDate = new Date(coupon.startDate);
    const endDate = new Date(coupon.endDate);
    
    // Optionally reset time to start of the day to ignore time
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    
    if (now < startDate || now > endDate) {
      return res.status(400).json({ message: "Coupon is not valid at this time." });
    }

    // Find the best applicable discount
    let discount = 0;
    let discountType = null;
    coupon.discountRules.forEach(rule => {
      if (cartTotal >= rule.minSpend) {
        if (rule.discountType === "fixed") {
          discount = Math.max(discount, rule.discountAmount);
          discountType = "fixed";
        } else if (rule.discountType === "percentage") {
          const percentageDiscount = (cartTotal * rule.discountAmount) / 100;
          discount = Math.max(discount, percentageDiscount);
          discountType = "percentage";
        }
      }
    });

    if (discount === 0) {
      return res.status(400).json({ message: "Cart total does not meet the discount criteria." });
    }

    res.status(200).json({ 
      message: "Coupon applied!", 
      discountAmount: discount, 
      discountType 
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const getCouponsWithUsage = async (req, res) => {
  try {
    // Aggregate orders to calculate total sales and usage per coupon
    const couponUsage = await Order.aggregate([
      {
        $match: { "coupon.name": { $ne: null } } // Only include orders where a coupon was applied
      },
      {
        $group: {
          _id: "$coupon.name", // Group by coupon name
          totalSold: { $sum: "$grandTotal" }, // Sum grandTotal per coupon
          orderCount: { $sum: 1 } // Count how many times the coupon was used
        }
      }
    ]);

    // Fetch all coupons from the database
    const coupons = await Coupon.find({});

    // Combine coupon details with usage statistics
    const result = coupons.map(coupon => {
      const usageData = couponUsage.find(c => c._id === coupon.name) || { totalSold: 0, orderCount: 0 };

      return {
        _id: coupon._id,
        name: coupon.name,
        startDate: coupon.startDate,
        endDate: coupon.endDate,
        isActive: coupon.isActive,
        discountRules: coupon.discountRules, // Include discount rules
        totalSold: usageData.totalSold,
        orderCount: usageData.orderCount,
        createdAt: coupon.createdAt,
        updatedAt: coupon.updatedAt,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;
    const { startDate, endDate, isActive } = req.body;

    // Validate input
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start date and end date are required" });
    }

    // Find and update the coupon
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      couponId,
      { startDate, endDate, isActive },
      { new: true, runValidators: true }
    );

    if (!updatedCoupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.status(200).json({ message: "Coupon updated successfully", coupon: updatedCoupon });
  } catch (error) {
    console.error("Error updating coupon:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


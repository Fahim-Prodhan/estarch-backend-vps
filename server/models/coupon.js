import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    discountRules: [
      {
        minSpend: { type: Number, required: true },
        discountAmount: { type: Number, required: true }, 
        discountType: { type: String, enum: ["fixed", "percentage"], required: true }, 
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;

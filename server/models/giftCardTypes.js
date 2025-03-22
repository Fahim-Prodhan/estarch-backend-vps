import mongoose from "mongoose";
const giftCardTypesSchema = new mongoose.Schema(
    {
      amount: {
        type: Number,
        required: true,
        min: 0,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
    },
    { timestamps: true }
  );
  
  const GiftCardTypes = mongoose.model("GiftCardTypes", giftCardTypesSchema);
  export default  GiftCardTypes;
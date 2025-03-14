import mongoose from "mongoose";

const membershipCardSchema = new mongoose.Schema(
  {
    cardNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    tier: {
      type: String,
      enum: ["Silver", "Gold", "Platinum"],
      required: true
    },
    discountPercentage: {
      type: Number,
      required: true
    },
    isActive: {
      type: Boolean,
      default: false
    },
    issuedTo: {
      name: { type: String, trim: true }, 
      phone: { type: String, unique: true, sparse: true }, 
      address: { type: String, trim: true }, 
      assignedAt: { type: Date }
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

const MembershipCard = mongoose.model("MembershipCard", membershipCardSchema);
export default MembershipCard;

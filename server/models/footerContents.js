import mongoose from "mongoose";

const footerContentSchema = new mongoose.Schema(
    {
      aboutUs: { type: String, required: true },
      privacyPolicy: { type: String, required: true },
      termsConditions: { type: String, required: true },
      returnPolicy: { type: String, required: true },
    },
    { timestamps: true }
  );
  
  const FooterContent = mongoose.model("FooterContent", footerContentSchema);
  export default FooterContent;
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const DB_OPTIONS = {
      dbName: "ClothingStore",
    };
    await mongoose.connect(process.env.DATABASE_URL,DB_OPTIONS);
    console.log("Database Connected Successfully...");
  } catch (error) {
    console.log(error);
  }
};

export default connectDB;
import mongoose from "mongoose";

const connectDB = async () => {
  const DATABASE_URL = "mongodb+srv://estarchbd:aT3GHiNSqKOS9XCt@cluster0.nhgop.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
  try {
    const DB_OPTIONS = {
      dbName: "ClothingStore",
    };
    await mongoose.connect(DATABASE_URL,DB_OPTIONS);
    console.log("Database Connected Successfully...");
  } catch (error) {
    console.log(error);
  }
};

export default connectDB;
import mongoose from "mongoose";

const connectDB = async () => {
  const DATABASE_URL = "mongodb+srv://estarch:JAe2lmx1r3o9rzTK@cluster0.djweinm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
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
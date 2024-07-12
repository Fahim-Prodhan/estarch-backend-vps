// imports

import mongoose from "mongoose";


// Database Configurations

const connectDB = async () => {
  const DATABASE_URL = "mongodb+srv://dipropaul:admin@cluster0.arqhpj1.mongodb.net/blog-app";
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
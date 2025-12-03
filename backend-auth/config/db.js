const mongoose = require("mongoose");
const config = require("../utils/config");

const connectDB = async () => {
  try {
    const uri = config.MONGO_URI;

    if (!uri) {
      throw new Error("MONGO_URI is not defined in .env or config.js");
    }

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1); // stop server if DB fails
  }
};

module.exports = connectDB;

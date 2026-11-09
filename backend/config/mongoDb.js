import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("MongoDB Connected");
    });

    await mongoose.connect(process.env.MONGO_URI);

  } catch (error) {
    console.log("MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
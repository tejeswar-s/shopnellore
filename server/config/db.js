import mongoose from 'mongoose';

// Hardcoded MongoDB URI for practice project
const MONGO_URI = 'mongodb+srv://thisistejeswar:thisistejeswar@shopnellore.yhlbxcc.mongodb.net/?retryWrites=true&w=majority&appName=SHOPNELLORE';

const connectDB = async () => {
  try {
    console.log("🔁 Attempting to connect to MongoDB...");
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

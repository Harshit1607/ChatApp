import mongoose from 'mongoose'
import dotenv from 'dotenv';
dotenv.config();

const mongourl = process.env.MONGOURL;


export const connectDb = async () => {
  try {
    await mongoose.connect(mongourl);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1); // Exit the process with a failure code
  }
};
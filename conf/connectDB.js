import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/studentsDB');
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection failed:', error);
    }
}
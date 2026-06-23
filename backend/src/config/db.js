import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: process.env.MONGO_DB_NAME || "linkchat"
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

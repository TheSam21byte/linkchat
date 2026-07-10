import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: process.env.MONGO_DB_NAME || "linkchat_dev"
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

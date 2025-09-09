import mongoose from 'mongoose';

const mongoURI = process.env.MONGODB_URI;

const dbConfig = async () => {
    try {
        if (mongoose.connections[0].readyState) {
            console.log('MongoDB is already connected');
            return mongoose.connection.getClient();
        }

        await mongoose.connect(mongoURI);

        console.log('MongoDB connected successfully');
        // return mongoose.connection.db;
        return mongoose.connection.getClient();

    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};

export default dbConfig;
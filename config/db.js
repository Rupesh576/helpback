import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Attempt to connect to the MongoDB database using the URI from environment variables
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If the connection fails, log the error and exit the process
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Exit with a non-zero status code to indicate an error
  }
};

export default connectDB;

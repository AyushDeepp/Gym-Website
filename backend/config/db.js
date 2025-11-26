import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gym-website', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log('⚠️  Server will continue but database operations will fail.');
    console.log('💡 Make sure MongoDB is running or check your MONGODB_URI in .env file');
    // Don't exit - let server start even if DB fails (useful for testing)
    // process.exit(1);
  }
};

export default connectDB;


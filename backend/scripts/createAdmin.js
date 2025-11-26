import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/Admin.js';

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gym-website');
    console.log('✅ MongoDB Connected');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@elitegym.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin already exists with email: admin@elitegym.com');
      process.exit(0);
    }

    // Create default admin
    const admin = await Admin.create({
      name: 'Super Admin',
      email: 'admin@elitegym.com',
      password: 'admin123', // Change this in production!
      role: 'superadmin',
    });

    console.log('✅ Default admin created successfully!');
    console.log('📧 Email: admin@elitegym.com');
    console.log('🔑 Password: admin123');
    console.log('⚠️  Please change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();


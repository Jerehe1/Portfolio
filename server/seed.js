import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const createTestUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete existing test user first
    await User.deleteOne({ email: 'admin@test.com' });
    console.log('Deleted existing test user (if any)');

    // Create test admin user 
    const testUser = new User({
      username: 'admin',
      email: 'admin@test.com',
      password: 'admin123', 
      role: 'admin'
    });

    await testUser.save();
    console.log('✅ Test admin user created successfully!');
    console.log('\nLogin credentials:');
    console.log('Email: admin@test.com');
    console.log('Password: admin123');
    
    // Test the password comparison using the model method
    const savedUser = await User.findOne({ email: 'admin@test.com' });
    const passwordTest = await savedUser.comparePassword('admin123');
    console.log('Password comparison test:', passwordTest ? '✅ WORKS' : '❌ FAILS');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createTestUser();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model';

// Load environment variables
dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB');

    // Check if admin user exists
    const adminExists = await User.findOne({ email: 'admin@fosignals.com' });
    if (!adminExists) {
      console.log('Creating admin user...');
      const adminUser = new User({
        username: 'admin',
        email: 'admin@fosignals.com',
        password: 'Admin@123',
        role: 'admin',
        isAutoTradingEnabled: false,
        maxTradesPerDay: 5,
        maxCapitalPerTrade: 10000,
        zerodhaApiKey: process.env.ZERODHA_API_KEY,
        zerodhaApiSecret: process.env.ZERODHA_API_SECRET,
      });
      await adminUser.save();
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
      // Update admin user with latest API keys
      adminExists.zerodhaApiKey = process.env.ZERODHA_API_KEY;
      adminExists.zerodhaApiSecret = process.env.ZERODHA_API_SECRET;
      await adminExists.save();
      console.log('Admin user updated with latest API keys');
    }

    // Check if regular user exists
    const userExists = await User.findOne({ email: 'user@fosignals.com' });
    if (!userExists) {
      console.log('Creating regular user...');
      const regularUser = new User({
        username: 'user',
        email: 'user@fosignals.com',
        password: 'User@123',
        role: 'user',
        isAutoTradingEnabled: false,
        maxTradesPerDay: 3,
        maxCapitalPerTrade: 5000,
      });
      await regularUser.save();
      console.log('Regular user created successfully');
    } else {
      console.log('Regular user already exists');
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    console.log('Database seeding completed successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedDatabase();

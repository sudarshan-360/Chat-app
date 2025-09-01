import dotenv from 'dotenv';
import User from './models/User.js';
import { connectDB } from './lib/db.js';

// Load environment variables
dotenv.config();

async function checkUsers() {
  try {
    await connectDB(process.env.MONGODB_URI);
    const users = await User.find({});
    console.log('Total users in database:', users.length);
    users.forEach(u => {
      console.log('- User:', u.fullName, '(', u.email, ')', 'ID:', u._id);
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();
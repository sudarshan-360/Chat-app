import mongoose from 'mongoose';

//connection to mongo DB
const connectDB = async () => {
  try {
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected');
    });
    await mongoose.connect(`${process.env.MONGODB_URI}/chat-app`);
    
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

export default connectDB;
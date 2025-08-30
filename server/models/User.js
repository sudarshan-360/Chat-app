import mongoose from 'mongoose';

//user schema
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    default: "",
  },
  bio: {
    type: String,
  },
}, 
{
  timestamps: true,
});  // Added missing closing parenthesis

//user model
const User = mongoose.model('User', userSchema);

export default User;

import jwt from 'jsonwebtoken';

//generate token
export function generateToken(userId) {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  }); // Remove the 'b' character
  return token;
}

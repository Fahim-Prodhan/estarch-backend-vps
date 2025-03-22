import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const secret = 'your_jwt_secret'; // Replace with your secret key

export const authenticate = async (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, secret, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Failed to authenticate token' });
    }

    req.user = await User.findById(decoded.userId);
    next();
  });
};

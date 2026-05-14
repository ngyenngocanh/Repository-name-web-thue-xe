const jwt = require('jsonwebtoken');
const User = require('../models/User');
const userRepo = require('../repositories/userRepo');

const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.query.token;
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const dbProvider = (process.env.DB_PROVIDER || 'mongo').toLowerCase();
    const user =
      dbProvider === 'mssql'
        ? await userRepo.getUserById(decoded.userId)
        : await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token. User not found.' });
    }

    req.userId = dbProvider === 'mssql' ? user.id : user._id;
    // Đảm bảo req.user luôn có _id để tương thích với code Mongoose
    if (dbProvider === 'mssql' && !user._id) {
      user._id = user.id;
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

// Add properties to the function to support both direct use and destructuring
verifyToken.verifyToken = verifyToken;
verifyToken.isAdmin = isAdmin;
verifyToken.auth = verifyToken;

module.exports = verifyToken;

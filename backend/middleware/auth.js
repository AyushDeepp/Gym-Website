import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');

      // Get admin from token (support both old format with 'id' and new format with 'adminId')
      const adminId = decoded.adminId || decoded.id;
      req.admin = await Admin.findById(adminId).select('-password');

      if (!req.admin) {
        return res.status(401).json({ message: 'Admin not found' });
      }

      next();
    } catch (error) {
      console.error('Auth error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// @desc    Check if user is superadmin
// @access  Private
export const superAdmin = (req, res, next) => {
  if (req.admin && req.admin.role === 'superadmin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Superadmin privileges required.' });
  }
};


import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Admin from '../models/Admin.js';

// Middleware to authenticate user (for frontend users)
export const protectUser = async (req, res, next) => {
  let token;

  // Check for token in Authorization header or cookies
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (!req.user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Middleware to check user roles
export const authRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}` 
      });
    }

    next();
  };
};

// Middleware to authenticate admin (existing, but updated to work with both)
export const protectAdmin = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.adminToken) {
    token = req.cookies.adminToken;
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');

    // Check if it's an admin token (admin tokens have adminId, user tokens have id)
    if (decoded.adminId) {
      req.admin = await Admin.findById(decoded.adminId).select('-password');
      if (!req.admin) {
        return res.status(401).json({ message: 'Admin not found' });
      }
    } else if (decoded.id) {
      // Could be a user with admin role
      const user = await User.findById(decoded.id).select('-password');
      if (user && (user.role === 'admin' || user.role === 'super_admin')) {
        req.admin = user;
      } else {
        return res.status(403).json({ message: 'Admin access required' });
      }
    } else {
      return res.status(401).json({ message: 'Invalid token' });
    }

    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Middleware to check admin roles
export const authAdminRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const adminRole = req.admin.role || 'admin';
    const normalizedRoles = allowedRoles.map(r => r === 'super_admin' ? 'superadmin' : r);
    
    if (!normalizedRoles.includes(adminRole)) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}` 
      });
    }

    next();
  };
};


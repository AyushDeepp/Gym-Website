import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

// Generate JWT Token for Admin
const generateToken = (id) => {
  return jwt.sign({ adminId: id }, process.env.JWT_SECRET || 'your-secret-key-change-in-production', {
    expiresIn: '30d',
  });
};

// @desc    Login admin
// @route   POST /api/admin/auth/login
// @access  Public
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check for admin
    const admin = await Admin.findOne({ email });

    if (admin && (await admin.matchPassword(password))) {
      res.json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        token: generateToken(admin._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current admin
// @route   GET /api/admin/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select('-password');
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new admin (only by superadmin)
// @route   POST /api/admin/auth/register
// @access  Private (Superadmin only)
export const registerAdmin = async (req, res) => {
  try {
    // Check if user is superadmin
    if (req.admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied. Superadmin privileges required.' });
    }

    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    // Check if admin exists
    const adminExists = await Admin.findOne({ email });

    if (adminExists) {
      return res.status(400).json({ message: 'Admin already exists with this email' });
    }

    // Create admin
    const admin = await Admin.create({
      name,
      email,
      password,
      role: role || 'admin',
    });

    if (admin) {
      res.status(201).json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        token: generateToken(admin._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid admin data' });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all admins
// @route   GET /api/admin/auth/admins
// @access  Private
export const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select('-password').sort({ createdAt: -1 });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update admin
// @route   PUT /api/admin/auth/admins/:id
// @access  Private (Superadmin only)
export const updateAdmin = async (req, res) => {
  try {
    // Check if user is superadmin
    if (req.admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied. Superadmin privileges required.' });
    }

    const { name, email, password, role } = req.body;
    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== admin.email) {
      const emailExists = await Admin.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Update fields
    admin.name = name || admin.name;
    admin.email = email || admin.email;
    admin.role = role || admin.role;
    
    // Only update password if provided
    if (password && password.length > 0) {
      admin.password = password;
    }

    const updatedAdmin = await admin.save();

    res.json({
      _id: updatedAdmin._id,
      name: updatedAdmin.name,
      email: updatedAdmin.email,
      role: updatedAdmin.role,
      createdAt: updatedAdmin.createdAt,
    });
  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete admin
// @route   DELETE /api/admin/auth/admins/:id
// @access  Private (Superadmin only)
export const deleteAdmin = async (req, res) => {
  try {
    // Check if user is superadmin
    if (req.admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied. Superadmin privileges required.' });
    }

    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Prevent deleting yourself
    if (admin._id.toString() === req.admin._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    await Admin.findByIdAndDelete(req.params.id);

    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ message: error.message });
  }
};


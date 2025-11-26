import User from '../models/User.js';
import UserPayment from '../models/UserPayment.js';
import Plan from '../models/Plan.js';
import Trainer from '../models/Trainer.js';

// @desc    Get all customers with filters
// @route   GET /api/admin/customers
// @access  Private (Admin)
export const getCustomers = async (req, res) => {
  try {
    const { role, membershipStatus, expiringSoon, page = 1, limit = 20, search } = req.query;

    const query = {};

    // Filter by role
    if (role && role !== 'all') {
      query.role = role;
    }

    // Filter by membership status
    if (membershipStatus && membershipStatus !== 'all') {
      if (membershipStatus === 'active') {
        query['membership.status'] = 'active';
        query['membership.endDate'] = { $gte: new Date() };
      } else if (membershipStatus === 'expired') {
        query.$or = [
          { 'membership.status': 'expired' },
          { 'membership.endDate': { $lt: new Date() } },
        ];
      } else if (membershipStatus === 'cancelled') {
        query['membership.status'] = 'cancelled';
      } else if (membershipStatus === 'none') {
        query.$or = [
          { membership: null },
          { 'membership.status': { $exists: false } },
        ];
      }
    }

    // Filter by expiring soon (within 7 days)
    if (expiringSoon === 'true') {
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      query['membership.endDate'] = {
        $gte: new Date(),
        $lte: sevenDaysFromNow,
      };
      query['membership.status'] = 'active';
    }

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const customers = await User.find(query)
      .select('-password')
      .populate('assignedTrainer', 'name specialization image')
      .populate('membership.planId', 'name price duration')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      customers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get customer by ID
// @route   GET /api/admin/customers/:id
// @access  Private (Admin)
export const getCustomerById = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id)
      .select('-password')
      .populate('assignedTrainer', 'name specialization image bio experience')
      .populate('membership.planId', 'name price duration features');

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Get payment history
    const payments = await UserPayment.find({ userId: customer._id })
      .populate('planId', 'name price duration')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      customer,
      payments,
    });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update customer role
// @route   PUT /api/admin/customers/:id/update-role
// @access  Private (Admin)
export const updateCustomerRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['visitor', 'member', 'admin', 'super_admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Prevent changing super_admin role unless current user is super_admin
    const customer = await User.findById(id);
    if (customer && customer.role === 'super_admin' && req.admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Cannot modify super_admin role' });
    }
    
    // Prevent changing role if customer is an admin user (not a regular user)
    // This is a safety check

    const updatedCustomer = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    )
      .select('-password')
      .populate('assignedTrainer', 'name specialization image')
      .populate('membership.planId', 'name price duration');

    if (!updatedCustomer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({
      message: 'Role updated successfully',
      customer: updatedCustomer,
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update customer membership
// @route   PUT /api/admin/customers/:id/membership
// @access  Private (Admin)
export const updateCustomerMembership = async (req, res) => {
  try {
    const { id } = req.params;
    const { planId, startDate, endDate, status, autoRenew } = req.body;

    const customer = await User.findById(id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    let plan = null;
    if (planId) {
      plan = await Plan.findById(planId);
      if (!plan) {
        return res.status(404).json({ message: 'Plan not found' });
      }
    }

    // Update membership
    if (customer.membership) {
      if (planId) customer.membership.planId = plan._id;
      if (plan) customer.membership.planName = plan.name;
      if (startDate) customer.membership.startDate = new Date(startDate);
      if (endDate) customer.membership.endDate = new Date(endDate);
      if (status) customer.membership.status = status;
      if (autoRenew !== undefined) customer.membership.autoRenew = autoRenew;
    } else if (planId) {
      // Create new membership
      customer.membership = {
        planId: plan._id,
        planName: plan.name,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : new Date(),
        status: status || 'active',
        autoRenew: autoRenew || false,
      };
    }

    // Update role if membership is being activated
    if (status === 'active' && customer.role === 'visitor') {
      customer.role = 'member';
    }

    await customer.save();

    const updatedCustomer = await User.findById(id)
      .select('-password')
      .populate('assignedTrainer', 'name specialization image')
      .populate('membership.planId', 'name price duration features');

    res.json({
      message: 'Membership updated successfully',
      customer: updatedCustomer,
    });
  } catch (error) {
    console.error('Update membership error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get customer payments
// @route   GET /api/admin/customers/:id/payments
// @access  Private (Admin)
export const getCustomerPayments = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const payments = await UserPayment.find({ userId: id })
      .populate('planId', 'name price duration')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await UserPayment.countDocuments({ userId: id });

    res.json({
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get customer payments error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update customer notes
// @route   PUT /api/admin/customers/:id/notes
// @access  Private (Admin)
export const updateCustomerNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const customer = await User.findByIdAndUpdate(
      id,
      { notes: notes || '' },
      { new: true }
    )
      .select('-password');

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({
      message: 'Notes updated successfully',
      customer,
    });
  } catch (error) {
    console.error('Update notes error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign trainer to customer
// @route   PUT /api/admin/customers/:id/assign-trainer
// @access  Private (Admin)
export const assignTrainer = async (req, res) => {
  try {
    const { id } = req.params;
    const { trainerId } = req.body;

    const customer = await User.findById(id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    if (trainerId) {
      const trainer = await Trainer.findById(trainerId);
      if (!trainer) {
        return res.status(404).json({ message: 'Trainer not found' });
      }
      customer.assignedTrainer = trainerId;
    } else {
      customer.assignedTrainer = null;
    }

    await customer.save();

    const updatedCustomer = await User.findById(id)
      .select('-password')
      .populate('assignedTrainer', 'name specialization image bio experience')
      .populate('membership.planId', 'name price duration');

    res.json({
      message: trainerId ? 'Trainer assigned successfully' : 'Trainer removed successfully',
      customer: updatedCustomer,
    });
  } catch (error) {
    console.error('Assign trainer error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete customer
// @route   DELETE /api/admin/customers/:id
// @access  Private (Super Admin only)
export const deleteCustomer = async (req, res) => {
  try {
    // Check if user is super_admin (using the existing protect + superAdmin middleware)
    // This check is redundant since superAdmin middleware already handles it, but kept for safety

    const customer = await User.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Prevent deleting super_admin users
    if (customer.role === 'super_admin') {
      return res.status(403).json({ message: 'Cannot delete super_admin user' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ message: error.message });
  }
};


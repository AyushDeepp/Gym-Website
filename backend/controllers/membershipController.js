import User from '../models/User.js';
import Plan from '../models/Plan.js';
import UserPayment from '../models/UserPayment.js';

// @desc    Activate membership after payment
// @route   POST /api/membership/activate
// @access  Private (called internally after payment verification)
export const activateMembership = async (req, res) => {
  try {
    const { userId, planId, paymentId, startDate, endDate } = req.body;

    if (!userId || !planId) {
      return res.status(400).json({ message: 'Please provide userId and planId' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    // Calculate dates if not provided
    const membershipStartDate = startDate ? new Date(startDate) : new Date();
    let membershipEndDate;

    if (endDate) {
      membershipEndDate = new Date(endDate);
    } else {
      // Calculate end date based on plan duration
      const duration = plan.duration.toLowerCase();
      membershipEndDate = new Date(membershipStartDate);

      if (duration.includes('month')) {
        const months = parseInt(duration) || 1;
        membershipEndDate.setMonth(membershipEndDate.getMonth() + months);
      } else if (duration.includes('year')) {
        const years = parseInt(duration) || 1;
        membershipEndDate.setFullYear(membershipEndDate.getFullYear() + years);
      } else if (duration.includes('week')) {
        const weeks = parseInt(duration) || 1;
        membershipEndDate.setDate(membershipEndDate.getDate() + weeks * 7);
      } else {
        // Default to 1 month
        membershipEndDate.setMonth(membershipEndDate.getMonth() + 1);
      }
    }

    // Update user role to member if currently visitor
    if (user.role === 'visitor') {
      user.role = 'member';
    }

    // Update or create membership
    user.membership = {
      planId: plan._id,
      planName: plan.name,
      startDate: membershipStartDate,
      endDate: membershipEndDate,
      status: 'active',
      autoRenew: false,
    };

    await user.save();

    // Update payment record if paymentId provided
    if (paymentId) {
      await UserPayment.findByIdAndUpdate(paymentId, {
        membershipActivated: true,
      });
    }

    const updatedUser = await User.findById(userId)
      .populate('membership.planId', 'name price duration features')
      .select('-password');

    res.json({
      message: 'Membership activated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Activate membership error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Renew membership
// @route   PUT /api/membership/renew/:userId
// @access  Private (Admin) or Private (User for self)
export const renewMembership = async (req, res) => {
  try {
    const { userId } = req.params;
    const { planId, months, startDate } = req.body;

    // Check if user is updating their own membership or is admin
    if (req.user._id.toString() !== userId && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Not authorized to renew this membership' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let plan;
    if (planId) {
      plan = await Plan.findById(planId);
      if (!plan) {
        return res.status(404).json({ message: 'Plan not found' });
      }
    } else if (user.membership && user.membership.planId) {
      plan = await Plan.findById(user.membership.planId);
    } else {
      return res.status(400).json({ message: 'No plan specified' });
    }

    const renewalStartDate = startDate ? new Date(startDate) : (user.membership?.endDate ? new Date(user.membership.endDate) : new Date());
    const renewalMonths = months || (plan.duration.toLowerCase().includes('month') ? parseInt(plan.duration) : 1);

    const newEndDate = new Date(renewalStartDate);
    newEndDate.setMonth(newEndDate.getMonth() + renewalMonths);

    // Update membership
    user.membership = {
      planId: plan._id,
      planName: plan.name,
      startDate: user.membership?.startDate || renewalStartDate,
      endDate: newEndDate,
      status: 'active',
      autoRenew: user.membership?.autoRenew || false,
    };

    // Ensure role is member
    if (user.role === 'visitor') {
      user.role = 'member';
    }

    await user.save();

    const updatedUser = await User.findById(userId)
      .populate('membership.planId', 'name price duration features')
      .select('-password');

    res.json({
      message: 'Membership renewed successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Renew membership error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get membership status
// @route   GET /api/membership/status/:userId
// @access  Private
export const getMembershipStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user is viewing their own status or is admin
    if (req.user._id.toString() !== userId && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const user = await User.findById(userId)
      .populate('membership.planId', 'name price duration features')
      .select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isActive = user.hasActiveMembership();
    const daysUntilExpiry = user.getDaysUntilExpiry();

    res.json({
      membership: user.membership,
      isActive,
      daysUntilExpiry,
      role: user.role,
    });
  } catch (error) {
    console.error('Get membership status error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel membership
// @route   PUT /api/membership/cancel/:userId
// @access  Private (Admin only)
export const cancelMembership = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.membership) {
      user.membership.status = 'cancelled';
      await user.save();
    }

    const updatedUser = await User.findById(userId)
      .populate('membership.planId', 'name price duration features')
      .select('-password');

    res.json({
      message: 'Membership cancelled successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Cancel membership error:', error);
    res.status(500).json({ message: error.message });
  }
};


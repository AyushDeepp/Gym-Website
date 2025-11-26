import razorpay from '../config/razorpay.js';
import Payment from '../models/Payment.js';
import UserPayment from '../models/UserPayment.js';
import Plan from '../models/Plan.js';
import User from '../models/User.js';
import crypto from 'crypto';

// Helper function to activate membership
const activateMembershipForUser = async (userId, planId, paymentId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const plan = await Plan.findById(planId);
    if (!plan) return;

    const membershipStartDate = new Date();
    let membershipEndDate = new Date();

    // Calculate end date based on plan duration
    const duration = plan.duration.toLowerCase();
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
      membershipEndDate.setMonth(membershipEndDate.getMonth() + 1);
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

    // Update payment record
    if (paymentId) {
      await UserPayment.findByIdAndUpdate(paymentId, {
        membershipActivated: true,
      });
    }
  } catch (error) {
    console.error('Error activating membership:', error);
  }
};

// @desc    Create Razorpay order
// @route   POST /api/payments/create
// @access  Public (or Private if userId provided)
export const createOrder = async (req, res) => {
  try {
    const { planId, customerName, customerEmail, customerPhone, userId } = req.body;

    if (!planId || !customerName || !customerEmail) {
      return res.status(400).json({ message: 'Please provide planId, customerName, and customerEmail' });
    }

    // If userId is provided, verify user exists
    let user = null;
    if (userId) {
      user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      // Use user's email and name if provided
      if (!customerEmail) {
        customerEmail = user.email;
      }
      if (!customerName) {
        customerName = user.name;
      }
    }

    // Get plan details
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    const amount = plan.price * 100; // Convert to paise

    // Demo Mode - Skip actual Razorpay call
    if (process.env.DEMO_MODE === 'true' || !process.env.RAZORPAY_KEY_ID) {
      const demoOrderId = `order_demo_${Date.now()}`;
      
      // Save payment record (legacy Payment model for backward compatibility)
      const payment = await Payment.create({
        orderId: demoOrderId,
        planId: plan._id,
        planName: plan.name,
        amount: plan.price,
        customerName,
        customerEmail,
        customerPhone: customerPhone || '',
        status: 'pending',
      });

      // Save UserPayment if userId provided
      let userPayment = null;
      if (userId) {
        userPayment = await UserPayment.create({
          userId,
          orderId: demoOrderId,
          planId: plan._id,
          planName: plan.name,
          amount: plan.price,
          status: 'pending',
        });
      }

      return res.status(201).json({
        orderId: demoOrderId,
        amount: amount,
        currency: 'INR',
        paymentId: userPayment ? userPayment._id : payment._id,
        demo: true,
        message: 'Demo mode - Payment will be simulated',
      });
    }

    // Production Mode - Create Razorpay order
    const options = {
      amount: amount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        planId: planId.toString(),
        planName: plan.name,
        customerName,
        customerEmail,
      },
    };

    const order = await razorpay.orders.create(options);

    // Save payment record (legacy Payment model for backward compatibility)
    const payment = await Payment.create({
      orderId: order.id,
      planId: plan._id,
      planName: plan.name,
      amount: plan.price,
      customerName,
      customerEmail,
      customerPhone: customerPhone || '',
      status: 'pending',
    });

    // Save UserPayment if userId provided
    let userPayment = null;
    if (userId) {
      userPayment = await UserPayment.create({
        userId,
        orderId: order.id,
        planId: plan._id,
        planName: plan.name,
        amount: plan.price,
        status: 'pending',
      });
    }

    res.status(201).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      paymentId: userPayment ? userPayment._id : payment._id,
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payments/verify
// @access  Public
export const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const finalOrderId = orderId || razorpayOrderId;
    const finalPaymentId = paymentId || razorpayPaymentId;
    const finalSignature = signature || razorpaySignature;

    if (!finalOrderId) {
      return res.status(400).json({ message: 'Missing order ID' });
    }

    // Demo Mode - Skip signature verification
    if (process.env.DEMO_MODE === 'true' || !process.env.RAZORPAY_KEY_ID) {
      // Update payment record (legacy)
      const payment = await Payment.findOneAndUpdate(
        { orderId: finalOrderId },
        {
          paymentId: finalPaymentId || `pay_demo_${Date.now()}`,
          signature: finalSignature || 'demo_signature',
          status: 'completed',
        },
        { new: true }
      );

      // Update UserPayment if exists
      const userPayment = await UserPayment.findOneAndUpdate(
        { orderId: finalOrderId },
        {
          paymentId: finalPaymentId || `pay_demo_${Date.now()}`,
          signature: finalSignature || 'demo_signature',
          status: 'completed',
        },
        { new: true }
      );

      if (!payment && !userPayment) {
        return res.status(404).json({ message: 'Payment record not found' });
      }

      // Activate membership if userPayment exists
      if (userPayment && userPayment.userId) {
        await activateMembershipForUser(
          userPayment.userId.toString(),
          userPayment.planId.toString(),
          userPayment._id.toString()
        );
      }

      return res.json({
        message: 'Payment verified successfully (Demo Mode)',
        payment: userPayment || payment,
        demo: true,
      });
    }

    // Production Mode - Verify signature
    if (!finalPaymentId || !finalSignature) {
      return res.status(400).json({ message: 'Missing payment verification details' });
    }

    // Verify signature
    const text = `${finalOrderId}|${finalPaymentId}`;
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (generatedSignature !== finalSignature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Update payment record (legacy)
    const payment = await Payment.findOneAndUpdate(
      { orderId: finalOrderId },
      {
        paymentId: finalPaymentId,
        signature: finalSignature,
        status: 'completed',
      },
      { new: true }
    );

    // Update UserPayment if exists
    const userPayment = await UserPayment.findOneAndUpdate(
      { orderId: finalOrderId },
      {
        paymentId: finalPaymentId,
        signature: finalSignature,
        status: 'completed',
      },
      { new: true }
    );

    if (!payment && !userPayment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    // Activate membership if userPayment exists
    if (userPayment && userPayment.userId) {
      await activateMembershipForUser(
        userPayment.userId.toString(),
        userPayment.planId.toString(),
        userPayment._id.toString()
      );
    }

    res.json({
      message: 'Payment verified successfully',
      payment: userPayment || payment,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get payment details
// @route   GET /api/payments/:id
// @access  Public
export const getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('planId');
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all payments
// @route   GET /api/payments/all
// @access  Private/Admin
export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


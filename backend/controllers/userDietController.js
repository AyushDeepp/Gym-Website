import UserDietPlan from '../models/UserDietPlan.js';

// Get all user diet plans
export const getUserDietPlans = async (req, res) => {
  try {
    const { userId } = req.params;
    const plans = await UserDietPlan.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single user diet plan
export const getUserDietPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await UserDietPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Diet plan not found' });
    }
    res.json({ success: true, plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create user diet plan
export const createUserDietPlan = async (req, res) => {
  try {
    const plan = new UserDietPlan({
      ...req.body,
      userId: req.user._id,
    });
    await plan.save();
    res.status(201).json({ success: true, plan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update user diet plan
export const updateUserDietPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await UserDietPlan.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Diet plan not found' });
    }
    res.json({ success: true, plan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete user diet plan
export const deleteUserDietPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await UserDietPlan.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Diet plan not found' });
    }
    res.json({ success: true, message: 'Diet plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};







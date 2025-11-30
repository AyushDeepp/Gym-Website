import UserWorkoutPlan from '../models/UserWorkoutPlan.js';

// Get all user workout plans
export const getUserWorkoutPlans = async (req, res) => {
  try {
    const { userId } = req.params;
    const plans = await UserWorkoutPlan.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single user workout plan
export const getUserWorkoutPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await UserWorkoutPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Workout plan not found' });
    }
    res.json({ success: true, plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create user workout plan
export const createUserWorkoutPlan = async (req, res) => {
  try {
    const plan = new UserWorkoutPlan({
      ...req.body,
      userId: req.user._id,
    });
    await plan.save();
    res.status(201).json({ success: true, plan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update user workout plan
export const updateUserWorkoutPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await UserWorkoutPlan.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Workout plan not found' });
    }
    res.json({ success: true, plan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete user workout plan
export const deleteUserWorkoutPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await UserWorkoutPlan.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Workout plan not found' });
    }
    res.json({ success: true, message: 'Workout plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add exercise to user workout plan
export const addExerciseToPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { exercise } = req.body;
    const plan = await UserWorkoutPlan.findOne({ _id: id, userId: req.user._id });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Workout plan not found' });
    }
    plan.exercises.push({
      ...exercise,
      order: plan.exercises.length,
    });
    await plan.save();
    res.json({ success: true, plan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};







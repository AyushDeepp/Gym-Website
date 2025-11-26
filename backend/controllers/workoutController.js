import WorkoutPlan from '../models/WorkoutPlan.js';

const memberRoles = ['member', 'admin', 'super_admin'];

const buildAccessQuery = (user) => {
  if (!user) {
    return { access: 'public' };
  }

  if (user.role === 'admin' || user.role === 'super_admin') {
    return {};
  }

  return {
    $or: [
      { access: 'public' },
      { access: 'members' },
      { access: 'assigned', assignedTo: user._id },
    ],
  };
};

const sanitizePreview = (plans) =>
  plans.map((plan) => ({
    _id: plan._id,
    title: plan.title,
    goal: plan.goal,
    level: plan.level,
    imageUrl: plan.imageUrl,
    access: plan.access,
    totalExercises: plan.exercises.length,
    sampleExercises: plan.exercises.slice(0, 1),
    locked: plan.access !== 'public',
  }));

export const getWorkoutPlans = async (req, res) => {
  try {
    const previewMode = req.query.preview === 'true' || (!req.user && !req.admin);
    const isMember = req.user && memberRoles.includes(req.user.role);
    const isAdmin = !!req.admin;

    if (previewMode && !isAdmin && !isMember) {
      const previewPlans = await WorkoutPlan.find({ access: { $ne: 'assigned' } }).sort({ createdAt: -1 });
      return res.json({
        preview: true,
        plans: sanitizePreview(previewPlans),
      });
    }

    if (!req.user && !req.admin) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!isMember && !isAdmin) {
      return res.status(403).json({ message: 'Members only content' });
    }

    const query = isAdmin ? {} : buildAccessQuery(req.user);
    const plans = await WorkoutPlan.find(query).sort({ createdAt: -1 });
    res.json(plans);
  } catch (error) {
    console.error('Get workout plans error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getWorkoutPlanById = async (req, res) => {
  try {
    const plan = await WorkoutPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: 'Workout plan not found' });
    }

    const isAdmin = !!req.admin;
    const isMember = req.user && memberRoles.includes(req.user.role);

    if (!isAdmin) {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (!isMember) {
        return res.status(403).json({ message: 'Members only content' });
      }

      if (plan.access === 'assigned' && !plan.assignedTo.some((id) => id.equals(req.user._id))) {
        return res.status(403).json({ message: 'Plan is restricted' });
      }
    }

    res.json(plan);
  } catch (error) {
    console.error('Get workout plan error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const createWorkoutPlan = async (req, res) => {
  try {
    const { title, goal, level, imageUrl, exercises, access = 'public', assignedTo = [] } = req.body;

    if (!title || !goal || !exercises?.length) {
      return res.status(400).json({ message: 'Title, goal and exercises are required' });
    }

    const plan = await WorkoutPlan.create({
      title,
      goal,
      level,
      imageUrl,
      access,
      exercises,
      assignedTo,
      createdBy: req.admin?._id,
    });

    res.status(201).json(plan);
  } catch (error) {
    console.error('Create workout plan error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const updateWorkoutPlan = async (req, res) => {
  try {
    const plan = await WorkoutPlan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!plan) {
      return res.status(404).json({ message: 'Workout plan not found' });
    }

    res.json(plan);
  } catch (error) {
    console.error('Update workout plan error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteWorkoutPlan = async (req, res) => {
  try {
    const plan = await WorkoutPlan.findByIdAndDelete(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: 'Workout plan not found' });
    }

    res.json({ message: 'Workout plan deleted successfully' });
  } catch (error) {
    console.error('Delete workout plan error:', error);
    res.status(500).json({ message: error.message });
  }
};



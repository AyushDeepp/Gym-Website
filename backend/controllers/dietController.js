import DietPlan from '../models/DietPlan.js';

const memberRoles = ['member', 'admin', 'super_admin'];

const sanitizeDietPreview = (diets) =>
  diets.map((diet) => ({
    _id: diet._id,
    title: diet.title,
    type: diet.type,
    description: diet.description,
    access: diet.access,
    totalMeals: diet.meals.length,
    sampleMeals: diet.meals.slice(0, 1),
    locked: diet.access !== 'public',
  }));

const buildDietAccessQuery = (user) => {
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

export const getDietPlans = async (req, res) => {
  try {
    const previewMode = req.query.preview === 'true' || (!req.user && !req.admin);
    const isMember = req.user && memberRoles.includes(req.user.role);
    const isAdmin = !!req.admin;

    if (previewMode && !isAdmin && !isMember) {
      const previewDiets = await DietPlan.find({ access: { $ne: 'assigned' } }).sort({ createdAt: -1 });
      return res.json({
        preview: true,
        diets: sanitizeDietPreview(previewDiets),
      });
    }

    if (!req.user && !req.admin) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!isMember && !isAdmin) {
      return res.status(403).json({ message: 'Members only content' });
    }

    const query = isAdmin ? {} : buildDietAccessQuery(req.user);
    const diets = await DietPlan.find(query).sort({ createdAt: -1 });
    res.json(diets);
  } catch (error) {
    console.error('Get diet plans error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const createDietPlan = async (req, res) => {
  try {
    const { title, type, description, meals, access = 'members', assignedTo = [] } = req.body;

    if (!title || !description || !meals?.length) {
      return res.status(400).json({ message: 'Title, description and meals are required' });
    }

    const diet = await DietPlan.create({
      title,
      type,
      description,
      meals,
      access,
      assignedTo,
      createdBy: req.admin?._id,
    });

    res.status(201).json(diet);
  } catch (error) {
    console.error('Create diet plan error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const updateDietPlan = async (req, res) => {
  try {
    const diet = await DietPlan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!diet) {
      return res.status(404).json({ message: 'Diet plan not found' });
    }

    res.json(diet);
  } catch (error) {
    console.error('Update diet plan error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteDietPlan = async (req, res) => {
  try {
    const diet = await DietPlan.findByIdAndDelete(req.params.id);

    if (!diet) {
      return res.status(404).json({ message: 'Diet plan not found' });
    }

    res.json({ message: 'Diet plan deleted successfully' });
  } catch (error) {
    console.error('Delete diet plan error:', error);
    res.status(500).json({ message: error.message });
  }
};



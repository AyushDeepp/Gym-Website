import ProgressEntry from '../models/ProgressEntry.js';

const memberRoles = ['member', 'admin', 'super_admin'];

export const createProgressEntry = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!memberRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Only members can track progress' });
    }

    const { weight, bodyFat, date, notes, photoUrl, height } = req.body;

    if (!weight) {
      return res.status(400).json({ message: 'Weight is required' });
    }

    let bmi;
    if (height) {
      const heightMeters = Number(height) / 100;
      if (heightMeters > 0) {
        bmi = Number(weight) / (heightMeters * heightMeters);
      }
    }

    const entry = await ProgressEntry.create({
      userId: req.user._id,
      weight,
      bodyFat,
      date: date || new Date(),
      notes,
      photoUrl,
      bmi,
    });

    res.status(201).json(entry);
  } catch (error) {
    console.error('Create progress entry error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getProgressEntries = async (req, res) => {
  try {
    const { userId } = req.params;
    const isAdmin = !!req.admin;
    const isOwner = req.user && req.user._id.toString() === userId;
    const isCoach = req.user && (req.user.role === 'admin' || req.user.role === 'super_admin');

    if (!isAdmin && !isOwner && !isCoach) {
      return res.status(403).json({ message: 'Not authorized to view progress entries' });
    }

    const entries = await ProgressEntry.find({ userId }).sort({ date: 1 });
    res.json(entries);
  } catch (error) {
    console.error('Get progress entries error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteProgressEntry = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const entry = await ProgressEntry.findById(req.params.entryId);

    if (!entry) {
      return res.status(404).json({ message: 'Progress entry not found' });
    }

    if (entry.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own entries' });
    }

    await entry.deleteOne();
    res.json({ message: 'Progress entry deleted successfully' });
  } catch (error) {
    console.error('Delete progress entry error:', error);
    res.status(500).json({ message: error.message });
  }
};



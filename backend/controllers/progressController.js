import ProgressEntry from '../models/ProgressEntry.js';

const memberRoles = ['member', 'admin', 'super_admin'];

export const createProgressEntry = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Allow both members and visitors to track progress
    const {
      weight,
      bodyFat,
      date,
      notes,
      photoUrl,
      height,
      measurements,
      strengthMetrics,
      energy,
      sleep,
      mood,
      goals,
    } = req.body;

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
      measurements,
      strengthMetrics,
      energy,
      sleep,
      mood,
      goals,
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

    const entries = await ProgressEntry.find({ userId }).sort({ date: -1 });
    res.json(entries);
  } catch (error) {
    console.error('Get progress entries error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const updateProgressEntry = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const entry = await ProgressEntry.findById(req.params.entryId);

    if (!entry) {
      return res.status(404).json({ message: 'Progress entry not found' });
    }

    if (entry.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only update your own entries' });
    }

    const {
      weight,
      bodyFat,
      date,
      notes,
      photoUrl,
      height,
      measurements,
      strengthMetrics,
      energy,
      sleep,
      mood,
      goals,
    } = req.body;

    if (weight) entry.weight = weight;
    if (bodyFat !== undefined) entry.bodyFat = bodyFat;
    if (date) entry.date = date;
    if (notes !== undefined) entry.notes = notes;
    if (photoUrl !== undefined) entry.photoUrl = photoUrl;
    if (height) {
      const heightMeters = Number(height) / 100;
      if (heightMeters > 0) {
        entry.bmi = Number(weight || entry.weight) / (heightMeters * heightMeters);
      }
    } else if (weight && entry.bmi) {
      // Recalculate BMI if weight changed but height wasn't provided
      // We'd need height from previous entry or user profile, but for now just update weight
    }
    if (measurements) entry.measurements = { ...entry.measurements, ...measurements };
    if (strengthMetrics) entry.strengthMetrics = { ...entry.strengthMetrics, ...strengthMetrics };
    if (energy !== undefined) entry.energy = energy;
    if (sleep) entry.sleep = { ...entry.sleep, ...sleep };
    if (mood !== undefined) entry.mood = mood;
    if (goals) entry.goals = { ...entry.goals, ...goals };

    await entry.save();
    res.json(entry);
  } catch (error) {
    console.error('Update progress entry error:', error);
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



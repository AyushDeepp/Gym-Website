import Timetable from '../models/Timetable.js';

// @desc    Get all timetable entries
// @route   GET /api/timetable
// @access  Public
export const getTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.find().sort({ day: 1, time: 1 });
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get timetable by day
// @route   GET /api/timetable/day/:day
// @access  Public
export const getTimetableByDay = async (req, res) => {
  try {
    const timetable = await Timetable.find({ day: req.params.day }).sort({ time: 1 });
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create timetable entry
// @route   POST /api/timetable
// @access  Private/Admin
export const createTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.create(req.body);
    res.status(201).json(timetable);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update timetable entry
// @route   PUT /api/timetable/:id
// @access  Private/Admin
export const updateTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable entry not found' });
    }
    res.json(timetable);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete timetable entry
// @route   DELETE /api/timetable/:id
// @access  Private/Admin
export const deleteTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.findByIdAndDelete(req.params.id);
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable entry not found' });
    }
    res.json({ message: 'Timetable entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


import Program from '../models/Program.js';

// @desc    Get all programs
// @route   GET /api/programs
// @access  Public
export const getPrograms = async (req, res) => {
  try {
    const programs = await Program.find().sort({ createdAt: -1 });
    res.json(programs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single program
// @route   GET /api/programs/:id
// @access  Public
export const getProgram = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }
    res.json(program);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create program
// @route   POST /api/programs
// @access  Private/Admin
export const createProgram = async (req, res) => {
  try {
    const program = await Program.create(req.body);
    res.status(201).json(program);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update program
// @route   PUT /api/programs/:id
// @access  Private/Admin
export const updateProgram = async (req, res) => {
  try {
    const program = await Program.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }
    res.json(program);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete program
// @route   DELETE /api/programs/:id
// @access  Private/Admin
export const deleteProgram = async (req, res) => {
  try {
    const program = await Program.findByIdAndDelete(req.params.id);
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }
    res.json({ message: 'Program deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


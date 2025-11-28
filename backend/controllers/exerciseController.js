import Exercise from '../models/Exercise.js';

// Get all exercises with optional filters
export const getExercises = async (req, res) => {
  try {
    const {
      muscleGroup,
      subMuscle,
      equipment,
      difficulty,
      goal,
      movementType,
      exerciseType,
      search,
    } = req.query;
    const query = {};

    if (muscleGroup) {
      query.muscleGroup = muscleGroup;
    }

    if (subMuscle) {
      query.subMuscles = { $in: [subMuscle] };
    }

    if (equipment) {
      query.equipment = { $in: [equipment] };
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (goal) {
      query.goals = { $in: [goal] };
    }

    if (movementType) {
      query.movementType = movementType;
    }

    if (exerciseType) {
      query.exerciseType = exerciseType;
    }

    // Handle search - combine with existing filters
    if (search) {
      const searchQuery = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { alternativeNames: { $in: [new RegExp(search, 'i')] } },
        ],
      };

      if (Object.keys(query).length > 0) {
        query.$and = [searchQuery];
      } else {
        Object.assign(query, searchQuery);
      }
    }

    const exercises = await Exercise.find(query).sort({ name: 1 });
    res.json({ success: true, exercises, count: exercises.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single exercise by ID or slug
export const getExerciseById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if it's a valid MongoDB ObjectId
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    
    let exercise;
    if (isObjectId) {
      // Try by ID first
      exercise = await Exercise.findById(id);
      // If not found by ID, try by slug
      if (!exercise) {
        exercise = await Exercise.findOne({ slug: id });
      }
    } else {
      // Try by slug
      exercise = await Exercise.findOne({ slug: id });
    }

    if (!exercise) {
      return res.status(404).json({ 
        success: false, 
        message: 'Exercise not found',
        id: id 
      });
    }
    res.json({ success: true, exercise });
  } catch (error) {
    console.error('Error fetching exercise:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get unique categories for filtering
export const getExerciseCategories = async (req, res) => {
  try {
    const [muscleGroups, subMuscles, equipment, difficulties, goals, movementTypes, exerciseTypes] =
      await Promise.all([
        Exercise.distinct('muscleGroup'),
        Exercise.distinct('subMuscles'),
        Exercise.distinct('equipment'),
        Exercise.distinct('difficulty'),
        Exercise.distinct('goals'),
        Exercise.distinct('movementType'),
        Exercise.distinct('exerciseType'),
      ]);

    // Organize subMuscles by muscleGroup
    const subMusclesByGroup = {};
    const exercises = await Exercise.find({}, 'muscleGroup subMuscles');
    
    exercises.forEach((exercise) => {
      if (!subMusclesByGroup[exercise.muscleGroup]) {
        subMusclesByGroup[exercise.muscleGroup] = [];
      }
      exercise.subMuscles.forEach((sub) => {
        if (!subMusclesByGroup[exercise.muscleGroup].includes(sub)) {
          subMusclesByGroup[exercise.muscleGroup].push(sub);
        }
      });
    });

    res.json({
      success: true,
      categories: {
        muscleGroups: muscleGroups.sort(),
        subMusclesByGroup,
        equipment: equipment.sort(),
        difficulties: difficulties.sort(),
        goals: goals.sort(),
        movementTypes: movementTypes.sort(),
        exerciseTypes: exerciseTypes.filter(Boolean).sort(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create exercise (admin only)
export const createExercise = async (req, res) => {
  try {
    const exercise = new Exercise({
      ...req.body,
      createdBy: req.admin?._id,
    });
    await exercise.save();
    res.status(201).json({ success: true, exercise });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update exercise (admin only)
export const updateExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!exercise) {
      return res.status(404).json({ success: false, message: 'Exercise not found' });
    }
    res.json({ success: true, exercise });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete exercise (admin only)
export const deleteExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findByIdAndDelete(req.params.id);
    if (!exercise) {
      return res.status(404).json({ success: false, message: 'Exercise not found' });
    }
    res.json({ success: true, message: 'Exercise deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

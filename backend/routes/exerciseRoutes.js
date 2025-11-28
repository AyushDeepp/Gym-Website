import express from 'express';
import {
  getExercises,
  getExerciseById,
  getExerciseCategories,
  createExercise,
  updateExercise,
  deleteExercise,
} from '../controllers/exerciseController.js';
import { protect } from '../middleware/auth.js';
import { attachUserIfPresent } from '../middleware/authRoleMiddleware.js';

const router = express.Router();

// Public routes
router.get('/categories', getExerciseCategories);
router.get('/', attachUserIfPresent, getExercises);
router.get('/:id', attachUserIfPresent, getExerciseById);

// Admin routes
router.post('/', protect, createExercise);
router.put('/:id', protect, updateExercise);
router.delete('/:id', protect, deleteExercise);

export default router;


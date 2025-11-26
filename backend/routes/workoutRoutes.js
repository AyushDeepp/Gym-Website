import express from 'express';
import {
  getWorkoutPlans,
  getWorkoutPlanById,
  createWorkoutPlan,
  updateWorkoutPlan,
  deleteWorkoutPlan,
} from '../controllers/workoutController.js';
import { protect } from '../middleware/auth.js';
import {
  protectUserOrAdmin,
  attachUserIfPresent,
  attachAdminIfPresent,
} from '../middleware/authRoleMiddleware.js';

const router = express.Router();

router.get('/', attachUserIfPresent, attachAdminIfPresent, getWorkoutPlans);
router.get('/:id', protectUserOrAdmin, getWorkoutPlanById);
router.post('/', protect, createWorkoutPlan);
router.put('/:id', protect, updateWorkoutPlan);
router.delete('/:id', protect, deleteWorkoutPlan);

export default router;



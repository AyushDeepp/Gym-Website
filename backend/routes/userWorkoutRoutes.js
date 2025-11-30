import express from 'express';
import {
  getUserWorkoutPlans,
  getUserWorkoutPlan,
  createUserWorkoutPlan,
  updateUserWorkoutPlan,
  deleteUserWorkoutPlan,
  addExerciseToPlan,
} from '../controllers/userWorkoutController.js';
import { protectUser } from '../middleware/authRoleMiddleware.js';

const router = express.Router();

// All routes require user authentication
router.use(protectUser);

router.get('/user/:userId', getUserWorkoutPlans);
router.get('/:id', getUserWorkoutPlan);
router.post('/', createUserWorkoutPlan);
router.put('/:id', updateUserWorkoutPlan);
router.delete('/:id', deleteUserWorkoutPlan);
router.post('/:id/exercises', addExerciseToPlan);

export default router;


import express from 'express';
import {
  getUserDietPlans,
  getUserDietPlan,
  createUserDietPlan,
  updateUserDietPlan,
  deleteUserDietPlan,
} from '../controllers/userDietController.js';
import { protectUser } from '../middleware/authRoleMiddleware.js';

const router = express.Router();

// All routes require user authentication
router.use(protectUser);

router.get('/user/:userId', getUserDietPlans);
router.get('/:id', getUserDietPlan);
router.post('/', createUserDietPlan);
router.put('/:id', updateUserDietPlan);
router.delete('/:id', deleteUserDietPlan);

export default router;


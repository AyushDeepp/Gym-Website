import express from 'express';
import {
  getPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
} from '../controllers/planController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(getPlans).post(protect, createPlan);
router.route('/:id').get(getPlan).put(protect, updatePlan).delete(protect, deletePlan);

export default router;


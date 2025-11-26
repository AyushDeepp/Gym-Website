import express from 'express';
import { getDietPlans, createDietPlan, updateDietPlan, deleteDietPlan } from '../controllers/dietController.js';
import { protect } from '../middleware/auth.js';
import { attachAdminIfPresent, attachUserIfPresent } from '../middleware/authRoleMiddleware.js';

const router = express.Router();

router.get('/', attachUserIfPresent, attachAdminIfPresent, getDietPlans);
router.post('/', protect, createDietPlan);
router.put('/:id', protect, updateDietPlan);
router.delete('/:id', protect, deleteDietPlan);

export default router;



import express from 'express';
import { createProgressEntry, getProgressEntries, deleteProgressEntry } from '../controllers/progressController.js';
import { protectUser, authRole, protectUserOrAdmin } from '../middleware/authRoleMiddleware.js';

const router = express.Router();

router.post('/', protectUser, authRole('member', 'admin', 'super_admin'), createProgressEntry);
router.get('/:userId', protectUserOrAdmin, getProgressEntries);
router.delete('/:entryId', protectUser, authRole('member', 'admin', 'super_admin'), deleteProgressEntry);

export default router;



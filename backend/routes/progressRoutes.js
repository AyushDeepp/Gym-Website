import express from 'express';
import { createProgressEntry, getProgressEntries, updateProgressEntry, deleteProgressEntry } from '../controllers/progressController.js';
import { protectUser, authRole, protectUserOrAdmin } from '../middleware/authRoleMiddleware.js';

const router = express.Router();

// Allow visitors to track progress (just need authentication)
router.post('/', protectUser, createProgressEntry);
router.get('/:userId', protectUserOrAdmin, getProgressEntries);
router.put('/:entryId', protectUser, updateProgressEntry);
router.delete('/:entryId', protectUser, deleteProgressEntry);

export default router;



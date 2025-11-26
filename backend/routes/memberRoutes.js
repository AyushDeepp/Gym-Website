import express from 'express';
import {
  activateMembership,
  renewMembership,
  getMembershipStatus,
  cancelMembership,
} from '../controllers/membershipController.js';
import { protectUser, authRole } from '../middleware/authRoleMiddleware.js';
import { protectAdmin, authAdminRole } from '../middleware/authRoleMiddleware.js';

const router = express.Router();

// Activate membership (internal use, called after payment)
router.post('/activate', activateMembership);

// Renew membership (user or admin)
router.put('/renew/:userId', protectUser, renewMembership);

// Get membership status
router.get('/status/:userId', protectUser, getMembershipStatus);

// Cancel membership (admin only)
router.put('/cancel/:userId', protectAdmin, authAdminRole('admin', 'superadmin'), cancelMembership);

export default router;


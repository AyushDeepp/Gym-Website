import express from 'express';
import {
  getTransformations,
  submitTransformation,
  approveTransformation,
  deleteTransformation,
} from '../controllers/transformationController.js';
import {
  attachAdminIfPresent,
  attachUserIfPresent,
  protectUser,
  authRole,
  protectUserOrAdmin,
} from '../middleware/authRoleMiddleware.js';

const router = express.Router();

router.get('/', attachUserIfPresent, attachAdminIfPresent, getTransformations);
router.post('/', protectUser, authRole('member', 'admin', 'super_admin'), submitTransformation);
router.put('/approve/:id', protectUserOrAdmin, approveTransformation);
router.delete('/:id', protectUserOrAdmin, deleteTransformation);

export default router;



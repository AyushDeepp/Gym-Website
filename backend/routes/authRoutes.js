import express from 'express';
import {
  loginAdmin,
  getMe,
  registerAdmin,
  getAdmins,
  updateAdmin,
  deleteAdmin,
} from '../controllers/authController.js';
import { protect, superAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', loginAdmin);
router.get('/me', protect, getMe);
router.post('/register', protect, superAdmin, registerAdmin);
router.get('/admins', protect, getAdmins);
router.put('/admins/:id', protect, superAdmin, updateAdmin);
router.delete('/admins/:id', protect, superAdmin, deleteAdmin);

export default router;


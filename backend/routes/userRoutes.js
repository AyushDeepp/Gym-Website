import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  googleAuth,
} from '../controllers/userController.js';
import { protectUser } from '../middleware/authRoleMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.get('/me', protectUser, getMe);
router.put('/profile', protectUser, updateProfile);

export default router;


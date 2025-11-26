import express from 'express';
import {
  checkIn,
  checkOut,
  getTodayAttendance,
  getUserAttendance,
  getAllAttendance,
  getAttendanceStats,
  deleteAttendance,
  adminCheckIn,
  adminCheckOut,
} from '../controllers/attendanceController.js';
import { protectUser, authRole } from '../middleware/authRoleMiddleware.js';
import { protectAdmin, authAdminRole } from '../middleware/authRoleMiddleware.js';

const router = express.Router();

// Member routes
router.post('/checkin', protectUser, authRole('member', 'admin', 'super_admin'), checkIn);
router.post('/checkout', protectUser, authRole('member', 'admin', 'super_admin'), checkOut);
router.get('/today', protectUser, authRole('member', 'admin', 'super_admin'), getTodayAttendance);
router.get('/user/:userId', protectUser, getUserAttendance);

// Admin routes
router.get('/', protectAdmin, authAdminRole('admin', 'superadmin'), getAllAttendance);
router.get('/stats', protectAdmin, authAdminRole('admin', 'superadmin'), getAttendanceStats);
router.post('/admin/checkin', protectAdmin, authAdminRole('admin', 'superadmin'), adminCheckIn);
router.post('/admin/checkout', protectAdmin, authAdminRole('admin', 'superadmin'), adminCheckOut);
router.delete('/:id', protectAdmin, authAdminRole('admin', 'superadmin'), deleteAttendance);

export default router;


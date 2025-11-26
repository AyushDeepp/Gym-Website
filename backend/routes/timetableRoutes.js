import express from 'express';
import {
  getTimetable,
  getTimetableByDay,
  createTimetable,
  updateTimetable,
  deleteTimetable,
} from '../controllers/timetableController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(getTimetable).post(protect, createTimetable);
router.route('/day/:day').get(getTimetableByDay);
router.route('/:id').put(protect, updateTimetable).delete(protect, deleteTimetable);

export default router;


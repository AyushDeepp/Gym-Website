import express from 'express';
import {
  getPrograms,
  getProgram,
  createProgram,
  updateProgram,
  deleteProgram,
} from '../controllers/programController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(getPrograms).post(protect, createProgram);
router.route('/:id').get(getProgram).put(protect, updateProgram).delete(protect, deleteProgram);

export default router;


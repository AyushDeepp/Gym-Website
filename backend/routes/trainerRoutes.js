import express from 'express';
import {
  getTrainers,
  getTrainer,
  createTrainer,
  updateTrainer,
  deleteTrainer,
} from '../controllers/trainerController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(getTrainers).post(protect, createTrainer);
router.route('/:id').get(getTrainer).put(protect, updateTrainer).delete(protect, deleteTrainer);

export default router;


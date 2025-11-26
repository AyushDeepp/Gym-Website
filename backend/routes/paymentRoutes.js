import express from 'express';
import {
  createOrder,
  verifyPayment,
  getPayment,
  getPayments,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/create', createOrder);
router.post('/verify', verifyPayment);
router.get('/all', protect, getPayments);
router.get('/:id', getPayment);

export default router;


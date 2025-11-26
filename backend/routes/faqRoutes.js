import express from 'express';
import { getFaqs, createFaq, updateFaq, deleteFaq } from '../controllers/faqController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getFaqs);
router.post('/', protect, createFaq);
router.put('/:id', protect, updateFaq);
router.delete('/:id', protect, deleteFaq);

export default router;



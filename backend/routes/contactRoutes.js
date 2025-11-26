import express from 'express';
import {
  submitContact,
  getContacts,
  getContact,
  updateContact,
} from '../controllers/contactController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/').post(submitContact).get(protect, getContacts);
router.route('/:id').get(protect, getContact).put(protect, updateContact);

export default router;


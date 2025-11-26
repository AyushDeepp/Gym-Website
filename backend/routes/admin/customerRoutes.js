import express from 'express';
import {
  getCustomers,
  getCustomerById,
  updateCustomerRole,
  updateCustomerMembership,
  getCustomerPayments,
  updateCustomerNotes,
  assignTrainer,
  deleteCustomer,
} from '../../controllers/customerAdminController.js';
import { protect, superAdmin } from '../../middleware/auth.js';

const router = express.Router();

// All routes require admin authentication
router.use(protect);

router.get('/', getCustomers);
router.get('/:id', getCustomerById);
router.put('/:id/update-role', updateCustomerRole);
router.put('/:id/membership', updateCustomerMembership);
router.get('/:id/payments', getCustomerPayments);
router.put('/:id/notes', updateCustomerNotes);
router.put('/:id/assign-trainer', assignTrainer);
router.delete('/:id', superAdmin, deleteCustomer);

export default router;


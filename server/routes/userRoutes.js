import express from 'express';
import {
  getProfile,
  updateProfile,
  deleteProfile,
  getAllUsersAdmin,
  updateUserRoleAdmin,
  deleteUserAdmin
} from '../controllers/userController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/roleMiddleware.js';
import { validateObjectId } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.use(authenticateUser);

// Current user profile routes
router.route('/profile')
  .get(getProfile)
  .put(updateProfile)
  .delete(deleteProfile);

// Admin-only user management routes
router.route('/')
  .get(authorizeRole('admin'), getAllUsersAdmin);

router.route('/:id/role')
  .put(authorizeRole('admin'), validateObjectId('id'), updateUserRoleAdmin);

router.route('/:id')
  .delete(authorizeRole('admin'), validateObjectId('id'), deleteUserAdmin);

export default router;

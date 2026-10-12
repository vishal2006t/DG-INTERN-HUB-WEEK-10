import express from 'express';
import { getProfile, updateProfile, deleteProfile } from '../controllers/userController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateUser);

router.route('/profile')
  .get(getProfile)
  .put(updateProfile)
  .delete(deleteProfile);

export default router;

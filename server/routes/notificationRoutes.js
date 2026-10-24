import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead
} from '../controllers/notificationController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { validateObjectId } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/', getNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', validateObjectId('id'), markAsRead);

export default router;

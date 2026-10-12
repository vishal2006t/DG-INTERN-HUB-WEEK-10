import express from 'express';
import {
  applyForJob,
  getMyApplications,
  getApplicationById,
  updateApplicationStatus,
  deleteApplication
} from '../controllers/applicationController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/roleMiddleware.js';
import { validateBody, validateObjectId } from '../middleware/validationMiddleware.js';
import { validateApplication, validateApplicationStatus } from '../validators/applicationValidator.js';

const router = express.Router();

// All application routes require authentication
router.use(authenticateUser);

router.route('/')
  .post(validateBody(validateApplication), applyForJob);

router.get('/my', getMyApplications);

router.route('/:id')
  .get(validateObjectId('id'), getApplicationById)
  .delete(validateObjectId('id'), deleteApplication);

router.put(
  '/:id/status',
  authorizeRole('recruiter', 'admin'),
  validateObjectId('id'),
  validateBody(validateApplicationStatus),
  updateApplicationStatus
);

export default router;

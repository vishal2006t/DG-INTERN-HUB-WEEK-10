import express from 'express';
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob
} from '../controllers/jobController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/roleMiddleware.js';
import { validateBody, validateObjectId } from '../middleware/validationMiddleware.js';
import { validateJob } from '../validators/jobValidator.js';

const router = express.Router();

router.route('/')
  .get(getJobs)
  .post(
    authenticateUser,
    authorizeRole('recruiter', 'admin'),
    validateBody((body) => validateJob(body, false)),
    createJob
  );

router.route('/:id')
  .get(validateObjectId('id'), getJobById)
  .put(
    authenticateUser,
    authorizeRole('recruiter', 'admin'),
    validateObjectId('id'),
    validateBody((body) => validateJob(body, true)),
    updateJob
  )
  .delete(
    authenticateUser,
    authorizeRole('recruiter', 'admin'),
    validateObjectId('id'),
    deleteJob
  );

export default router;

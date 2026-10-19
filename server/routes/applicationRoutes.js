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

import { uploadResume } from '../middleware/uploadMiddleware.js';
import { sendSuccess, sendError } from '../utils/helpers.js';

const router = express.Router();

// All application routes require authentication
router.use(authenticateUser);

// Resume upload route (PDF only, max 5MB)
router.post('/upload-resume', (req, res, next) => {
  uploadResume.single('resume')(req, res, (err) => {
    if (err) {
      return sendError(res, 400, err.message || 'File upload failed');
    }
    if (!req.file) {
      return sendError(res, 400, 'Please select a valid PDF file to upload');
    }
    return sendSuccess(res, 200, 'Resume uploaded successfully', {
      fileName: req.file.originalname,
      fileUrl: `/uploads/resumes/${req.file.filename}`,
      resumeUrl: `/uploads/resumes/${req.file.filename}`,
      fileSize: req.file.size
    });
  });
});

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

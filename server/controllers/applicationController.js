import mongoose from 'mongoose';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import { sendSuccess, sendError } from '../utils/helpers.js';

// @desc    Submit a new internship / job application
// @route   POST /api/applications
// @access  Private (Candidate, Admin)
export const applyForJob = async (req, res, next) => {
  try {
    const { jobId, fullName, email, phone, whyInterested, resumeFileName, resumeUrl } = req.body;

    // Resolve job by ObjectId or slug
    let job;
    if (mongoose.Types.ObjectId.isValid(jobId)) {
      job = await Job.findById(jobId);
    }
    if (!job) {
      job = await Job.findOne({ slug: jobId });
    }

    if (!job) {
      return sendError(res, 404, 'Job not found');
    }

    if (job.status === 'closed') {
      return sendError(res, 400, 'This position is currently closed to new applications');
    }

    // Check for duplicate application
    const existingApplication = await Application.findOne({
      job: job._id,
      applicant: req.user._id
    });

    if (existingApplication) {
      return sendError(res, 409, 'You have already submitted an application for this position');
    }

    // Create application
    const application = await Application.create({
      job: job._id,
      applicant: req.user._id,
      fullName: fullName || req.user.name,
      email: (email || req.user.email).toLowerCase().trim(),
      phone: phone || req.user.phone,
      whyInterested,
      resumeFileName: resumeFileName || 'resume.pdf',
      resumeUrl: resumeUrl || '',
      status: 'pending'
    });

    // Increment applicantsCount on job
    await Job.findByIdAndUpdate(job._id, { $inc: { applicantsCount: 1 } });

    // Populate job details in return
    const populatedApp = await Application.findById(application._id)
      .populate('job', 'title company location stipend workType')
      .populate('applicant', 'name email');

    return sendSuccess(res, 201, 'Application submitted successfully', populatedApp);
  } catch (error) {
    next(error);
  }
};

// @desc    Get applications for the currently logged in candidate
// @route   GET /api/applications/my
// @access  Private (Candidate, Recruiter, Admin)
export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('job', 'title company location workType stipend category slug status')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Applications retrieved successfully', applications);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single application by ID
// @route   GET /api/applications/:id
// @access  Private (Applicant, Job Recruiter, Admin)
export const getApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'Invalid application ID');
    }

    const application = await Application.findById(id)
      .populate('job', 'title company location postedBy workType stipend')
      .populate('applicant', 'name email phone skills bio');

    if (!application) {
      return sendError(res, 404, 'Application not found');
    }

    // Access authorization:
    // Candidate who submitted, or recruiter who posted the job, or admin
    const isApplicant = application.applicant._id.toString() === req.user._id.toString();
    const isJobPoster = application.job && application.job.postedBy && application.job.postedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isApplicant && !isJobPoster && !isAdmin) {
      return sendError(res, 403, 'Access denied: you cannot view this application');
    }

    return sendSuccess(res, 200, 'Application retrieved successfully', application);
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private (Recruiter, Admin)
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'Invalid application ID');
    }

    const application = await Application.findById(id).populate('job');
    if (!application) {
      return sendError(res, 404, 'Application not found');
    }

    // Verify permission: only job poster or admin can update status
    const isJobPoster = application.job && application.job.postedBy && application.job.postedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isJobPoster && !isAdmin) {
      return sendError(res, 403, 'Access denied: only the job recruiter or admin can update application status');
    }

    application.status = status;
    if (notes !== undefined) application.notes = notes;
    application.reviewedBy = req.user._id;

    await application.save();

    return sendSuccess(res, 200, `Application status updated to ${status}`, application);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete or withdraw an application
// @route   DELETE /api/applications/:id
// @access  Private (Applicant, Recruiter, Admin)
export const deleteApplication = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'Invalid application ID');
    }

    const application = await Application.findById(id).populate('job');
    if (!application) {
      return sendError(res, 404, 'Application not found');
    }

    // Authorization: applicant can withdraw, or job poster or admin
    const isApplicant = application.applicant.toString() === req.user._id.toString();
    const isJobPoster = application.job && application.job.postedBy && application.job.postedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isApplicant && !isJobPoster && !isAdmin) {
      return sendError(res, 403, 'Access denied: not authorized to delete this application');
    }

    await Application.findByIdAndDelete(id);

    // Decrement job applicants count safely
    if (application.job) {
      await Job.findByIdAndUpdate(application.job._id, { $inc: { applicantsCount: -1 } });
    }

    return sendSuccess(res, 200, 'Application removed successfully');
  } catch (error) {
    next(error);
  }
};

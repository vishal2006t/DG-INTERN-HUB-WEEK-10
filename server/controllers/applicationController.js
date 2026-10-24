import mongoose from 'mongoose';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import Notification from '../models/Notification.js';
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

    // Send in-app notification to the recruiter who posted the job
    if (job.postedBy && job.postedBy.toString() !== req.user._id.toString()) {
      try {
        await Notification.create({
          recipient: job.postedBy,
          sender: req.user._id,
          title: 'New Application Received',
          message: `${fullName || req.user.name} applied for "${job.title}"`,
          type: 'application_received',
          link: '/dashboard'
        });
      } catch (notifErr) {
        console.warn('[Notification] Failed to create applicant notification:', notifErr.message);
      }
    }

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

// @desc    Get all applications submitted to jobs posted by recruiter (or all for admin)
// @route   GET /api/applications/recruiter
// @access  Private (Recruiter, Admin)
export const getRecruiterApplications = async (req, res, next) => {
  try {
    const isRecruiter = req.user.role === 'recruiter';
    const isAdmin = req.user.role === 'admin';

    if (!isRecruiter && !isAdmin) {
      return sendError(res, 403, 'Access denied: recruiter or admin privilege required');
    }

    // For recruiter: only jobs created by them. For admin: all jobs or recruiter filter.
    const jobFilter = isRecruiter ? { postedBy: req.user._id } : {};
    const jobs = await Job.find(jobFilter)
      .select('_id title company workType location openings stipend applicantsCount status createdAt')
      .sort({ createdAt: -1 });

    const jobIds = jobs.map((j) => j._id);

    // Build application filter
    const appFilter = { job: { $in: jobIds } };
    const { jobId, status, search } = req.query;

    if (jobId && mongoose.Types.ObjectId.isValid(jobId)) {
      appFilter.job = jobId;
    }
    if (status && status !== 'All') {
      appFilter.status = status.toLowerCase();
    }
    if (search && search.trim()) {
      const sRegex = new RegExp(search.trim(), 'i');
      appFilter.$or = [
        { fullName: sRegex },
        { email: sRegex },
        { phone: sRegex }
      ];
    }

    const applications = await Application.find(appFilter)
      .populate('job', 'title company workType location stipend status')
      .populate('applicant', 'name email phone skills bio')
      .sort({ createdAt: -1 });

    // Compute aggregated metrics for recruiter dashboard
    const allAppsForJobs = await Application.find({ job: { $in: jobIds } });
    const stats = {
      totalJobs: jobs.length,
      totalApplicants: allAppsForJobs.length,
      pending: allAppsForJobs.filter((a) => a.status === 'pending').length,
      shortlisted: allAppsForJobs.filter((a) => a.status === 'shortlisted' || a.status === 'reviewed').length,
      accepted: allAppsForJobs.filter((a) => a.status === 'accepted').length,
      rejected: allAppsForJobs.filter((a) => a.status === 'rejected').length
    };

    return sendSuccess(res, 200, 'Recruiter applications retrieved successfully', {
      jobs,
      applications,
      stats
    });
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

    // Send in-app notification to the candidate informing them of status change
    try {
      const statusTitle = status.charAt(0).toUpperCase() + status.slice(1);
      await Notification.create({
        recipient: application.applicant,
        sender: req.user._id,
        title: 'Application Status Updated',
        message: `Your application for "${application.job?.title || 'Internship'}" has been marked as ${statusTitle}.`,
        type: 'status_updated',
        link: '/applications'
      });
    } catch (notifErr) {
      console.warn('[Notification] Failed to create candidate status update notification:', notifErr.message);
    }

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

// @desc    Export applications as CSV (Recruiter own jobs / Admin all)
// @route   GET /api/applications/export/csv
// @access  Private (Recruiter, Admin)
export const exportApplicationsCSV = async (req, res, next) => {
  try {
    const isRecruiter = req.user.role === 'recruiter';
    const isAdmin = req.user.role === 'admin';

    if (!isRecruiter && !isAdmin) {
      return sendError(res, 403, 'Access denied: CSV export is only available to recruiters and administrators');
    }

    // Determine accessible jobs
    const jobFilter = isRecruiter ? { postedBy: req.user._id } : {};
    const jobs = await Job.find(jobFilter).select('_id title company workType location stipend');
    const jobIds = jobs.map((j) => j._id);

    const applications = await Application.find({ job: { $in: jobIds } })
      .populate('job', 'title company workType location stipend')
      .populate('applicant', 'name email phone skills')
      .sort({ createdAt: -1 });

    // Helper to escape CSV values
    const escapeCSV = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    // CSV header row
    const headers = [
      'Application ID',
      'Candidate Name',
      'Candidate Email',
      'Candidate Phone',
      'Job Title',
      'Company',
      'Work Mode',
      'Stipend',
      'Application Status',
      'Applied Date',
      'Resume File'
    ];

    const rows = applications.map((app) => [
      escapeCSV(app._id),
      escapeCSV(app.fullName || app.applicant?.name || 'N/A'),
      escapeCSV(app.email || app.applicant?.email || 'N/A'),
      escapeCSV(app.phone || app.applicant?.phone || 'N/A'),
      escapeCSV(app.job?.title || 'N/A'),
      escapeCSV(app.job?.company || 'N/A'),
      escapeCSV(app.job?.workType || 'N/A'),
      escapeCSV(app.job?.stipend || 'N/A'),
      escapeCSV(app.status?.toUpperCase() || 'PENDING'),
      escapeCSV(new Date(app.createdAt).toISOString().split('T')[0]),
      escapeCSV(app.resumeFileName || 'resume.pdf')
    ]);

    const csvContent = [headers.map(escapeCSV).join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="dg-interns-applications.csv"');
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

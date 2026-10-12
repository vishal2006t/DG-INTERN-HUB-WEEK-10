import mongoose from 'mongoose';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import { sendSuccess, sendError, sanitizeQuery } from '../utils/helpers.js';

// @desc    Get all jobs with search, filtering, pagination, and sorting
// @route   GET /api/jobs
// @access  Public
export const getJobs = async (req, res, next) => {
  try {
    const sanitizedParams = sanitizeQuery(req.query);
    const {
      search,
      type,
      location,
      skill,
      category,
      workType,
      featured,
      sort = 'newest',
      page = 1,
      limit = 10
    } = sanitizedParams;

    // Build query filter
    const query = { status: { $ne: 'draft' } };

    // Search across title, company, skills, location, description
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { company: searchRegex },
        { location: searchRegex },
        { skills: searchRegex },
        { description: searchRegex }
      ];
    }

    // Filter by type (e.g. internship, full-time)
    if (type && type !== 'All') {
      query.type = type.toLowerCase();
    }

    // Filter by location (e.g. remote, hybrid, city name)
    if (location && location !== 'All') {
      query.location = new RegExp(location.trim(), 'i');
    }

    // Filter by skill (e.g. react, javascript, python)
    if (skill && skill !== 'All') {
      query.skills = { $regex: new RegExp(`^${skill.trim()}$`, 'i') };
    }

    // Filter by category (from Week 7 frontend)
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by workType (Remote / Hybrid / On-site)
    if (workType && workType !== 'All') {
      query.workType = workType;
    }

    // Filter by featured
    if (featured === 'true' || featured === true) {
      query.featured = true;
    }

    // Pagination calculations with safe bounds
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * safeLimit;

    // Sorting logic
    let sortOptions = { createdAt: -1 }; // default: newest
    if (sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (sort === 'deadline') {
      sortOptions = { deadline: 1 };
    } else if (sort === 'stipend-high' || sort === 'stipend') {
      sortOptions = { stipendAmount: -1, createdAt: -1 };
    } else if (sort === 'newest') {
      sortOptions = { createdAt: -1 };
    }

    // Execute query with count
    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(safeLimit)
      .populate('postedBy', 'name email companyName role')
      .lean();

    const totalPages = Math.ceil(total / safeLimit) || 1;

    // Send formatted paginated response
    return res.status(200).json({
      success: true,
      page: pageNum,
      limit: safeLimit,
      total,
      totalPages,
      data: jobs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job by ID or slug
// @route   GET /api/jobs/:id
// @access  Public
export const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let job;
    if (mongoose.Types.ObjectId.isValid(id)) {
      job = await Job.findById(id).populate('postedBy', 'name email companyName role');
    }

    // Fallback: look up by custom slug (for Week 7 compatibility e.g. web-development-intern)
    if (!job) {
      job = await Job.findOne({ slug: id }).populate('postedBy', 'name email companyName role');
    }

    if (!job) {
      return sendError(res, 404, 'Job not found');
    }

    return sendSuccess(res, 200, 'Job fetched successfully', job);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private (Recruiter, Admin)
export const createJob = async (req, res, next) => {
  try {
    const {
      title,
      company,
      location,
      workType,
      type,
      category,
      duration,
      stipend,
      stipendAmount,
      skills,
      description,
      shortDescription,
      about,
      responsibilities,
      requirements,
      whoCanApply,
      learning,
      benefits,
      openings,
      featured,
      deadline,
      slug
    } = req.body;

    // Parse stipendAmount if not provided
    let parsedStipendAmount = stipendAmount;
    if (!parsedStipendAmount && stipend) {
      const match = stipend.match(/\d+([,.]\d+)?/g);
      if (match) {
        parsedStipendAmount = parseInt(match.join('').replace(/,/g, ''), 10) || 15000;
      }
    }

    const jobData = {
      title: title.trim(),
      company: company ? company.trim() : req.user.companyName || 'Verified Partner',
      location: location ? location.trim() : 'Remote',
      workType: workType || 'Remote',
      type: type || 'internship',
      category: category || 'Web Development',
      duration: duration || '3 Months',
      stipend: stipend || '₹15,000 / month',
      stipendAmount: parsedStipendAmount || 15000,
      skills: Array.isArray(skills) ? skills : (typeof skills === 'string' ? skills.split(',').map((s) => s.trim()) : []),
      description,
      shortDescription: shortDescription || description.slice(0, 160),
      about: about || description,
      responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
      requirements: Array.isArray(requirements) ? requirements : [],
      whoCanApply: Array.isArray(whoCanApply) ? whoCanApply : [],
      learning: Array.isArray(learning) ? learning : [],
      benefits: Array.isArray(benefits) ? benefits : [],
      openings: openings ? parseInt(openings, 10) : 1,
      featured: Boolean(featured),
      deadline: deadline ? new Date(deadline) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      postedBy: req.user._id,
      slug: slug || `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`
    };

    const newJob = await Job.create(jobData);

    return sendSuccess(res, 201, 'Job created successfully', newJob);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private (Recruiter: only own jobs, Admin: all jobs)
export const updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    let job = mongoose.Types.ObjectId.isValid(id)
      ? await Job.findById(id)
      : await Job.findOne({ slug: id });

    if (!job) {
      return sendError(res, 404, 'Job not found');
    }

    // Role verification: Recruiter can only modify their own job; Admin can modify any
    if (req.user.role !== 'admin' && job.postedBy.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Access denied: you can only update jobs created by you');
    }

    // Process updates
    const updates = { ...req.body };
    if (updates.skills && typeof updates.skills === 'string') {
      updates.skills = updates.skills.split(',').map((s) => s.trim());
    }

    const updatedJob = await Job.findByIdAndUpdate(job._id, updates, {
      returnDocument: 'after',
      runValidators: true
    }).populate('postedBy', 'name email companyName role');

    return sendSuccess(res, 200, 'Job updated successfully', updatedJob);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter: only own jobs, Admin: all jobs)
export const deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    let job = mongoose.Types.ObjectId.isValid(id)
      ? await Job.findById(id)
      : await Job.findOne({ slug: id });

    if (!job) {
      return sendError(res, 404, 'Job not found');
    }

    // Role verification
    if (req.user.role !== 'admin' && job.postedBy.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Access denied: you can only delete jobs created by you');
    }

    // Delete related applications
    await Application.deleteMany({ job: job._id });

    // Delete job
    await Job.findByIdAndDelete(job._id);

    return sendSuccess(res, 200, 'Job deleted successfully');
  } catch (error) {
    next(error);
  }
};

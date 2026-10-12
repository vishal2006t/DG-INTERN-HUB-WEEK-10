import mongoose from 'mongoose';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateApplication = (data) => {
  const errors = [];
  const { jobId, fullName, email, phone, whyInterested } = data || {};

  if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
    // Check if it's a valid ObjectId or custom slug
    if (!jobId || typeof jobId !== 'string' || jobId.trim().length === 0) {
      errors.push('A valid jobId is required');
    }
  }

  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    errors.push('Full name is required and must be at least 2 characters');
  }

  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    errors.push('A valid email address is required');
  }

  if (!phone || typeof phone !== 'string' || phone.trim().length < 7) {
    errors.push('A valid phone number is required');
  }

  if (!whyInterested || typeof whyInterested !== 'string' || whyInterested.trim().length < 10) {
    errors.push('Please explain why you are interested (minimum 10 characters)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateApplicationStatus = (data) => {
  const errors = [];
  const validStatuses = ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'];
  const { status } = data || {};

  if (!status || !validStatuses.includes(status)) {
    errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

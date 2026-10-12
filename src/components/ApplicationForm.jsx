import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Upload, FileText, AlertCircle, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const ApplicationForm = ({ job, isOpen, onClose }) => {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    whyInterested: '',
    resumeFile: null,
    resumeFileName: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Pre-fill user data when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsSubmitted(false);
      setIsSubmitting(false);
      setErrors({});
      if (user) {
        setFormData((prev) => ({
          ...prev,
          fullName: user.name || prev.fullName,
          email: user.email || prev.email,
          phone: user.phone || prev.phone
        }));
      }
    }
  }, [isOpen, job, user]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, resume: 'File size must be under 5MB.' }));
        return;
      }
      setFormData((prev) => ({
        ...prev,
        resumeFile: file,
        resumeFileName: file.name
      }));
      setErrors((prev) => ({ ...prev, resume: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address.';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else if (!/^[0-9+\-\s]{10,15}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please provide a valid phone number (10-15 digits).';
    }
    if (!formData.resumeFileName) {
      newErrors.resume = 'Please upload your resume (PDF or DOCX).';
    }
    if (!formData.whyInterested.trim()) {
      newErrors.whyInterested = 'Please share why you are interested in this internship.';
    } else if (formData.whyInterested.trim().length < 20) {
      newErrors.whyInterested = 'Please write at least 20 characters explaining your interest.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!isAuthenticated) {
      setErrors((prev) => ({
        ...prev,
        submit: 'Please sign in first before applying for an internship opportunity. Click Sign In above to login with 1 click.'
      }));
      return;
    }

    setIsSubmitting(true);
    try {
      await api.applications.apply({
        jobId: job._id || job.id,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        whyInterested: formData.whyInterested,
        resumeFileName: formData.resumeFileName || 'resume.pdf'
      });
      setIsSubmitted(true);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        submit: err.message || 'Unable to submit application at this time.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      whyInterested: '',
      resumeFile: null,
      resumeFileName: ''
    });
    setIsSubmitted(false);
    onClose();
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="application-modal-title"
    >
      <div className="modal-container">
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <span className="modal-eyebrow">Internship Application</span>
            <h3 id="application-modal-title" className="modal-title">
              {job ? job.title : 'Apply for Opportunity'}
            </h3>
            {job && (
              <div className="modal-company-info">
                <Building2 size={14} className="modal-company-icon" />
                <span>{job.company}</span>
                <span className="dot-divider">•</span>
                <span>{job.location}</span>
                <span className="dot-divider">•</span>
                <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>{job.stipend}</span>
              </div>
            )}
          </div>
          <button 
            type="button" 
            className="modal-close-btn" 
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {isSubmitted ? (
            <div className="submission-success-view">
              <div className="success-icon-wrap">
                <CheckCircle2 size={48} className="text-success" />
              </div>
              <h4 className="success-title">Application Submitted Successfully!</h4>
              <p className="success-message">
                Thank you for applying. We will get back to you soon.
              </p>
              <div className="success-details-card">
                <div className="success-detail-row">
                  <span className="detail-label">Internship:</span>
                  <span className="detail-value">{job ? job.title : 'Selected Opportunity'}</span>
                </div>
                <div className="success-detail-row">
                  <span className="detail-label">Company:</span>
                  <span className="detail-value">{job ? job.company : 'Partner Company'}</span>
                </div>
                <div className="success-detail-row">
                  <span className="detail-label">Status:</span>
                  <span className="badge badge-green">Received</span>
                </div>
              </div>
              <p className="success-notice">
                Our student review team will evaluate your profile and contact you via email regarding the next steps.
              </p>
              <button 
                type="button" 
                className="btn btn-primary btn-lg" 
                style={{ width: '100%', marginTop: '1rem' }}
                onClick={handleResetAndClose}
              >
                Done & Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="application-form" noValidate>
              {errors.submit && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                  <AlertCircle size={16} />
                  <span>{errors.submit}</span>
                </div>
              )}
              {/* Full Name */}
              <div className="form-group">
                <label htmlFor="applicant-fullName" className="form-label">
                  Full Name <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  id="applicant-fullName"
                  name="fullName"
                  placeholder="e.g. Rahul Sharma"
                  className={`form-input ${errors.fullName ? 'has-error' : ''}`}
                  value={formData.fullName}
                  onChange={handleChange}
                />
                {errors.fullName && (
                  <span className="form-error-msg">
                    <AlertCircle size={13} /> {errors.fullName}
                  </span>
                )}
              </div>

              {/* Email & Phone */}
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="applicant-email" className="form-label">
                    Email Address <span className="required-star">*</span>
                  </label>
                  <input
                    type="email"
                    id="applicant-email"
                    name="email"
                    placeholder="name@college.edu"
                    className={`form-input ${errors.email ? 'has-error' : ''}`}
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && (
                    <span className="form-error-msg">
                      <AlertCircle size={13} /> {errors.email}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="applicant-phone" className="form-label">
                    Phone Number <span className="required-star">*</span>
                  </label>
                  <input
                    type="tel"
                    id="applicant-phone"
                    name="phone"
                    placeholder="+91 9876543210"
                    className={`form-input ${errors.phone ? 'has-error' : ''}`}
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  {errors.phone && (
                    <span className="form-error-msg">
                      <AlertCircle size={13} /> {errors.phone}
                    </span>
                  )}
                </div>
              </div>

              {/* Resume Upload */}
              <div className="form-group">
                <label className="form-label">
                  Resume Upload (PDF / DOCX) <span className="required-star">*</span>
                </label>
                <div className={`resume-upload-zone ${errors.resume ? 'has-error' : ''}`}>
                  <input
                    type="file"
                    id="resume-file-input"
                    className="file-hidden-input"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="resume-file-input" className="file-upload-label">
                    {formData.resumeFileName ? (
                      <div className="uploaded-file-display">
                        <FileText size={24} className="text-primary" />
                        <div className="uploaded-file-meta">
                          <span className="file-name">{formData.resumeFileName}</span>
                          <span className="file-change-text">Click to change file</span>
                        </div>
                      </div>
                    ) : (
                      <div className="upload-prompt">
                        <Upload size={24} className="upload-icon text-muted" />
                        <span className="upload-text">Choose file or drag & drop here</span>
                        <span className="upload-hint">PDF or DOCX format (Max 5MB)</span>
                      </div>
                    )}
                  </label>
                </div>
                {errors.resume && (
                  <span className="form-error-msg">
                    <AlertCircle size={13} /> {errors.resume}
                  </span>
                )}
              </div>

              {/* Why are you interested in this internship? */}
              <div className="form-group">
                <label htmlFor="applicant-whyInterested" className="form-label">
                  Why are you interested in this internship? <span className="required-star">*</span>
                </label>
                <textarea
                  id="applicant-whyInterested"
                  name="whyInterested"
                  rows={4}
                  placeholder="Tell us about your relevant projects, what excites you about this role, and what skills you hope to contribute or learn..."
                  className={`form-textarea ${errors.whyInterested ? 'has-error' : ''}`}
                  value={formData.whyInterested}
                  onChange={handleChange}
                />
                {errors.whyInterested && (
                  <span className="form-error-msg">
                    <AlertCircle size={13} /> {errors.whyInterested}
                  </span>
                )}
              </div>

              {/* Submit CTA */}
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  id="submit-application-btn"
                >
                  {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;

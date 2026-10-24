import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

const EditJobModal = ({ isOpen, job, onClose, onJobUpdated }) => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    workType: 'Remote',
    category: 'Web Development',
    stipend: '',
    duration: '3 Months',
    openings: 1,
    skills: '',
    description: '',
    status: 'open'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || '',
        company: job.company || '',
        location: job.location || 'Remote',
        workType: job.workType || 'Remote',
        category: job.category || 'Web Development',
        stipend: job.stipend || '₹20,000 / month',
        duration: job.duration || '3 Months',
        openings: job.openings || 1,
        skills: Array.isArray(job.skills) ? job.skills.join(', ') : (job.skills || ''),
        description: job.description || '',
        status: job.status || 'open'
      });
      setError('');
      setSuccess(false);
    }
  }, [job]);

  if (!isOpen || !job) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.company || !formData.description) {
      setError('Title, company, and description are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const skillsArray = typeof formData.skills === 'string'
        ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : formData.skills;

      const payload = {
        ...formData,
        skills: skillsArray,
        openings: parseInt(formData.openings, 10) || 1
      };

      const jobId = job._id || job.id;
      const res = await api.jobs.update(jobId, payload);
      setSuccess(true);
      if (onJobUpdated) onJobUpdated(res.data);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to update job posting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-container" style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div>
            <span className="modal-eyebrow">Recruiter Management</span>
            <h3 className="modal-title">Edit Job Opportunity</h3>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'var(--error-bg, #fee2e2)', color: 'var(--error, #b91c1c)', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'var(--success-bg, #dcfce7)', color: 'var(--success, #15803d)', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
            <CheckCircle2 size={16} />
            <span>Job listing updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="application-form" style={{ gap: '0.9rem' }}>
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label" htmlFor="edit-job-title">Job Title <span className="required-star">*</span></label>
              <input
                id="edit-job-title"
                type="text"
                name="title"
                className="form-input"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="edit-job-company">Company Name <span className="required-star">*</span></label>
              <input
                id="edit-job-company"
                type="text"
                name="company"
                className="form-input"
                value={formData.company}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label" htmlFor="edit-job-worktype">Work Mode</label>
              <select id="edit-job-worktype" name="workType" className="form-input" value={formData.workType} onChange={handleChange}>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="edit-job-category">Category</label>
              <select id="edit-job-category" name="category" className="form-input" value={formData.category} onChange={handleChange}>
                <option value="Web Development">Web Development</option>
                <option value="Python & AI">Python & AI</option>
                <option value="Full Stack Development">Full Stack</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="Data Science & Analytics">Data Science</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="edit-job-status">Listing Status</label>
              <select id="edit-job-status" name="status" className="form-input" value={formData.status} onChange={handleChange}>
                <option value="open">Active / Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label" htmlFor="edit-job-stipend">Stipend</label>
              <input
                id="edit-job-stipend"
                type="text"
                name="stipend"
                className="form-input"
                value={formData.stipend}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="edit-job-duration">Duration</label>
              <input
                id="edit-job-duration"
                type="text"
                name="duration"
                className="form-input"
                value={formData.duration}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-job-skills">Skills (comma separated)</label>
            <input
              id="edit-job-skills"
              type="text"
              name="skills"
              className="form-input"
              value={formData.skills}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-job-desc">Description <span className="required-star">*</span></label>
            <textarea
              id="edit-job-desc"
              name="description"
              className="form-textarea"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditJobModal;

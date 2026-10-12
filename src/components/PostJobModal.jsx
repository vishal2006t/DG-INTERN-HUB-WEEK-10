import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

const PostJobModal = ({ isOpen, onClose, onJobCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: 'Remote (India)',
    workType: 'Remote',
    category: 'Web Development',
    stipend: '₹20,000 / month',
    duration: '3 Months',
    openings: 2,
    skills: 'React, Node.js, JavaScript, CSS',
    description: '',
    featured: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
      const skillsArray = formData.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        ...formData,
        skills: skillsArray,
        openings: parseInt(formData.openings, 10) || 1
      };

      const res = await api.jobs.create(payload);
      setSuccess(true);
      if (onJobCreated) onJobCreated(res.data);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to publish job posting');
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
            <span className="modal-eyebrow">Recruiter Portal</span>
            <h3 className="modal-title">Post New Internship Opportunity</h3>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: '#dcfce7', color: '#15803d', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
            <CheckCircle2 size={16} />
            <span>Internship posted successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="application-form" style={{ gap: '0.9rem' }}>
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label" htmlFor="post-job-title">Job Title <span className="required-star">*</span></label>
              <input
                id="post-job-title"
                type="text"
                name="title"
                className="form-input"
                placeholder="e.g. Backend Node.js Intern"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="post-job-company">Company Name <span className="required-star">*</span></label>
              <input
                id="post-job-company"
                type="text"
                name="company"
                className="form-input"
                placeholder="e.g. Nexora Cloud"
                value={formData.company}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label" htmlFor="post-job-worktype">Work Mode</label>
              <select id="post-job-worktype" name="workType" className="form-input" value={formData.workType} onChange={handleChange}>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="post-job-category">Category</label>
              <select id="post-job-category" name="category" className="form-input" value={formData.category} onChange={handleChange}>
                <option value="Web Development">Web Development</option>
                <option value="Python & AI">Python & AI</option>
                <option value="Full Stack Development">Full Stack</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="Data Science & Analytics">Data Science</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="post-job-openings">Openings</label>
              <input
                id="post-job-openings"
                type="number"
                name="openings"
                className="form-input"
                min="1"
                value={formData.openings}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label" htmlFor="post-job-stipend">Stipend</label>
              <input
                id="post-job-stipend"
                type="text"
                name="stipend"
                className="form-input"
                placeholder="₹20,000 / month"
                value={formData.stipend}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="post-job-duration">Duration</label>
              <input
                id="post-job-duration"
                type="text"
                name="duration"
                className="form-input"
                placeholder="3 Months"
                value={formData.duration}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="post-job-skills">Skills (comma separated)</label>
            <input
              id="post-job-skills"
              type="text"
              name="skills"
              className="form-input"
              placeholder="React, Node.js, MongoDB"
              value={formData.skills}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="post-job-desc">Description <span className="required-star">*</span></label>
            <textarea
              id="post-job-desc"
              name="description"
              className="form-textarea"
              rows={3}
              placeholder="Outline role responsibilities and qualifications..."
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', minHeight: '44px', marginTop: '0.25rem' }} disabled={loading}>
            {loading ? 'Publishing Opportunity...' : 'Publish Internship Opportunity'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostJobModal;

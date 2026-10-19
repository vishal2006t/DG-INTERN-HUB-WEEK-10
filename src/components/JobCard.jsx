import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Banknote, Calendar, ArrowRight } from 'lucide-react';

const JobCard = ({ job = {}, onApply }) => {
  const jobId = job._id || job.id || '';
  const companyName = typeof job.company === 'string' ? job.company : job.company?.name || 'Company';
  const companyInitial = companyName.charAt(0).toUpperCase() || 'C';
  const locationText = job.location || (job.workType === 'Remote' ? 'Remote' : 'India');
  const categoryText = job.category || 'Engineering';
  const isRemote = job.workType === 'Remote' || job.location?.toLowerCase().includes('remote');
  const durationText = job.duration || '3-6 Months';
  
  let stipendText = job.stipend || 'Stipend Provided';
  if (typeof job.stipend === 'object' && job.stipend !== null) {
    if (job.stipend.min && job.stipend.max) {
      stipendText = `₹${job.stipend.min.toLocaleString()} - ₹${job.stipend.max.toLocaleString()} / mo`;
    } else if (job.stipend.min) {
      stipendText = `₹${job.stipend.min.toLocaleString()} / mo`;
    } else {
      stipendText = '₹15,000 - ₹25,000 / mo';
    }
  }

  const postedText = job.postedDate || (job.createdAt ? new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently');
  const descriptionText = job.shortDescription || (job.description ? `${job.description.substring(0, 140)}...` : 'Exciting internship opportunity with hands-on mentoring and verified stipend.');
  const skillsList = Array.isArray(job.skills) ? job.skills : [];

  return (
    <article className="job-card" id={`job-card-${jobId}`}>
      {/* Card Header */}
      <div className="job-card-header">
        <div className="job-card-company-wrap">
          <div className="company-avatar" aria-hidden="true">
            {companyInitial}
          </div>
          <div className="company-info">
            <h4 className="company-name">{companyName}</h4>
            <div className="job-location-wrap">
              <MapPin size={13} className="meta-icon" />
              <span>{locationText}</span>
            </div>
          </div>
        </div>

        <div className="job-card-pills">
          <span className="badge badge-blue">{categoryText}</span>
          {isRemote && (
            <span className="badge badge-green">Remote</span>
          )}
        </div>
      </div>

      {/* Job Title */}
      <h3 className="job-card-title">
        <Link to={`/jobs/${jobId}`} className="job-title-link">
          {job.title}
        </Link>
      </h3>

      {/* Meta Highlights */}
      <div className="job-meta-grid">
        <div className="job-meta-item">
          <Clock size={14} className="meta-icon text-muted" />
          <span>{durationText}</span>
        </div>
        <div className="job-meta-item stipend-highlight">
          <Banknote size={14} className="meta-icon text-success" />
          <span>{stipendText}</span>
        </div>
        <div className="job-meta-item">
          <Calendar size={14} className="meta-icon text-muted" />
          <span>{postedText}</span>
        </div>
      </div>

      {/* Short Description */}
      <p className="job-card-description">
        {descriptionText}
      </p>

      {/* Skill Tags */}
      <div className="job-skills-list">
        {skillsList.slice(0, 4).map((skill, index) => (
          <span key={index} className="skill-tag">
            {skill}
          </span>
        ))}
        {skillsList.length > 4 && (
          <span className="skill-tag skill-tag-more">
            +{skillsList.length - 4} more
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="job-card-actions">
        <Link 
          to={`/jobs/${jobId}`} 
          className="btn btn-secondary btn-sm card-btn-details"
          id={`view-details-${jobId}`}
        >
          View Details
        </Link>
        <button 
          type="button" 
          className="btn btn-primary btn-sm card-btn-apply"
          id={`apply-now-${jobId}`}
          onClick={() => onApply && onApply(job)}
        >
          <span>Apply Now</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </article>
  );
};

export default JobCard;

import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Banknote, Calendar, ArrowRight } from 'lucide-react';

const JobCard = ({ job, onApply }) => {
  return (
    <article className="job-card" id={`job-card-${job.id}`}>
      {/* Card Header */}
      <div className="job-card-header">
        <div className="job-card-company-wrap">
          <div className="company-avatar" aria-hidden="true">
            {job.company.charAt(0)}
          </div>
          <div className="company-info">
            <h4 className="company-name">{job.company}</h4>
            <div className="job-location-wrap">
              <MapPin size={13} className="meta-icon" />
              <span>{job.location}</span>
            </div>
          </div>
        </div>

        <div className="job-card-pills">
          <span className="badge badge-blue">{job.category}</span>
          {job.workType === 'Remote' && (
            <span className="badge badge-green">Remote</span>
          )}
        </div>
      </div>

      {/* Job Title */}
      <h3 className="job-card-title">
        <Link to={`/jobs/${job.id}`} className="job-title-link">
          {job.title}
        </Link>
      </h3>

      {/* Meta Highlights */}
      <div className="job-meta-grid">
        <div className="job-meta-item">
          <Clock size={14} className="meta-icon text-muted" />
          <span>{job.duration}</span>
        </div>
        <div className="job-meta-item stipend-highlight">
          <Banknote size={14} className="meta-icon text-success" />
          <span>{job.stipend}</span>
        </div>
        <div className="job-meta-item">
          <Calendar size={14} className="meta-icon text-muted" />
          <span>{job.postedDate}</span>
        </div>
      </div>

      {/* Short Description */}
      <p className="job-card-description">
        {job.shortDescription}
      </p>

      {/* Skill Tags */}
      <div className="job-skills-list">
        {job.skills.slice(0, 4).map((skill, index) => (
          <span key={index} className="skill-tag">
            {skill}
          </span>
        ))}
        {job.skills.length > 4 && (
          <span className="skill-tag skill-tag-more">
            +{job.skills.length - 4} more
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="job-card-actions">
        <Link 
          to={`/jobs/${job.id}`} 
          className="btn btn-secondary btn-sm card-btn-details"
          id={`view-details-${job.id}`}
        >
          View Details
        </Link>
        <button 
          type="button" 
          className="btn btn-primary btn-sm card-btn-apply"
          id={`apply-now-${job.id}`}
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

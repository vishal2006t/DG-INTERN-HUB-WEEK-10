import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { jobsData } from '../data/jobs';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Share2, 
  GraduationCap, 
  BookOpen, 
  Gift, 
  Users, 
  Check, 
  ArrowRight,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { api } from '../services/api';

const JobDetailsPage = ({ onApplyJob }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [copiedShare, setCopiedShare] = useState(false);
  const [job, setJob] = useState(() => jobsData.find((j) => j.id === id || j.slug === id || j._id === id) || null);
  const [isLoading, setIsLoading] = useState(!job);

  useEffect(() => {
    let isCancelled = false;
    api.jobs.getById(id)
      .then((data) => {
        if (!isCancelled && data) setJob(data);
      })
      .catch((err) => {
        console.warn('Backend job lookup fallback:', err.message);
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });
    return () => { isCancelled = true; };
  }, [id]);

  if (isLoading) {
    return (
      <div className="page-wrapper job-not-found-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader2 size={36} className="spin-icon" style={{ animation: 'spin 1s linear infinite', color: '#1E40AF' }} />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="page-wrapper job-not-found-page">
        <div className="container text-center not-found-container">
          <h2>Internship Not Found</h2>
          <p>The internship opportunity you are looking for does not exist or may have been filled.</p>
          <button 
            type="button" 
            className="btn btn-primary" 
            style={{ marginTop: '1.5rem' }}
            onClick={() => navigate('/jobs')}
          >
            <ArrowLeft size={16} />
            <span>Back to Jobs</span>
          </button>
        </div>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  // Safe attribute fallbacks for MongoDB / API compatibility
  const companyName = typeof job.company === 'string' ? job.company : job.company?.name || 'Company';
  const companyInitial = companyName.charAt(0).toUpperCase() || 'C';
  
  let stipendDisplay = job.stipend || 'Competitive Stipend';
  if (typeof job.stipend === 'object' && job.stipend !== null) {
    if (job.stipend.min && job.stipend.max) {
      stipendDisplay = `₹${job.stipend.min.toLocaleString()} - ₹${job.stipend.max.toLocaleString()} / mo`;
    } else if (job.stipend.min) {
      stipendDisplay = `₹${job.stipend.min.toLocaleString()} / mo`;
    }
  }

  const durationDisplay = job.duration || '3-6 Months';
  const locationDisplay = job.location || (job.workType === 'Remote' ? 'Remote' : 'India');
  const workTypeDisplay = job.workType || 'Remote';
  const categoryDisplay = job.category || 'Tech';
  const postedDisplay = job.postedDate || (job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently');
  const applicantsDisplay = job.applicantsCount || 0;
  const aboutDisplay = job.about || job.description || 'Join our engineering team for a hands-on, high-impact internship.';
  
  const responsibilitiesList = Array.isArray(job.responsibilities) && job.responsibilities.length > 0
    ? job.responsibilities
    : [
        'Develop and maintain modern, accessible features and client components.',
        'Collaborate with product designers and senior software engineers.',
        'Participate in agile sprint ceremonies, code reviews, and testing.'
      ];

  const skillsList = Array.isArray(job.skills) ? job.skills : [];
  
  const requiredSkillsList = Array.isArray(job.requiredSkills) && job.requiredSkills.length > 0
    ? job.requiredSkills
    : (Array.isArray(job.requirements) && job.requirements.length > 0 ? job.requirements : [
        'Strong foundational understanding of core computer science and web concepts.',
        'Familiarity with modern programming workflows and Git version control.',
        'Problem-solving curiosity and eager attitude towards mentorship.'
      ]);

  const whoCanApplyList = Array.isArray(job.whoCanApply) && job.whoCanApply.length > 0
    ? job.whoCanApply
    : [
        'Currently pursuing B.Tech / B.E. / BCA / MCA / B.Sc in related disciplines.',
        'Fresh graduates seeking professional hands-on industry exposure.',
        'Available for continuous internship with dedicated weekly focus.'
      ];

  const whatYoullLearnList = Array.isArray(job.whatYoullLearn) && job.whatYoullLearn.length > 0
    ? job.whatYoullLearn
    : (Array.isArray(job.learning) && job.learning.length > 0 ? job.learning : [
        'Production software development standards and architecture.',
        'Clean code conventions, component design, and automated testing.',
        'Direct 1-on-1 mentorship from industry software architects.'
      ]);

  const benefitsList = Array.isArray(job.benefits) && job.benefits.length > 0
    ? job.benefits
    : [
        `Guaranteed monthly stipend of ${stipendDisplay}.`,
        'Official Certificate of Internship Completion.',
        'Performance-based Letter of Recommendation (LOR) & Pre-Placement Offer (PPO).'
      ];

  const companyOverviewDisplay = job.companyOverview || job.about || `${companyName} is an innovative organization providing impactful digital products.`;

  return (
    <div className="page-wrapper job-details-page">
      {/* Top Breadcrumb & Back bar */}
      <section className="details-top-bar">
        <div className="container">
          <div className="breadcrumbs-row">
            <button 
              type="button" 
              className="btn btn-secondary btn-sm back-to-jobs-btn" 
              onClick={() => navigate('/jobs')}
            >
              <ArrowLeft size={15} />
              <span>Back to Jobs</span>
            </button>
            <div className="breadcrumb-trail">
              <Link to="/">Home</Link>
              <span className="trail-sep">/</span>
              <Link to="/jobs">Jobs</Link>
              <span className="trail-sep">/</span>
              <span className="current-trail">{job.title}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Two-Column Content */}
      <section className="details-main-section">
        <div className="container">
          <div className="details-grid-layout">
            {/* Left Column: Primary Content */}
            <div className="details-main-column">
              {/* Job Header Card */}
              <div className="details-header-card">
                <div className="details-header-top">
                  <div className="company-badge-avatar">
                    {companyInitial}
                  </div>
                  <div className="details-header-meta">
                    <span className="details-company-name">{companyName}</span>
                    <h1 className="details-job-title">{job.title}</h1>
                    <div className="details-meta-tags-row">
                      <span className="badge badge-blue">{categoryDisplay}</span>
                      <span className="badge badge-green">{workTypeDisplay}</span>
                      <span className="badge badge-gray">Posted {postedDisplay}</span>
                    </div>
                  </div>
                </div>

                <div className="details-key-metrics-bar">
                  <div className="metric-box">
                    <span className="metric-label">Monthly Stipend</span>
                    <span className="metric-value text-success">{stipendDisplay}</span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">Duration</span>
                    <span className="metric-value">{durationDisplay}</span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">Location</span>
                    <span className="metric-value">{locationDisplay}</span>
                  </div>
                </div>
              </div>

              {/* About the Internship */}
              <div className="details-section-card">
                <h2 className="details-section-heading">About the Internship</h2>
                <p className="details-body-text">{aboutDisplay}</p>
              </div>

              {/* Responsibilities */}
              <div className="details-section-card">
                <h2 className="details-section-heading">Responsibilities</h2>
                <ul className="details-bullet-list">
                  {responsibilitiesList.map((resp, index) => (
                    <li key={index} className="details-bullet-item">
                      <CheckCircle2 size={18} className="bullet-icon text-primary" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Required Skills */}
              <div className="details-section-card">
                <h2 className="details-section-heading">Required Skills</h2>
                {skillsList.length > 0 && (
                  <div className="details-skills-pills">
                    {skillsList.map((skill, index) => (
                      <span key={index} className="skill-pill-large">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
                <ul className="details-bullet-list" style={{ marginTop: skillsList.length > 0 ? '1.25rem' : '0' }}>
                  {requiredSkillsList.map((req, index) => (
                    <li key={index} className="details-bullet-item">
                      <CheckCircle2 size={18} className="bullet-icon text-muted" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Who Can Apply */}
              <div className="details-section-card">
                <h2 className="details-section-heading">Who Can Apply</h2>
                <ul className="details-bullet-list">
                  {whoCanApplyList.map((item, index) => (
                    <li key={index} className="details-bullet-item">
                      <GraduationCap size={18} className="bullet-icon text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* What You'll Learn */}
              <div className="details-section-card">
                <h2 className="details-section-heading">What You'll Learn</h2>
                <ul className="details-bullet-list">
                  {whatYoullLearnList.map((item, index) => (
                    <li key={index} className="details-bullet-item">
                      <BookOpen size={18} className="bullet-icon text-success" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Benefits */}
              <div className="details-section-card">
                <h2 className="details-section-heading">Benefits</h2>
                <ul className="details-bullet-list">
                  {benefitsList.map((benefit, index) => (
                    <li key={index} className="details-bullet-item">
                      <Gift size={18} className="bullet-icon text-amber" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bottom Navigation Row */}
              <div className="details-bottom-actions-row">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => navigate('/jobs')}
                >
                  <ArrowLeft size={16} />
                  <span>Back to Jobs</span>
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary btn-lg" 
                  onClick={() => onApplyJob(job)}
                >
                  <span>Apply Now</span>
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>

            {/* Right Column: Sticky Summary & Apply Card */}
            <aside className="details-sidebar-column">
              <div className="sticky-sidebar-card">
                <div className="sidebar-apply-header">
                  <div className="sidebar-stipend-wrap">
                    <span className="stipend-label">Offered Stipend</span>
                    <div className="stipend-amount">{stipendDisplay}</div>
                  </div>
                  <span className="badge badge-green">Direct Employer</span>
                </div>

                <div className="sidebar-meta-list">
                  <div className="sidebar-meta-row">
                    <Clock size={16} className="text-muted" />
                    <div className="meta-text-col">
                      <span className="meta-row-label">Duration</span>
                      <span className="meta-row-value">{durationDisplay}</span>
                    </div>
                  </div>

                  <div className="sidebar-meta-row">
                    <MapPin size={16} className="text-muted" />
                    <div className="meta-text-col">
                      <span className="meta-row-label">Location</span>
                      <span className="meta-row-value">{locationDisplay}</span>
                    </div>
                  </div>

                  <div className="sidebar-meta-row">
                    <Users size={16} className="text-muted" />
                    <div className="meta-text-col">
                      <span className="meta-row-label">Applicants</span>
                      <span className="meta-row-value">{applicantsDisplay} students applied</span>
                    </div>
                  </div>

                  <div className="sidebar-meta-row">
                    <Calendar size={16} className="text-muted" />
                    <div className="meta-text-col">
                      <span className="meta-row-label">Start Date</span>
                      <span className="meta-row-value">Immediate (Rolling basis)</span>
                    </div>
                  </div>
                </div>

                {/* Apply Button Primary CTA */}
                <div className="sidebar-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-lg sidebar-apply-btn"
                    id="details-apply-now-btn"
                    onClick={() => onApplyJob(job)}
                  >
                    <span>Apply Now</span>
                    <ArrowRight size={17} />
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary sidebar-back-btn"
                    onClick={() => navigate('/jobs')}
                  >
                    <ArrowLeft size={16} />
                    <span>Back to Jobs</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary sidebar-share-btn"
                    onClick={handleShare}
                  >
                    {copiedShare ? (
                      <>
                        <Check size={16} className="text-success" />
                        <span>Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 size={16} />
                        <span>Share Opportunity</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Employer Verification Note */}
                <div className="sidebar-trust-box">
                  <ShieldCheck size={18} className="text-primary" />
                  <p className="trust-note-text">
                    This internship is verified by DG Interns Hub. Never pay any fee for applying or receiving an offer letter.
                  </p>
                </div>

                {/* Company Snapshot */}
                <div className="sidebar-company-box">
                  <h4 className="company-box-heading">About {companyName}</h4>
                  <p className="company-box-desc">{companyOverviewDisplay}</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
};

export default JobDetailsPage;

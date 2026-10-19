import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Award, 
  Briefcase, 
  Bookmark, 
  ArrowRight, 
  User, 
  Building2, 
  Calendar,
  AlertCircle,
  ExternalLink,
  MapPin,
  Banknote
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSavedJobs } from '../context/SavedJobsContext';
import { api } from '../services/api';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import Button from '../components/Button';

const Dashboard = () => {
  const { user } = useAuth();
  const { savedJobs } = useSavedJobs();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.applications.getMy();
      // res.data contains array of applications
      setApplications(res?.data || []);
    } catch (err) {
      console.warn('Dashboard applications fetch warning:', err.message);
      setError(err.message || 'Unable to load your applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Compute real metrics from backend application data
  const totalApps = applications.length;
  const pendingApps = applications.filter((a) => a.status === 'pending').length;
  const shortlistedApps = applications.filter((a) => a.status === 'shortlisted' || a.status === 'reviewed').length;
  const selectedApps = applications.filter((a) => a.status === 'accepted' || a.status === 'selected').length;
  const rejectedApps = applications.filter((a) => a.status === 'rejected').length;

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
      case 'selected':
        return <span className="badge badge-green">Selected</span>;
      case 'shortlisted':
        return <span className="badge badge-blue">Shortlisted</span>;
      case 'reviewed':
        return <span className="badge badge-blue">Under Review</span>;
      case 'rejected':
        return <span className="badge badge-danger">Not Selected</span>;
      default:
        return <span className="badge badge-amber">Pending</span>;
    }
  };

  return (
    <div className="dashboard-page-container container">
      {/* Welcome Hero Banner */}
      <div className="dashboard-hero-banner">
        <div className="banner-text-content">
          <span className="badge badge-blue mb-2">
            <LayoutDashboard size={13} className="mr-1" />
            Candidate Portal
          </span>
          <h1 className="dashboard-welcome-heading">
            Welcome back, {user?.name || 'Candidate'}!
          </h1>
          <p className="dashboard-welcome-sub">
            Track your job applications, monitor recruiter responses, and manage your career milestones.
          </p>
        </div>
        <div className="banner-actions">
          <Link to="/jobs" className="btn btn-primary" id="dashboard-explore-jobs">
            <Briefcase size={16} />
            <span>Browse New Jobs</span>
          </Link>
          <Link to="/profile" className="btn btn-secondary" id="dashboard-edit-profile">
            <User size={16} />
            <span>Edit Profile</span>
          </Link>
        </div>
      </div>

      {/* Real Statistics KPI Cards */}
      <div className="dashboard-stats-grid">
        <div className="stat-metric-card stat-total">
          <div className="stat-card-icon-bubble bg-blue-subtle text-primary">
            <FileText size={22} />
          </div>
          <div className="stat-card-body">
            <p className="stat-label">Total Applications</p>
            <h3 className="stat-number">{loading ? '...' : totalApps}</h3>
          </div>
        </div>

        <div className="stat-metric-card stat-pending">
          <div className="stat-card-icon-bubble bg-amber-subtle text-warning">
            <Clock size={22} />
          </div>
          <div className="stat-card-body">
            <p className="stat-label">Pending Review</p>
            <h3 className="stat-number">{loading ? '...' : pendingApps}</h3>
          </div>
        </div>

        <div className="stat-metric-card stat-shortlisted">
          <div className="stat-card-icon-bubble bg-indigo-subtle text-indigo">
            <Award size={22} />
          </div>
          <div className="stat-card-body">
            <p className="stat-label">Shortlisted</p>
            <h3 className="stat-number">{loading ? '...' : shortlistedApps}</h3>
          </div>
        </div>

        <div className="stat-metric-card stat-accepted">
          <div className="stat-card-icon-bubble bg-green-subtle text-success">
            <CheckCircle2 size={22} />
          </div>
          <div className="stat-card-body">
            <p className="stat-label">Selected</p>
            <h3 className="stat-number">{loading ? '...' : selectedApps}</h3>
          </div>
        </div>

        <div className="stat-metric-card stat-rejected">
          <div className="stat-card-icon-bubble bg-red-subtle text-danger">
            <XCircle size={22} />
          </div>
          <div className="stat-card-body">
            <p className="stat-label">Rejected</p>
            <h3 className="stat-number">{loading ? '...' : rejectedApps}</h3>
          </div>
        </div>
      </div>

      {/* Main Grid: Applications Table + Saved Jobs Sidebar */}
      <div className="dashboard-content-split">
        {/* Left Column: Recent Applications */}
        <div className="dashboard-main-col">
          <div className="dashboard-section-card">
            <div className="section-card-header">
              <div>
                <h2 className="section-card-title">Recent Applications</h2>
                <p className="section-card-subtitle">Real-time status of your internship and job submissions</p>
              </div>
              <Link to="/applications" className="btn btn-secondary btn-sm" id="view-all-apps-btn">
                <span>View Full Table</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {loading ? (
              <Loader type="skeleton-table" rows={4} />
            ) : error ? (
              <ErrorMessage
                title="Error Loading Applications"
                message={error}
                onRetry={fetchApplications}
              />
            ) : applications.length === 0 ? (
              <div className="dashboard-empty-box">
                <div className="empty-bubble">
                  <FileText size={36} className="text-muted" />
                </div>
                <h4 className="empty-title">No applications submitted yet</h4>
                <p className="empty-desc">
                  Start applying to curated tech internships to see your application progress tracked right here.
                </p>
                <Link to="/jobs" className="btn btn-primary btn-sm mt-3">
                  <span>Explore Open Positions</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="dashboard-data-table" aria-label="Recent Applications Table">
                  <thead>
                    <tr>
                      <th scope="col">Job Title</th>
                      <th scope="col">Company</th>
                      <th scope="col">Applied Date</th>
                      <th scope="col">Status</th>
                      <th scope="col" className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.slice(0, 5).map((app) => {
                      const jobTitle = app.job?.title || 'Position';
                      const companyName = app.job?.company || 'Recruiter';
                      const appliedDate = new Date(app.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      });
                      const jobId = app.job?._id || app.job?.id || app.job?.slug;

                      return (
                        <tr key={app._id} id={`app-row-${app._id}`}>
                          <td>
                            <div className="table-job-title-wrap">
                              <span className="table-primary-text font-semibold">{jobTitle}</span>
                              <span className="table-secondary-text">{app.job?.workType || 'Remote'}</span>
                            </div>
                          </td>
                          <td>
                            <div className="table-company-cell">
                              <Building2 size={14} className="meta-pin-icon" />
                              <span>{companyName}</span>
                            </div>
                          </td>
                          <td>
                            <span className="table-date-text">{appliedDate}</span>
                          </td>
                          <td>{getStatusBadge(app.status)}</td>
                          <td className="text-right">
                            {jobId ? (
                              <Link
                                to={`/jobs/${jobId}`}
                                className="btn btn-secondary btn-sm"
                                title="View original job listing"
                              >
                                View Job
                              </Link>
                            ) : (
                              <span className="text-muted text-sm">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Profile + Saved Jobs */}
        <div className="dashboard-side-col">
          {/* Quick Profile Summary Card */}
          <div className="dashboard-section-card profile-quick-card mb-4">
            <div className="profile-quick-header">
              <div className="profile-avatar-large">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="profile-quick-meta">
                <h4 className="profile-quick-name">{user?.name}</h4>
                <p className="profile-quick-email">{user?.email}</p>
                <span className="badge badge-blue">{user?.role?.toUpperCase()}</span>
              </div>
            </div>

            <div className="profile-quick-body">
              <div className="profile-detail-line">
                <span className="text-muted">Phone:</span>
                <span>{user?.phone || 'Not provided'}</span>
              </div>
              <div className="profile-detail-line">
                <span className="text-muted">Bio:</span>
                <span className="truncate-text">{user?.bio || 'Passionate developer'}</span>
              </div>
              <Link to="/profile" className="btn btn-outline-primary btn-sm w-full mt-3">
                Manage Full Profile
              </Link>
            </div>
          </div>

          {/* Saved Jobs Card */}
          <div className="dashboard-section-card saved-jobs-widget">
            <div className="section-card-header">
              <h3 className="section-card-title flex items-center gap-2">
                <Bookmark size={16} className="text-primary" />
                <span>Saved Roles ({savedJobs.length})</span>
              </h3>
            </div>

            {savedJobs.length === 0 ? (
              <div className="saved-empty-state">
                <p className="text-muted text-sm">You haven't bookmarked any jobs yet.</p>
                <Link to="/jobs" className="text-primary text-sm font-medium mt-1 inline-block">
                  Browse opportunities →
                </Link>
              </div>
            ) : (
              <div className="saved-jobs-mini-list">
                {savedJobs.slice(0, 4).map((job) => (
                  <div key={job._id || job.id} className="saved-mini-item">
                    <div className="saved-mini-info">
                      <Link to={`/jobs/${job._id || job.id}`} className="saved-mini-title">
                        {job.title}
                      </Link>
                      <p className="saved-mini-company">{job.company} • {job.stipend || 'Competitive'}</p>
                    </div>
                    <Link to={`/jobs/${job._id || job.id}`} className="saved-mini-arrow">
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Building2, 
  MapPin, 
  Calendar, 
  Trash2, 
  ExternalLink, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Filter,
  Eye,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import Button from '../components/Button';
import Modal from '../components/Modal';

const Applications = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedApp, setSelectedApp] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [appToWithdraw, setAppToWithdraw] = useState(null);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.applications.getMy();
      setApplications(res?.data || []);
    } catch (err) {
      setError(err.message || 'Unable to load applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdrawConfirm = async () => {
    if (!appToWithdraw) return;
    setWithdrawing(true);
    try {
      await api.applications.delete(appToWithdraw._id);
      success('Application withdrawn successfully');
      setApplications((prev) => prev.filter((a) => a._id !== appToWithdraw._id));
      setIsWithdrawModalOpen(false);
      setAppToWithdraw(null);
    } catch (err) {
      toastError(err.message || 'Failed to withdraw application');
    } finally {
      setWithdrawing(false);
    }
  };

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

  // Filter & Search Logic
  const filteredApps = applications.filter((app) => {
    const matchesStatus = 
      statusFilter === 'All' ? true : app.status?.toLowerCase() === statusFilter.toLowerCase();
    
    const title = app.job?.title?.toLowerCase() || '';
    const company = app.job?.company?.toLowerCase() || '';
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = query === '' || title.includes(query) || company.includes(query);

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="applications-page-container container">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <span className="badge badge-blue mb-2">My Career Tracking</span>
          <h1 className="page-title">Submitted Applications</h1>
          <p className="page-subtitle">
            Review your internship applications, interview progress, and recruiter updates.
          </p>
        </div>
        <Link to="/jobs" className="btn btn-primary" id="apps-browse-more">
          <span>Apply to More Jobs</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="applications-filter-bar">
        {/* Status Tabs */}
        <div className="status-tabs-list" role="tablist">
          {['All', 'pending', 'shortlisted', 'accepted', 'rejected'].map((st) => (
            <button
              key={st}
              type="button"
              className={`status-tab-btn ${statusFilter === st ? 'is-active' : ''}`}
              onClick={() => setStatusFilter(st)}
              role="tab"
              aria-selected={statusFilter === st}
            >
              {st === 'All' ? 'All Applications' : st.charAt(0).toUpperCase() + st.slice(1)}
              <span className="tab-count-badge">
                {st === 'All' 
                  ? applications.length 
                  : applications.filter((a) => a.status === st).length}
              </span>
            </button>
          ))}
        </div>

        {/* Search inside applications */}
        <div className="app-search-wrap">
          <Search size={16} className="app-search-icon text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by job title or company..."
            className="app-search-input"
            aria-label="Search my applications"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <Loader type="skeleton-table" rows={5} />
      ) : error ? (
        <ErrorMessage
          title="Failed to Load Applications"
          message={error}
          onRetry={fetchApplications}
        />
      ) : filteredApps.length === 0 ? (
        <div className="dashboard-empty-box py-12">
          <div className="empty-bubble">
            <FileText size={40} className="text-muted" />
          </div>
          <h3 className="empty-title">
            {applications.length === 0 
              ? 'No applications found' 
              : 'No applications match your filter'}
          </h3>
          <p className="empty-desc">
            {applications.length === 0 
              ? 'Explore our curated list of tech internships and start applying today!'
              : 'Try clearing your status filter or search query to view all applications.'}
          </p>
          {applications.length === 0 ? (
            <Link to="/jobs" className="btn btn-primary mt-4">
              Browse Open Positions
            </Link>
          ) : (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => { setStatusFilter('All'); setSearchQuery(''); }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="applications-table-card">
          <div className="table-responsive">
            <table className="dashboard-data-table" aria-label="Candidate Applications List">
              <thead>
                <tr>
                  <th scope="col">Position & Company</th>
                  <th scope="col">Work Type & Stipend</th>
                  <th scope="col">Applied Date</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app) => {
                  const jobTitle = app.job?.title || 'Internship Position';
                  const companyName = app.job?.company || 'Verified Partner';
                  const appliedDate = new Date(app.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });
                  const jobId = app.job?._id || app.job?.id || app.job?.slug;

                  return (
                    <tr key={app._id} id={`application-item-${app._id}`}>
                      <td>
                        <div className="app-table-role-wrap">
                          <Link to={`/jobs/${jobId}`} className="app-role-link">
                            {jobTitle}
                          </Link>
                          <div className="app-company-line">
                            <Building2 size={13} className="meta-pin-icon" />
                            <span>{companyName}</span>
                            <span className="dot-divider">•</span>
                            <MapPin size={13} className="meta-pin-icon" />
                            <span>{app.job?.location || 'Remote'}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="app-meta-stack">
                          <span className="text-sm font-medium">{app.job?.stipend || 'Competitive'}</span>
                          <span className="badge badge-gray text-xs">{app.job?.workType || 'Remote'}</span>
                        </div>
                      </td>

                      <td>
                        <span className="text-sm text-muted">{appliedDate}</span>
                      </td>

                      <td>{getStatusBadge(app.status)}</td>

                      <td className="text-right">
                        <div className="action-buttons-group">
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setSelectedApp(app);
                              setIsDetailModalOpen(true);
                            }}
                            title="View your application details"
                            id={`view-app-btn-${app._id}`}
                          >
                            <Eye size={14} />
                            <span>Details</span>
                          </button>

                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => {
                              setAppToWithdraw(app);
                              setIsWithdrawModalOpen(true);
                            }}
                            title="Withdraw application"
                            id={`withdraw-app-btn-${app._id}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Application Details Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Application Submission Details"
        subtitle={selectedApp?.job ? `${selectedApp.job.title} at ${selectedApp.job.company}` : ''}
        size="lg"
      >
        {selectedApp && (
          <div className="app-details-modal-content">
            <div className="details-info-grid">
              <div className="info-block">
                <span className="info-label">Candidate Name</span>
                <span className="info-value">{selectedApp.fullName}</span>
              </div>
              <div className="info-block">
                <span className="info-label">Email Address</span>
                <span className="info-value">{selectedApp.email}</span>
              </div>
              <div className="info-block">
                <span className="info-label">Contact Phone</span>
                <span className="info-value">{selectedApp.phone}</span>
              </div>
              <div className="info-block">
                <span className="info-label">Submission Date</span>
                <span className="info-value">
                  {new Date(selectedApp.createdAt).toLocaleDateString('en-US', {
                    dateStyle: 'long'
                  })}
                </span>
              </div>
            </div>

            <div className="details-block mt-4">
              <span className="info-label">Current Status</span>
              <div className="mt-1">{getStatusBadge(selectedApp.status)}</div>
            </div>

            {selectedApp.notes && (
              <div className="details-block alert-callout alert-info mt-4">
                <span className="info-label">Recruiter Review Notes:</span>
                <p className="text-sm mt-1">{selectedApp.notes}</p>
              </div>
            )}

            <div className="details-block mt-4">
              <span className="info-label">Cover Letter / Statement of Interest</span>
              <div className="cover-letter-box">
                {selectedApp.whyInterested}
              </div>
            </div>

            <div className="details-block mt-4">
              <span className="info-label">Attached Resume</span>
              <div className="resume-attachment-card">
                <FileCheck size={20} className="text-primary" />
                <div className="resume-name-wrap">
                  <span className="font-semibold text-sm">{selectedApp.resumeFileName || 'resume.pdf'}</span>
                  <span className="text-xs text-muted">Verified Document</span>
                </div>
                {selectedApp.resumeUrl && (
                  <a
                    href={selectedApp.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                  >
                    <ExternalLink size={14} />
                    <span>View File</span>
                  </a>
                )}
              </div>
            </div>

            <div className="modal-actions-footer mt-6">
              <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
              {selectedApp.job && (
                <Link to={`/jobs/${selectedApp.job._id || selectedApp.job.id || selectedApp.job.slug}`} className="btn btn-primary">
                  View Job Details
                </Link>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Withdraw Confirmation Modal */}
      <Modal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        title="Withdraw Application?"
        size="sm"
      >
        <div className="withdraw-modal-body">
          <p className="text-secondary">
            Are you sure you want to withdraw your application for{' '}
            <strong>{appToWithdraw?.job?.title}</strong> at{' '}
            <strong>{appToWithdraw?.job?.company}</strong>?
          </p>
          <p className="text-muted text-sm mt-2">
            This action will notify the hiring team and remove your application from their candidate pipeline.
          </p>

          <div className="modal-actions-footer mt-6">
            <Button
              variant="secondary"
              onClick={() => setIsWithdrawModalOpen(false)}
              disabled={withdrawing}
            >
              Keep Application
            </Button>
            <Button
              variant="danger"
              loading={withdrawing}
              onClick={handleWithdrawConfirm}
              id="confirm-withdraw-btn"
            >
              Withdraw Application
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Applications;

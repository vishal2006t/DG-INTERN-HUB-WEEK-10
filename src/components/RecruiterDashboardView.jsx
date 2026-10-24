import React, { useState, useEffect, useCallback } from 'react';
import { 
  Briefcase, 
  Users, 
  Clock, 
  Award, 
  CheckCircle2, 
  PlusCircle, 
  Download, 
  FileText, 
  Building2, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Eye 
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import Loader from './Loader';
import ErrorMessage from './ErrorMessage';
import EditJobModal from './EditJobModal';
import Modal from './Modal';

const RecruiterDashboardView = ({ user, onOpenPostJob }) => {
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'applicants'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplicants: 0,
    pending: 0,
    shortlisted: 0,
    accepted: 0,
    rejected: 0
  });

  // Filters for applicants tab
  const [selectedJobFilter, setSelectedJobFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [editingJob, setEditingJob] = useState(null);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [viewingApp, setViewingApp] = useState(null);
  const [exporting, setExporting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.applications.getRecruiter();
      if (res?.data) {
        setJobs(res.data.jobs || []);
        setApplications(res.data.applications || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load recruiter data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // CSV Export
  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const response = await api.applications.exportCSV();
      // Create download blob link
      const blob = new Blob([response.data || response], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `recruiter-applications-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      success('Applications exported to CSV successfully');
    } catch (err) {
      toastError(err.message || 'Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  // Job deletion
  const handleDeleteJobConfirm = async () => {
    if (!jobToDelete) return;
    setDeleting(true);
    try {
      await api.jobs.delete(jobToDelete._id);
      success(`Job "${jobToDelete.title}" removed successfully`);
      setIsDeleteModalOpen(false);
      setJobToDelete(null);
      fetchData();
    } catch (err) {
      toastError(err.message || 'Failed to delete job');
    } finally {
      setDeleting(false);
    }
  };

  // Status update
  const handleStatusChange = async (appId, newStatus) => {
    try {
      await api.applications.updateStatus(appId, { status: newStatus });
      success(`Application marked as ${newStatus.toUpperCase()}`);
      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
      );
      // Recalculate stats
      fetchData();
    } catch (err) {
      toastError(err.message || 'Could not update applicant status');
    }
  };

  // Filter applicants
  const filteredApplicants = applications.filter((app) => {
    const matchesJob = selectedJobFilter === 'All' || app.job?._id === selectedJobFilter;
    const matchesStatus = statusFilter === 'All' || app.status?.toLowerCase() === statusFilter.toLowerCase();
    const s = searchQuery.toLowerCase();
    const matchesSearch =
      !s ||
      app.fullName?.toLowerCase().includes(s) ||
      app.email?.toLowerCase().includes(s) ||
      app.job?.title?.toLowerCase().includes(s);

    return matchesJob && matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return <span className="badge badge-green">Accepted</span>;
      case 'shortlisted':
        return <span className="badge badge-blue">Shortlisted</span>;
      case 'reviewed':
        return <span className="badge badge-blue">Under Review</span>;
      case 'rejected':
        return <span className="badge badge-danger">Rejected</span>;
      default:
        return <span className="badge badge-amber">Pending</span>;
    }
  };

  return (
    <div className="recruiter-dashboard-view">
      {/* Welcome Banner */}
      <div className="dashboard-hero-banner">
        <div className="banner-text-content">
          <span className="badge badge-blue mb-2">
            <Building2 size={13} className="mr-1" />
            Recruiter Workspace
          </span>
          <h1 className="dashboard-welcome-heading">
            Welcome back, {user?.name || 'Recruiter'}!
          </h1>
          <p className="dashboard-welcome-sub">
            Manage your posted internship opportunities, evaluate candidate submissions, and update application statuses.
          </p>
        </div>
        <div className="banner-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenPostJob}
            id="recruiter-post-job-btn"
          >
            <PlusCircle size={16} />
            <span>Post New Internship</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExportCSV}
            disabled={exporting || applications.length === 0}
            title="Download applicant submissions as CSV spreadsheet"
          >
            <Download size={16} />
            <span>{exporting ? 'Exporting...' : 'Export Applications (CSV)'}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="dashboard-stats-grid">
        <div className="stat-metric-card stat-total">
          <div className="stat-card-icon-bubble bg-blue-subtle text-primary">
            <Briefcase size={22} />
          </div>
          <div className="stat-card-body">
            <p className="stat-label">Total Jobs Posted</p>
            <h3 className="stat-number">{loading ? '...' : stats.totalJobs}</h3>
          </div>
        </div>

        <div className="stat-metric-card stat-shortlisted">
          <div className="stat-card-icon-bubble bg-indigo-subtle text-indigo">
            <Users size={22} />
          </div>
          <div className="stat-card-body">
            <p className="stat-label">Total Applicants</p>
            <h3 className="stat-number">{loading ? '...' : stats.totalApplicants}</h3>
          </div>
        </div>

        <div className="stat-metric-card stat-pending">
          <div className="stat-card-icon-bubble bg-amber-subtle text-warning">
            <Clock size={22} />
          </div>
          <div className="stat-card-body">
            <p className="stat-label">Pending Review</p>
            <h3 className="stat-number">{loading ? '...' : stats.pending}</h3>
          </div>
        </div>

        <div className="stat-metric-card stat-shortlisted">
          <div className="stat-card-icon-bubble bg-blue-subtle text-primary">
            <Award size={22} />
          </div>
          <div className="stat-card-body">
            <p className="stat-label">Shortlisted</p>
            <h3 className="stat-number">{loading ? '...' : stats.shortlisted}</h3>
          </div>
        </div>

        <div className="stat-metric-card stat-accepted">
          <div className="stat-card-icon-bubble bg-green-subtle text-success">
            <CheckCircle2 size={22} />
          </div>
          <div className="stat-card-body">
            <p className="stat-label">Accepted / Selected</p>
            <h3 className="stat-number">{loading ? '...' : stats.accepted}</h3>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light, #e2e8f0)', paddingBottom: '0.5rem' }}>
        <button
          type="button"
          className={`btn ${activeTab === 'jobs' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('jobs')}
        >
          <Briefcase size={15} />
          <span>My Posted Jobs ({jobs.length})</span>
        </button>
        <button
          type="button"
          className={`btn ${activeTab === 'applicants' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('applicants')}
        >
          <Users size={15} />
          <span>Candidate Applications ({applications.length})</span>
        </button>
      </div>

      {loading ? (
        <Loader type="skeleton-table" rows={5} />
      ) : error ? (
        <ErrorMessage title="Failed to Load Data" message={error} onRetry={fetchData} />
      ) : activeTab === 'jobs' ? (
        /* Tab 1: Posted Jobs */
        <div className="dashboard-section-card">
          <div className="section-card-header">
            <div>
              <h2 className="section-card-title">My Posted Opportunities</h2>
              <p className="section-card-subtitle">Active and closed internship listings published under your account</p>
            </div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onOpenPostJob}>
              <PlusCircle size={14} />
              <span>New Job</span>
            </button>
          </div>

          {jobs.length === 0 ? (
            <div className="dashboard-empty-box" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
              <Briefcase size={40} className="text-muted" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <h4>No internship postings published yet</h4>
              <p style={{ maxWidth: '420px', margin: '0.5rem auto 1.5rem', color: 'var(--text-muted, #64748b)' }}>
                Create your first job listing to start receiving applications from qualified student developers and freshers.
              </p>
              <button type="button" className="btn btn-primary btn-sm" onClick={onOpenPostJob}>
                <PlusCircle size={15} />
                <span>Post Your First Job</span>
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="dashboard-data-table" aria-label="Posted Jobs Table">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Category</th>
                    <th>Mode</th>
                    <th>Openings</th>
                    <th>Applicants</th>
                    <th>Status</th>
                    <th>Posted</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((j) => (
                    <tr key={j._id}>
                      <td>
                        <span className="font-semibold text-primary">{j.title}</span>
                      </td>
                      <td>
                        <span className="badge badge-blue">{j.category}</span>
                      </td>
                      <td>{j.workType}</td>
                      <td>{j.openings || 1}</td>
                      <td>
                        <button
                          type="button"
                          className="badge badge-green"
                          style={{ cursor: 'pointer', border: 'none' }}
                          onClick={() => {
                            setSelectedJobFilter(j._id);
                            setActiveTab('applicants');
                          }}
                          title="View applicants for this role"
                        >
                          {j.applicantsCount || 0} Applicants
                        </button>
                      </td>
                      <td>
                        <span className={`badge ${j.status === 'open' ? 'badge-green' : 'badge-danger'}`}>
                          {j.status === 'open' ? 'Active' : 'Closed'}
                        </span>
                      </td>
                      <td>{new Date(j.createdAt).toLocaleDateString()}</td>
                      <td className="text-right">
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setSelectedJobFilter(j._id);
                              setActiveTab('applicants');
                            }}
                            title="Review Applicants"
                          >
                            <Users size={13} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => setEditingJob(j)}
                            title="Edit Job Posting"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ color: 'var(--error, #ef4444)' }}
                            onClick={() => {
                              setJobToDelete(j);
                              setIsDeleteModalOpen(true);
                            }}
                            title="Delete Job"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Tab 2: Candidate Applications */
        <div className="dashboard-section-card">
          <div className="section-card-header">
            <div>
              <h2 className="section-card-title">Candidate Applications</h2>
              <p className="section-card-subtitle">Review resumes, view statements, and advance candidates through recruitment stages</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem', alignItems: 'center' }}>
            <div style={{ flex: '1 1 200px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search candidate name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ height: '38px', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <select
                className="form-input"
                value={selectedJobFilter}
                onChange={(e) => setSelectedJobFilter(e.target.value)}
                style={{ height: '38px', fontSize: '0.85rem' }}
                aria-label="Filter by Job"
              >
                <option value="All">All Jobs ({jobs.length})</option>
                {jobs.map((j) => (
                  <option key={j._id} value={j._id}>
                    {j.title}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {['All', 'pending', 'shortlisted', 'accepted', 'rejected'].map((st) => (
                <button
                  key={st}
                  type="button"
                  className={`btn ${statusFilter.toLowerCase() === st.toLowerCase() ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  onClick={() => setStatusFilter(st)}
                  style={{ textTransform: 'capitalize', fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {filteredApplicants.length === 0 ? (
            <div className="dashboard-empty-box" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
              <Users size={36} className="text-muted" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <h4>No matching applications found</h4>
              <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.875rem' }}>
                Try adjusting your filters or search keywords.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="dashboard-data-table" aria-label="Candidate Applications Table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Applied Position</th>
                    <th>Applied Date</th>
                    <th>Resume</th>
                    <th>Status</th>
                    <th>Update Status</th>
                    <th className="text-right">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplicants.map((app) => (
                    <tr key={app._id}>
                      <td>
                        <div className="table-job-title-wrap">
                          <span className="table-primary-text font-semibold">{app.fullName}</span>
                          <span className="table-secondary-text">{app.email} • {app.phone}</span>
                        </div>
                      </td>
                      <td>
                        <span className="font-semibold text-primary">{app.job?.title || 'Job'}</span>
                      </td>
                      <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                      <td>
                        {app.resumeUrl ? (
                          <a
                            href={app.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}
                          >
                            <FileText size={12} />
                            <span>PDF</span>
                            <ExternalLink size={10} />
                          </a>
                        ) : (
                          <span className="text-muted text-sm">{app.resumeFileName || 'PDF Attached'}</span>
                        )}
                      </td>
                      <td>{getStatusBadge(app.status)}</td>
                      <td>
                        <select
                          className="form-input"
                          value={app.status || 'pending'}
                          onChange={(e) => handleStatusChange(app._id, e.target.value)}
                          style={{
                            height: '32px',
                            padding: '0.2rem 0.5rem',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            borderRadius: '6px'
                          }}
                          aria-label={`Update status for ${app.fullName}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="reviewed">Under Review</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="accepted">Accepted / Selected</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="text-right">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setViewingApp(app)}
                          title="View Statement & Details"
                        >
                          <Eye size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Edit Job Modal */}
      {editingJob && (
        <EditJobModal
          isOpen={!!editingJob}
          job={editingJob}
          onClose={() => setEditingJob(null)}
          onJobUpdated={() => {
            fetchData();
            setEditingJob(null);
          }}
        />
      )}

      {/* Delete Job Confirmation Modal */}
      {isDeleteModalOpen && jobToDelete && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setJobToDelete(null);
          }}
          title="Delete Job Posting"
        >
          <div style={{ padding: '0.5rem 0' }}>
            <p style={{ color: 'var(--text-primary, #0f172a)', fontSize: '0.95rem', marginBottom: '1rem' }}>
              Are you sure you want to permanently delete <strong>"{jobToDelete.title}"</strong>?
            </p>
            <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              This will remove the listing and all associated candidate applications from the portal. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteJobConfirm}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Job Posting'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* View Applicant Statement Modal */}
      {viewingApp && (
        <Modal
          isOpen={!!viewingApp}
          onClose={() => setViewingApp(null)}
          title={`Application Details — ${viewingApp.fullName}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', fontWeight: 600 }}>Applied For</span>
              <p style={{ fontWeight: 600, margin: '0.2rem 0', color: 'var(--text-primary, #0f172a)' }}>
                {viewingApp.job?.title} ({viewingApp.job?.workType || 'Remote'})
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', fontWeight: 600 }}>Email</span>
                <p style={{ margin: '0.2rem 0' }}>{viewingApp.email}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', fontWeight: 600 }}>Phone</span>
                <p style={{ margin: '0.2rem 0' }}>{viewingApp.phone}</p>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', fontWeight: 600 }}>Why Interested & Qualifications</span>
              <div
                style={{
                  marginTop: '0.35rem',
                  padding: '0.85rem',
                  background: 'var(--bg-surface, #f8fafc)',
                  border: '1px solid var(--border-light, #e2e8f0)',
                  borderRadius: '8px',
                  lineHeight: 1.5,
                  color: 'var(--text-secondary, #334155)',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {viewingApp.whyInterested}
              </div>
            </div>

            {viewingApp.resumeUrl && (
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', fontWeight: 600 }}>Resume Document</span>
                <div style={{ marginTop: '0.35rem' }}>
                  <a
                    href={viewingApp.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <FileText size={14} />
                    <span>View / Download Resume PDF</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', borderTop: '1px solid var(--border-light, #e2e8f0)', paddingTop: '0.75rem' }}>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setViewingApp(null)}>
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default RecruiterDashboardView;

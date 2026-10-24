import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Users,
  Briefcase,
  FileText,
  UserCheck,
  Building,
  Download,
  Trash2,
  Edit3,
  Activity
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import Loader from './Loader';
import ErrorMessage from './ErrorMessage';
import Modal from './Modal';
import EditJobModal from './EditJobModal';

const AdminDashboardView = ({ user }) => {
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'jobs'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Platform Analytics State
  const [analytics, setAnalytics] = useState(null);

  // User Management State
  const [users, setUsers] = useState([]);
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);

  // Job Moderation State
  const [jobs, setJobs] = useState([]);
  const [jobSearch, setJobSearch] = useState('');
  const [editingJob, setEditingJob] = useState(null);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [isDeleteJobModalOpen, setIsDeleteJobModalOpen] = useState(false);
  const [deletingJob, setDeletingJob] = useState(false);

  const [exporting, setExporting] = useState(false);

  // Fetch Analytics
  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await api.analytics.getAdmin();
      if (res?.data) {
        setAnalytics(res.data);
      }
    } catch (err) {
      console.warn('Analytics fetch error:', err.message);
      setError(err.message || 'Unable to load platform analytics');
    }
  }, []);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.users.getAllAdmin({
        role: userRoleFilter,
        search: userSearch,
        page: userPage,
        limit: 15
      });
      if (res?.data) {
        setUsers(res.data.users || []);
        setUserTotalPages(res.data.totalPages || 1);
        setTotalUsersCount(res.data.total || 0);
      }
    } catch (err) {
      console.warn('Users fetch error:', err.message);
    }
  }, [userRoleFilter, userSearch, userPage]);

  // Fetch Jobs for moderation
  const fetchJobs = useCallback(async () => {
    try {
      const res = await api.jobs.getAll({ search: jobSearch, limit: 30 });
      if (res?.data) {
        setJobs(res.data || []);
      }
    } catch (err) {
      console.warn('Jobs moderation fetch error:', err.message);
    }
  }, [jobSearch]);

  const loadAllAdminData = useCallback(async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchAnalytics(), fetchUsers(), fetchJobs()]);
    setLoading(false);
  }, [fetchAnalytics, fetchUsers, fetchJobs]);

  useEffect(() => {
    loadAllAdminData();
  }, [loadAllAdminData]);

  // CSV Export for Admin
  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const response = await api.applications.exportCSV();
      const blob = new Blob([response.data || response], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `platform-all-applications-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      success('Platform applications exported to CSV successfully');
    } catch (err) {
      toastError(err.message || 'Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  // Change user role
  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.users.updateRoleAdmin(userId, newRole);
      success(`User role updated to ${newRole}`);
      fetchUsers();
      fetchAnalytics();
    } catch (err) {
      toastError(err.message || 'Failed to update user role');
    }
  };

  // Delete user
  const handleDeleteUserConfirm = async () => {
    if (!userToDelete) return;
    setDeletingUser(true);
    try {
      await api.users.deleteAdmin(userToDelete._id);
      success(`User ${userToDelete.name} removed successfully`);
      setIsDeleteUserModalOpen(false);
      setUserToDelete(null);
      fetchUsers();
      fetchAnalytics();
    } catch (err) {
      toastError(err.message || 'Failed to delete user');
    } finally {
      setDeletingUser(false);
    }
  };

  // Delete job
  const handleDeleteJobConfirm = async () => {
    if (!jobToDelete) return;
    setDeletingJob(true);
    try {
      await api.jobs.delete(jobToDelete._id);
      success(`Job "${jobToDelete.title}" removed successfully`);
      setIsDeleteJobModalOpen(false);
      setJobToDelete(null);
      fetchJobs();
      fetchAnalytics();
    } catch (err) {
      toastError(err.message || 'Failed to delete job');
    } finally {
      setDeletingJob(false);
    }
  };

  return (
    <div className="admin-dashboard-view">
      {/* Welcome Banner */}
      <div className="dashboard-hero-banner">
        <div className="banner-text-content">
          <span className="badge badge-amber mb-2" style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
            <Shield size={13} className="mr-1" />
            System Administration
          </span>
          <h1 className="dashboard-welcome-heading">
            Admin Control Center, {user?.name || 'Administrator'}
          </h1>
          <p className="dashboard-welcome-sub">
            Real-time platform metrics, user directory controls, job moderation, and system health status.
          </p>
        </div>
        <div className="banner-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExportCSV}
            disabled={exporting}
            title="Download complete platform application dataset as CSV"
          >
            <Download size={16} />
            <span>{exporting ? 'Exporting...' : 'Export All Applications (CSV)'}</span>
          </button>
        </div>
      </div>

      {/* Real Statistics KPI Cards */}
      <div className="dashboard-stats-grid">
        <div className="stat-metric-card stat-total">
          <div className="stat-card-icon-bubble bg-blue-subtle text-primary">
            <Users size={22} />
          </div>
          <div className="stat-card-body">
            <p className="stat-label">Total Users</p>
            <h3 className="stat-number">{loading ? '...' : analytics?.users?.total || 0}</h3>
          </div>
        </div>

        <div className="stat-metric-card stat-shortlisted">
          <div className="stat-card-icon-bubble bg-indigo-subtle text-indigo">
            <UserCheck size={22} />
          </div>
          <div className="stat-card-body">
            <p className="stat-label">Candidates</p>
            <h3 className="stat-number">{loading ? '...' : analytics?.users?.candidates || 0}</h3>
          </div>
        </div>

        <div className="stat-metric-card stat-pending">
          <div className="stat-card-icon-bubble bg-amber-subtle text-warning">
            <Building size={22} />
          </div>
          <div className="stat-card-body">
            <p className="stat-label">Recruiters</p>
            <h3 className="stat-number">{loading ? '...' : analytics?.users?.recruiters || 0}</h3>
          </div>
        </div>

        <div className="stat-metric-card stat-accepted">
          <div className="stat-card-icon-bubble bg-green-subtle text-success">
            <Briefcase size={22} />
          </div>
          <div className="stat-card-body">
            <p className="stat-label">Total Jobs</p>
            <h3 className="stat-number">{loading ? '...' : analytics?.jobs?.total || 0}</h3>
          </div>
        </div>

        <div className="stat-metric-card stat-rejected">
          <div className="stat-card-icon-bubble bg-blue-subtle text-primary">
            <FileText size={22} />
          </div>
          <div className="stat-card-body">
            <p className="stat-label">Total Applications</p>
            <h3 className="stat-number">{loading ? '...' : analytics?.applications?.total || 0}</h3>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light, #e2e8f0)', paddingBottom: '0.5rem' }}>
        <button
          type="button"
          className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('overview')}
        >
          <Activity size={15} />
          <span>Platform Overview</span>
        </button>
        <button
          type="button"
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={15} />
          <span>User Directory ({totalUsersCount})</span>
        </button>
        <button
          type="button"
          className={`btn ${activeTab === 'jobs' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('jobs')}
        >
          <Briefcase size={15} />
          <span>Job Moderation ({jobs.length})</span>
        </button>
      </div>

      {loading ? (
        <Loader type="skeleton-table" rows={6} />
      ) : error ? (
        <ErrorMessage title="Error Loading Admin Data" message={error} onRetry={loadAllAdminData} />
      ) : activeTab === 'overview' ? (
        /* Tab 1: Overview & Breakdown */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {/* Application Funnel Card */}
            <div className="dashboard-section-card">
              <h3 className="section-card-title" style={{ fontSize: '1rem', marginBottom: '1rem' }}>
                Application Pipeline Funnel
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #475569)' }}>Pending Review:</span>
                  <span className="badge badge-amber">{analytics?.applications?.pending || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #475569)' }}>Shortlisted / Interviewing:</span>
                  <span className="badge badge-blue">{analytics?.applications?.shortlisted || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #475569)' }}>Selected / Offers:</span>
                  <span className="badge badge-green">{analytics?.applications?.accepted || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #475569)' }}>Rejected / Closed:</span>
                  <span className="badge badge-danger">{analytics?.applications?.rejected || 0}</span>
                </div>
              </div>
            </div>

            {/* Job Distribution by Category */}
            <div className="dashboard-section-card">
              <h3 className="section-card-title" style={{ fontSize: '1rem', marginBottom: '1rem' }}>
                Jobs by Category
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {analytics?.jobs?.byCategory?.slice(0, 5).map((cat, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #475569)' }}>{cat.category}</span>
                    <span className="badge badge-blue">{cat.count} listings</span>
                  </div>
                ))}
              </div>
            </div>

            {/* System Health */}
            <div className="dashboard-section-card">
              <h3 className="section-card-title" style={{ fontSize: '1rem', marginBottom: '1rem' }}>
                System & Infrastructure
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>MongoDB Atlas Connection:</span>
                  <span className={`badge ${analytics?.system?.databaseConnected ? 'badge-green' : 'badge-danger'}`}>
                    {analytics?.system?.databaseConnected ? 'Healthy / Connected' : 'Degraded'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Database Host:</span>
                  <span className="font-mono text-sm" style={{ fontSize: '0.75rem' }}>{analytics?.system?.databaseHost || 'Atlas Cluster'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Server Environment:</span>
                  <span className="badge badge-blue">{analytics?.system?.environment || 'development'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Server Uptime:</span>
                  <span style={{ fontWeight: 600 }}>{Math.floor((analytics?.system?.serverUptime || 0) / 60)} minutes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'users' ? (
        /* Tab 2: User Directory */
        <div className="dashboard-section-card">
          <div className="section-card-header">
            <div>
              <h2 className="section-card-title">User Account Directory</h2>
              <p className="section-card-subtitle">Manage registered candidates, recruiters, and platform administrators</p>
            </div>
          </div>

          {/* User Filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ flex: '1 1 220px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search user by name, email, or company..."
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setUserPage(1);
                }}
                style={{ height: '38px', fontSize: '0.85rem' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {['All', 'candidate', 'recruiter', 'admin'].map((role) => (
                <button
                  key={role}
                  type="button"
                  className={`btn ${userRoleFilter.toLowerCase() === role.toLowerCase() ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  onClick={() => {
                    setUserRoleFilter(role);
                    setUserPage(1);
                  }}
                  style={{ textTransform: 'capitalize', fontSize: '0.75rem' }}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="table-responsive">
            <table className="dashboard-data-table" aria-label="User Directory Table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Company / Bio</th>
                  <th>Registered</th>
                  <th>Current Role</th>
                  <th>Change Role</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isCurrentAdmin = u._id === user?._id || u._id === user?.id;
                  return (
                    <tr key={u._id}>
                      <td>
                        <div className="table-job-title-wrap">
                          <span className="table-primary-text font-semibold">{u.name}</span>
                          <span className="table-secondary-text">{u.email}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #475569)' }}>
                          {u.companyName || u.bio || '—'}
                        </span>
                      </td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '10px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            background: u.role === 'admin' ? '#fef3c7' : u.role === 'recruiter' ? '#ede9fe' : '#e0f2fe',
                            color: u.role === 'admin' ? '#b45309' : u.role === 'recruiter' ? '#6d28d9' : '#0369a1'
                          }}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <select
                          className="form-input"
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          disabled={isCurrentAdmin}
                          style={{
                            height: '32px',
                            padding: '0.2rem 0.5rem',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            borderRadius: '6px'
                          }}
                          aria-label={`Change role for ${u.name}`}
                        >
                          <option value="candidate">Candidate</option>
                          <option value="recruiter">Recruiter</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="text-right">
                        {!isCurrentAdmin ? (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ color: 'var(--error, #ef4444)' }}
                            onClick={() => {
                              setUserToDelete(u);
                              setIsDeleteUserModalOpen(true);
                            }}
                            title="Delete user account"
                          >
                            <Trash2 size={13} />
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)' }}>Active Admin</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {userTotalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={userPage <= 1}
                onClick={() => setUserPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Page {userPage} of {userTotalPages}</span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={userPage >= userTotalPages}
                onClick={() => setUserPage((p) => Math.min(userTotalPages, p + 1))}
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Tab 3: Job Moderation */
        <div className="dashboard-section-card">
          <div className="section-card-header">
            <div>
              <h2 className="section-card-title">Job & Internship Moderation</h2>
              <p className="section-card-subtitle">Review, modify, or remove all listings posted across the platform</p>
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem', maxWidth: '360px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search listings by title, company..."
              value={jobSearch}
              onChange={(e) => setJobSearch(e.target.value)}
              style={{ height: '38px', fontSize: '0.85rem' }}
            />
          </div>

          <div className="table-responsive">
            <table className="dashboard-data-table" aria-label="Job Moderation Table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Category</th>
                  <th>Applicants</th>
                  <th>Status</th>
                  <th>Posted By</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => (
                  <tr key={j._id}>
                    <td>
                      <span className="font-semibold text-primary">{j.title}</span>
                    </td>
                    <td>{j.company}</td>
                    <td><span className="badge badge-blue">{j.category}</span></td>
                    <td>{j.applicantsCount || 0}</td>
                    <td>
                      <span className={`badge ${j.status === 'open' ? 'badge-green' : 'badge-danger'}`}>
                        {j.status === 'open' ? 'Open' : 'Closed'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #475569)' }}>
                        {j.postedBy?.name || j.postedBy?.companyName || 'Recruiter'}
                      </span>
                    </td>
                    <td className="text-right">
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setEditingJob(j)}
                          title="Edit / Moderate Listing"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--error, #ef4444)' }}
                          onClick={() => {
                            setJobToDelete(j);
                            setIsDeleteJobModalOpen(true);
                          }}
                          title="Remove Listing"
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
        </div>
      )}

      {/* Delete User Modal */}
      {isDeleteUserModalOpen && userToDelete && (
        <Modal
          isOpen={isDeleteUserModalOpen}
          onClose={() => {
            setIsDeleteUserModalOpen(false);
            setUserToDelete(null);
          }}
          title="Delete User Account"
        >
          <div style={{ padding: '0.5rem 0' }}>
            <p style={{ color: 'var(--text-primary, #0f172a)', fontSize: '0.95rem', marginBottom: '1rem' }}>
              Are you sure you want to permanently delete user <strong>"{userToDelete.name}" ({userToDelete.email})</strong>?
            </p>
            <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              This will remove all applications and postings associated with this user. This action is irreversible.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsDeleteUserModalOpen(false)}
                disabled={deletingUser}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteUserConfirm}
                disabled={deletingUser}
              >
                {deletingUser ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Job Modal */}
      {isDeleteJobModalOpen && jobToDelete && (
        <Modal
          isOpen={isDeleteJobModalOpen}
          onClose={() => {
            setIsDeleteJobModalOpen(false);
            setJobToDelete(null);
          }}
          title="Delete Job Listing"
        >
          <div style={{ padding: '0.5rem 0' }}>
            <p style={{ color: 'var(--text-primary, #0f172a)', fontSize: '0.95rem', marginBottom: '1rem' }}>
              Permanently delete listing <strong>"{jobToDelete.title}"</strong> ({jobToDelete.company})?
            </p>
            <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              All applications submitted to this position will also be purged.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsDeleteJobModalOpen(false)}
                disabled={deletingJob}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteJobConfirm}
                disabled={deletingJob}
              >
                {deletingJob ? 'Deleting...' : 'Delete Job'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Job Modal */}
      {editingJob && (
        <EditJobModal
          isOpen={!!editingJob}
          job={editingJob}
          onClose={() => setEditingJob(null)}
          onJobUpdated={() => {
            fetchJobs();
            fetchAnalytics();
            setEditingJob(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboardView;

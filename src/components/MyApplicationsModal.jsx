import React, { useState, useEffect, useCallback } from 'react';
import { X, Building2, MapPin, AlertCircle, Trash2, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

const MyApplicationsModal = ({ isOpen, onClose }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteMsg, setDeleteMsg] = useState('');

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.applications.getMy();
      setApplications(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchApplications();
    }
  }, [isOpen, fetchApplications]);

  const handleWithdraw = async (appId) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;
    try {
      await api.applications.delete(appId);
      setDeleteMsg('Application withdrawn successfully');
      setApplications((prev) => prev.filter((a) => a._id !== appId));
      setTimeout(() => setDeleteMsg(''), 3000);
    } catch (err) {
      setError(err.message || 'Could not withdraw application');
    }
  };

  if (!isOpen) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'shortlisted':
        return <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: '#dcfce7', color: '#15803d' }}>Shortlisted</span>;
      case 'accepted':
        return <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: '#dbeafe', color: '#1d4ed8' }}>Accepted</span>;
      case 'rejected':
        return <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: '#fee2e2', color: '#b91c1c' }}>Rejected</span>;
      case 'reviewed':
        return <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: '#fef3c7', color: '#b45309' }}>Under Review</span>;
      default:
        return <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: '#f1f5f9', color: '#475569' }}>Submitted</span>;
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
      <div className="modal-container" style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div>
            <span className="modal-eyebrow">Candidate Dashboard</span>
            <h3 className="modal-title">My Applications</h3>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {deleteMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: '#dcfce7', color: '#15803d', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
            <CheckCircle2 size={16} />
            <span>{deleteMsg}</span>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: '#64748b' }}>
            Loading your applications...
          </div>
        ) : error ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        ) : applications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748b' }}>
            <p style={{ fontSize: '1rem', marginBottom: '0.5rem', fontWeight: 500 }}>No applications submitted yet.</p>
            <p style={{ fontSize: '0.875rem' }}>Browse internship listings and click "Apply Now" to start tracking applications here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '0.25rem' }}>
            {applications.map((app) => (
              <div key={app._id} className="my-app-card">
                <div>
                  <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.05rem', color: '#0f172a', fontWeight: 700 }}>
                    {app.job?.title || 'Internship Position'}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.825rem', color: '#64748b', marginBottom: '0.45rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Building2 size={13} />
                      {app.job?.company || 'Company'}
                    </span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={13} />
                      {app.job?.location || 'Remote'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.785rem', color: '#94a3b8' }}>
                    Applied on: {new Date(app.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="my-app-card-actions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem', flexShrink: 0 }}>
                  {getStatusBadge(app.status)}
                  <button
                    type="button"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '0.775rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.25rem 0.4rem',
                      borderRadius: '4px'
                    }}
                    onClick={() => handleWithdraw(app._id)}
                    title="Withdraw Application"
                  >
                    <Trash2 size={13} />
                    <span>Withdraw</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplicationsModal;

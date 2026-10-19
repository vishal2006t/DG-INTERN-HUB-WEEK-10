import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({
  type = 'spinner',
  count = 3,
  rows = 5,
  text = 'Loading...',
  className = ''
}) => {
  if (type === 'skeleton-card') {
    return (
      <div className={`skeleton-grid ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton-job-card">
            <div className="skeleton-header">
              <div className="skeleton-avatar skeleton-pulse" />
              <div className="skeleton-header-text">
                <div className="skeleton-line skeleton-title-line skeleton-pulse" />
                <div className="skeleton-line skeleton-sub-line skeleton-pulse" />
              </div>
            </div>
            <div className="skeleton-line skeleton-headline skeleton-pulse" />
            <div className="skeleton-meta-row">
              <div className="skeleton-badge skeleton-pulse" />
              <div className="skeleton-badge skeleton-pulse" />
              <div className="skeleton-badge skeleton-pulse" />
            </div>
            <div className="skeleton-line skeleton-body skeleton-pulse" />
            <div className="skeleton-line skeleton-body-short skeleton-pulse" />
            <div className="skeleton-footer">
              <div className="skeleton-button skeleton-pulse" />
              <div className="skeleton-button skeleton-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'skeleton-table') {
    return (
      <div className={`skeleton-table-wrap ${className}`}>
        <div className="skeleton-table-header skeleton-pulse" />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="skeleton-table-row">
            <div className="skeleton-table-cell skeleton-pulse" style={{ width: '30%' }} />
            <div className="skeleton-table-cell skeleton-pulse" style={{ width: '20%' }} />
            <div className="skeleton-table-cell skeleton-pulse" style={{ width: '15%' }} />
            <div className="skeleton-table-cell skeleton-pulse" style={{ width: '15%' }} />
            <div className="skeleton-table-cell skeleton-pulse" style={{ width: '10%' }} />
          </div>
        ))}
      </div>
    );
  }

  // Default spinner
  return (
    <div className={`loader-container ${className}`} role="status" aria-live="polite">
      <Loader2 size={36} className="loader-spinner animate-spin" />
      {text && <p className="loader-text">{text}</p>}
      <span className="sr-only">Loading content, please wait</span>
    </div>
  );
};

export default Loader;

import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, Briefcase } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="not-found-page-container container">
      <div className="not-found-card">
        <div className="not-found-icon-circle">
          <Compass size={48} className="text-primary animate-pulse" />
        </div>
        <span className="not-found-code">404</span>
        <h1 className="not-found-title">Page Not Found</h1>
        <p className="not-found-desc">
          The page or opportunity you are looking for might have been moved, renamed, or is temporarily unavailable.
        </p>

        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary" id="404-home-btn">
            <Home size={16} />
            <span>Return to Home</span>
          </Link>
          <Link to="/jobs" className="btn btn-secondary" id="404-browse-btn">
            <Briefcase size={16} />
            <span>Explore Jobs</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

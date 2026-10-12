import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight, User, LogOut, FileText, PlusCircle } from 'lucide-react';
import dgLogo from '../assets/dg-interns-hub-logo.png';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onOpenMyApplications, onOpenPostJob }) => {
  const { user, isAuthenticated, logout, openAuth } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const logoTargetRef = useRef(null);

  // Check if session has already experienced the intro animation
  const [introState, setIntroState] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const seen = window.sessionStorage.getItem('dg_logo_intro_seen');
        return seen ? 'done' : 'init';
      }
    } catch {
      return 'done';
    }
    return 'done';
  });

  // Animated intro logo state (pixel coordinates for smooth natural easing)
  const [animStyle, setAnimStyle] = useState({
    opacity: 0,
    transform: 'scale(1.18)',
    left: typeof window !== 'undefined' ? (window.innerWidth - 110) / 2 : 0,
    top: typeof window !== 'undefined' ? window.innerHeight * 0.28 : 0,
    width: 110,
    transition: 'none'
  });

  useEffect(() => {
    if (introState === 'done') return;

    // Calculate initial center/top-center coordinates
    const initialWidth = window.innerWidth <= 768 ? 90 : 115;
    const initialLeft = (window.innerWidth - initialWidth) / 2;
    const initialTop = window.innerHeight * (window.innerWidth <= 768 ? 0.25 : 0.28);

    setAnimStyle({
      opacity: 0,
      transform: 'scale(1.15)',
      left: initialLeft,
      top: initialTop,
      width: initialWidth,
      transition: 'none'
    });

    // Step 1: Smooth fade-in and scale-in at top-center (~40ms -> 350ms)
    const timerAppear = setTimeout(() => {
      setIntroState('visible');
      setAnimStyle((prev) => ({
        ...prev,
        opacity: 1,
        transform: 'scale(1.04)',
        transition: 'opacity 0.4s ease-out, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }));
    }, 50);

    // Step 2: Smooth glide to the left side of the Navbar (~420ms -> 1450ms)
    const timerGlide = setTimeout(() => {
      if (logoTargetRef.current) {
        const targetRect = logoTargetRef.current.getBoundingClientRect();
        const targetWidth = targetRect.width > 0 ? targetRect.width : (window.innerWidth <= 768 ? 40 : 52);
        const targetLeft = targetRect.left > 0 ? targetRect.left : (window.innerWidth <= 768 ? 16 : Math.max(16, (window.innerWidth - 1200) / 2 + 24));
        const targetTop = targetRect.top >= 0 ? targetRect.top : 10;

        setIntroState('gliding');
        setAnimStyle({
          opacity: 1,
          left: targetLeft,
          top: targetTop,
          width: targetWidth,
          transform: 'scale(1)',
          // 1.02s natural ease-out curve directly into final navbar position
          transition: 'left 1.02s cubic-bezier(0.2, 0.8, 0.2, 1), top 1.02s cubic-bezier(0.2, 0.8, 0.2, 1), width 1.02s cubic-bezier(0.2, 0.8, 0.2, 1), transform 1.02s cubic-bezier(0.2, 0.8, 0.2, 1)'
        });
      }
    }, 420);

    // Step 3: Animation completes, settle permanently into navbar (~1.48s total)
    const timerDone = setTimeout(() => {
      setIntroState('done');
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.setItem('dg_logo_intro_seen', 'true');
        }
      } catch {}
    }, 1480);

    return () => {
      clearTimeout(timerAppear);
      clearTimeout(timerGlide);
      clearTimeout(timerDone);
    };
  }, [introState]);

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  const isIntroRunning = introState !== 'done';

  return (
    <>
      {/* Intro Backdrop Overlay (Soft white curtain that dissolves during glide) */}
      {isIntroRunning && (
        <div 
          className={`logo-intro-backdrop ${introState === 'gliding' ? 'fade-out' : ''}`}
          aria-hidden="true"
        />
      )}

      {/* Floating Animated Intro Logo Asset */}
      {isIntroRunning && (
        <img
          src={dgLogo}
          alt="DG Interns Hub Logo"
          className="logo-intro-animating-asset"
          style={{
            position: 'fixed',
            left: `${animStyle.left}px`,
            top: `${animStyle.top}px`,
            width: `${animStyle.width}px`,
            height: 'auto',
            opacity: animStyle.opacity,
            transform: animStyle.transform,
            transition: animStyle.transition,
            zIndex: 9999,
            pointerEvents: 'none',
            objectFit: 'contain'
          }}
        />
      )}

      {/* Primary Sticky Header */}
      <header className="navbar-header">
        <div className="container navbar-container">
          {/* Brand Logo & Name */}
          <Link to="/" className="navbar-brand" onClick={handleLinkClick}>
            <img 
              ref={logoTargetRef}
              src={dgLogo} 
              alt="DG Interns Hub Logo" 
              className="navbar-brand-logo"
              style={{
                opacity: isIntroRunning ? 0 : 1,
                transition: 'opacity 0.25s ease'
              }}
            />
            <div 
              className="brand-text-group"
              style={{
                opacity: introState === 'done' || introState === 'gliding' ? 1 : 0,
                transition: 'opacity 0.4s ease 0.2s'
              }}
            >
              <span className="brand-title">DG Interns Hub</span>
              <span className="brand-tagline">Careers & Internships</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="desktop-nav">
            <NavLink 
              to="/" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              end
            >
              Home
            </NavLink>
            <NavLink 
              to="/jobs" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Jobs
            </NavLink>
            <NavLink 
              to="/contact" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Contact
            </NavLink>
          </nav>

          {/* Action Buttons & Auth */}
          <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {isAuthenticated ? (
              <div className="navbar-user-group" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                {user?.role === 'candidate' && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={onOpenMyApplications}
                    title="View My Applications"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <FileText size={14} />
                    <span>My Applications</span>
                  </button>
                )}

                {(user?.role === 'recruiter' || user?.role === 'admin') && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={onOpenPostJob}
                    title="Post a New Job"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <PlusCircle size={14} />
                    <span>Post Job</span>
                  </button>
                )}

                <div 
                  className="user-profile-badge" 
                  style={{
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.4rem', 
                    padding: '0.35rem 0.65rem', 
                    background: '#f1f5f9', 
                    borderRadius: '20px',
                    fontSize: '0.825rem',
                    fontWeight: 500,
                    color: '#0f172a'
                  }}
                >
                  <User size={13} className="text-primary" />
                  <span style={{ maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.name?.split(' ')[0]}
                  </span>
                  <span 
                    style={{
                      fontSize: '0.7rem',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '10px',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      background: user?.role === 'admin' ? '#fef3c7' : user?.role === 'recruiter' ? '#ede9fe' : '#e0f2fe',
                      color: user?.role === 'admin' ? '#b45309' : user?.role === 'recruiter' ? '#6d28d9' : '#0369a1'
                    }}
                  >
                    {user?.role}
                  </span>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={logout}
                  title="Sign Out"
                  style={{ padding: '0.45rem' }}
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => openAuth('login')}
              >
                <span>Sign In</span>
              </button>
            )}

            <button 
              type="button" 
              className="btn btn-primary btn-sm nav-cta-btn"
              onClick={() => {
                navigate('/jobs');
                setMobileMenuOpen(false);
              }}
            >
              <span>Explore Internships</span>
              <ArrowRight size={15} />
            </button>

            {/* Mobile Menu Toggle Button */}
            <button 
              type="button" 
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-nav-drawer">
            <nav className="mobile-nav-links">
              <NavLink 
                to="/" 
                className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                onClick={handleLinkClick}
                end
              >
                Home
              </NavLink>
              <NavLink 
                to="/jobs" 
                className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                onClick={handleLinkClick}
              >
                Jobs
              </NavLink>
              <NavLink 
                to="/contact" 
                className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                onClick={handleLinkClick}
              >
                Contact
              </NavLink>

              {/* Mobile Auth Actions */}
              <div style={{ padding: '0.75rem 0', borderTop: '1px solid #e2e8f0', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {isAuthenticated ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}>
                      <span>Signed in as <strong>{user?.name}</strong></span>
                      <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: '#e2e8f0' }}>{user?.role}</span>
                    </div>
                    {user?.role === 'candidate' && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ width: '100%' }}
                        onClick={() => {
                          setMobileMenuOpen(false);
                          if (onOpenMyApplications) onOpenMyApplications();
                        }}
                      >
                        My Applications
                      </button>
                    )}
                    {(user?.role === 'recruiter' || user?.role === 'admin') && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ width: '100%' }}
                        onClick={() => {
                          setMobileMenuOpen(false);
                          if (onOpenPostJob) onOpenPostJob();
                        }}
                      >
                        Post a Job
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', color: '#ef4444' }}
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%' }}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuth('login');
                    }}
                  >
                    Sign In / Register
                  </button>
                )}
              </div>

              <div className="mobile-drawer-cta">
                <button 
                  type="button" 
                  className="btn btn-primary btn-lg" 
                  style={{ width: '100%' }}
                  onClick={() => {
                    navigate('/jobs');
                    setMobileMenuOpen(false);
                  }}
                >
                  Explore Internships
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;

import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const LinkedInIcon = ({ size = 18 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GitHubIcon = ({ size = 18 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

import dgLogo from '../assets/dg-interns-hub-logo.png';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container footer-content-grid">
        {/* Brand & mission */}
        <div className="footer-col footer-brand-col">
          <div className="footer-brand">
            <img 
              src={dgLogo} 
              alt="DG Interns Hub Logo" 
              className="footer-logo-img"
              style={{ height: '46px', width: 'auto', objectFit: 'contain', borderRadius: '50%', backgroundColor: '#FFFFFF', padding: '2px' }}
            />
            <span className="footer-brand-name">DG Interns Hub</span>
          </div>
          <p className="footer-tagline-statement" style={{ fontWeight: 600, color: '#FFFFFF', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
            Build Skills. Gain Experience. Start Your Career.
          </p>
          <p className="footer-description">
            A dedicated internship and career launchpad designed for college students, freshers, and early-career tech enthusiasts. Discover real-world projects, verified mentorship, and guaranteed stipends.
          </p>
          <div className="footer-social-links">
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noreferrer" 
              className="social-icon-btn" 
              aria-label="LinkedIn"
            >
              <LinkedInIcon size={18} />
            </a>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer" 
              className="social-icon-btn" 
              aria-label="GitHub"
            >
              <GitHubIcon size={18} />
            </a>
            <a 
              href="mailto:contact@dginternshub.com" 
              className="social-icon-btn" 
              aria-label="Email"
            >
              <Mail size={18} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h4 className="footer-col-title">Quick Links</h4>
          <ul className="footer-links-list">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/jobs">Jobs</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
          </ul>
        </div>

        {/* Top Internship Domains */}
        <div className="footer-col">
          <h4 className="footer-col-title">Top Domains</h4>
          <ul className="footer-links-list">
            <li>
              <Link to="/jobs?category=Web+Development">Web Development</Link>
            </li>
            <li>
              <Link to="/jobs?category=React">React JS</Link>
            </li>
            <li>
              <Link to="/jobs?category=Python">Python & Backend</Link>
            </li>
            <li>
              <Link to="/jobs?category=AI+%2F+ML">AI & Machine Learning</Link>
            </li>
            <li>
              <Link to="/jobs?category=UI%2FUX">UI/UX Product Design</Link>
            </li>
            <li>
              <Link to="/jobs?category=Cyber+Security">Cyber Security</Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-col">
          <h4 className="footer-col-title">Support & Office</h4>
          <div className="footer-contact-info">
            <div className="footer-contact-item">
              <Mail size={16} className="contact-icon" />
              <span>contact@dginternshub.com</span>
            </div>
            <div className="footer-contact-item">
              <Phone size={16} className="contact-icon" />
              <span>+91 98765 43210</span>
            </div>
            <div className="footer-contact-item">
              <MapPin size={16} className="contact-icon" />
              <span>Tech Zone, Electronic City, Bengaluru, India</span>
            </div>
          </div>
          <div className="footer-badge-box">
            <span className="badge badge-green">100% Free for Students</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom-bar">
        <div className="container footer-bottom-inner">
          <p className="copyright-text">
            © 2026 DG Interns Hub. All rights reserved.
          </p>
          <div className="footer-legal-links">
            <span>Student First</span>
            <span>•</span>
            <span>Verified Employers</span>
            <span>•</span>
            <span>Zero Placement Fees</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

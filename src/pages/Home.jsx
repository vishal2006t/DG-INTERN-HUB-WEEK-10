import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Star, ShieldCheck } from 'lucide-react';
import { jobsData, platformStats, whyChooseUsFeatures } from '../data/jobs';
import JobCard from '../components/JobCard';
import FeatureCard from '../components/FeatureCard';
import HowItWorks from '../components/HowItWorks';

const Home = ({ onApplyJob }) => {
  const navigate = useNavigate();
  // Get 3-4 featured jobs
  const featuredJobs = jobsData.filter((j) => j.featured).slice(0, 4);

  const scrollToHowItWorks = (e) => {
    e.preventDefault();
    const element = document.getElementById('how-it-works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="page-wrapper home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <ShieldCheck size={14} className="hero-badge-icon" />
              <span>Verified Tech Internships for College Students & Freshers</span>
            </div>

            <h1 className="hero-headline">
              Find the Right Internship. <br />
              <span className="text-primary">Start Your Career.</span>
            </h1>

            <p className="hero-subtitle">
              Discover practical internship opportunities, build real-world skills and take the next step toward your career.
            </p>

            <div className="hero-cta-group">
              <Link to="/jobs" className="btn btn-primary btn-lg" id="hero-primary-cta">
                <span>Explore Internships</span>
                <ArrowRight size={17} />
              </Link>
              <a 
                href="#how-it-works" 
                onClick={scrollToHowItWorks} 
                className="btn btn-secondary btn-lg"
                id="hero-secondary-cta"
              >
                How It Works
              </a>
            </div>

            {/* Micro Trust Indicators */}
            <div className="hero-trust-indicators">
              <div className="trust-item">
                <CheckCircle2 size={15} className="text-success" />
                <span>Zero Application Fees</span>
              </div>
              <div className="trust-item">
                <CheckCircle2 size={15} className="text-success" />
                <span>Verified Monthly Stipends</span>
              </div>
              <div className="trust-item">
                <CheckCircle2 size={15} className="text-success" />
                <span>Direct Mentor Reviews</span>
              </div>
            </div>
          </div>

          {/* Clean Professional Hero Visual (Realistic Platform Card / Spotlight) */}
          <div className="hero-visual-col">
            <div className="hero-spotlight-card">
              <div className="spotlight-card-top">
                <div className="spotlight-badge-row">
                  <span className="badge badge-green">Featured Match</span>
                  <span className="spotlight-rating">
                    <Star size={13} fill="#F59E0B" stroke="#F59E0B" /> 4.9 Rating
                  </span>
                </div>
                <h3 className="spotlight-title">Frontend Engineering Intern</h3>
                <p className="spotlight-company">Apex Digital Labs • Bengaluru (Hybrid)</p>
              </div>

              <div className="spotlight-details-box">
                <div className="spotlight-metric">
                  <span className="metric-label">Stipend</span>
                  <span className="metric-value text-success">₹25,000 / mo</span>
                </div>
                <div className="spotlight-metric">
                  <span className="metric-label">Duration</span>
                  <span className="metric-value">6 Months</span>
                </div>
                <div className="spotlight-metric">
                  <span className="metric-label">Work Mode</span>
                  <span className="metric-value">Hybrid</span>
                </div>
              </div>

              <div className="spotlight-skills-row">
                <span className="skill-tag">React.js</span>
                <span className="skill-tag">JavaScript</span>
                <span className="skill-tag">REST APIs</span>
                <span className="skill-tag">Git</span>
              </div>

              <div className="spotlight-footer">
                <div className="spotlight-meta-left">
                  <span className="applicants-badge">92 students applied</span>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate('/jobs/react-js-intern')}
                >
                  View Details
                </button>
              </div>

              {/* Floating verified badge */}
              <div className="spotlight-floating-badge">
                <CheckCircle2 size={16} className="text-primary" />
                <div>
                  <div className="floating-badge-title">100% Verified Employer</div>
                  <div className="floating-badge-sub">Pre-screened role & stipend</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Simple Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {platformStats.map((stat, idx) => (
              <div className="stat-card" key={idx}>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-desc">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Internships Section */}
      <section className="featured-internships-section" id="featured-internships">
        <div className="container">
          <div className="section-header-row">
            <div>
              <span className="section-eyebrow">Curated Opportunities</span>
              <h2 className="section-title">Featured Internships</h2>
              <p className="section-subtitle">
                Top tier internships with verified stipends and high PPO conversion potential.
              </p>
            </div>
            <Link to="/jobs" className="btn btn-outline-primary btn-sm view-all-link">
              <span>View All 8 Opportunities</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="job-cards-grid">
            {featuredJobs.map((job) => (
              <JobCard key={job.id} job={job} onApply={onApplyJob} />
            ))}
          </div>

          <div className="featured-bottom-cta">
            <Link to="/jobs" className="btn btn-primary btn-lg">
              <span>Explore All Internships</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose DG Interns Hub Section */}
      <section className="why-choose-section" id="why-us">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-eyebrow">Student-First Platform</span>
            <h2 className="section-title">Why Choose DG Interns Hub?</h2>
            <p className="section-subtitle">
              We bridge the gap between academic theory and real-world tech engineering.
            </p>
          </div>

          <div className="features-grid">
            {whyChooseUsFeatures.map((feat, idx) => (
              <FeatureCard 
                key={idx}
                iconName={feat.iconName}
                title={feat.title}
                description={feat.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <HowItWorks />

      {/* Final CTA Banner */}
      <section className="final-cta-section">
        <div className="container">
          <div className="cta-banner-card">
            <div className="cta-banner-content">
              <h2 className="cta-title">Ready to Start Your Career?</h2>
              <p className="cta-subtitle">
                Join hundreds of college students and freshers advancing their skills through high-impact, paid tech internships.
              </p>
              <div className="cta-actions">
                <Link to="/jobs" className="btn btn-primary btn-lg cta-btn">
                  <span>Explore Internships</span>
                  <ArrowRight size={17} />
                </Link>
                <Link to="/contact" className="btn btn-secondary btn-lg">
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

import React, { useState } from 'react';
import { Mail, MapPin, Send, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

const LinkedInIcon = ({ size = 22, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GitHubIcon = ({ size = 22, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Please provide your full name.';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Please provide your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address.';
    }
    if (!formData.message.trim()) {
      newErrors.message = 'Please enter your message.';
    } else if (formData.message.trim().length < 15) {
      newErrors.message = 'Message must be at least 15 characters long.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    }, 600);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
    setIsSent(false);
  };

  return (
    <div className="page-wrapper contact-page">
      {/* Header Section */}
      <section className="contact-header-section">
        <div className="container text-center">
          <span className="section-eyebrow">Support & Inquiries</span>
          <h1 className="contact-title">Get in Touch</h1>
          <p className="contact-subtitle">
            Have a question about internships or applications? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Main Grid Section */}
      <section className="contact-main-section">
        <div className="container">
          <div className="contact-grid">
            {/* Left: Contact Info & Cards */}
            <div className="contact-info-col">
              <h2 className="contact-col-heading">Connect with Our Team</h2>
              <p className="contact-col-desc">
                Whether you are a student inquiring about an internship application or an employer looking to onboard talent, our support team is here to assist you.
              </p>

              <div className="contact-cards-stack">
                {/* Email Card */}
                <a href="mailto:contact@dginternshub.com" className="contact-item-card">
                  <div className="contact-icon-box">
                    <Mail size={22} className="text-primary" />
                  </div>
                  <div className="contact-card-content">
                    <span className="contact-card-label">Official Email</span>
                    <span className="contact-card-value">contact@dginternshub.com</span>
                    <span className="contact-card-sub">Response within 24 business hours</span>
                  </div>
                </a>

                {/* LinkedIn Card */}
                <a 
                  href="https://linkedin.com/company/dg-interns-hub" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="contact-item-card"
                >
                  <div className="contact-icon-box">
                    <LinkedInIcon size={22} className="text-primary" />
                  </div>
                  <div className="contact-card-content">
                    <span className="contact-card-label">LinkedIn Community</span>
                    <span className="contact-card-value">linkedin.com/company/dg-interns-hub</span>
                    <span className="contact-card-sub">Follow for daily internship updates</span>
                  </div>
                </a>

                {/* GitHub Card */}
                <a 
                  href="https://github.com/dg-interns-hub" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="contact-item-card"
                >
                  <div className="contact-icon-box">
                    <GitHubIcon size={22} className="text-primary" />
                  </div>
                  <div className="contact-card-content">
                    <span className="contact-card-label">GitHub Repository</span>
                    <span className="contact-card-value">github.com/dg-interns-hub</span>
                    <span className="contact-card-sub">Explore open-source sample codebases</span>
                  </div>
                </a>

                {/* Office Card */}
                <div className="contact-item-card">
                  <div className="contact-icon-box">
                    <MapPin size={22} className="text-primary" />
                  </div>
                  <div className="contact-card-content">
                    <span className="contact-card-label">Hub Headquarters</span>
                    <span className="contact-card-value">Electronic City Phase 1, Bengaluru</span>
                    <span className="contact-card-sub">Karnataka 560100, India</span>
                  </div>
                </div>
              </div>

              {/* Working Hours */}
              <div className="support-hours-banner">
                <Clock size={18} className="text-muted" />
                <span>Student Support Hours: Monday to Friday, 9:00 AM – 6:00 PM IST</span>
              </div>
            </div>

            {/* Right: Contact Form */}
            <div className="contact-form-col">
              <div className="contact-form-card">
                <h3 className="form-card-title">Send Us a Direct Message</h3>
                <p className="form-card-subtitle">Fill in the form below and we'll reply to your email promptly.</p>

                {isSent ? (
                  <div className="contact-success-state">
                    <CheckCircle2 size={44} className="text-success" />
                    <h4 className="success-state-title">Message Sent Successfully!</h4>
                    <p className="success-state-desc">
                      Thank you for contacting DG Interns Hub. Your message has been received and our student support desk will reply to your email shortly.
                    </p>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleReset}
                      style={{ marginTop: '1rem' }}
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="contact-form" noValidate>
                    {/* Name */}
                    <div className="form-group">
                      <label htmlFor="contact-name" className="form-label">
                        Your Full Name <span className="required-star">*</span>
                      </label>
                      <input
                        type="text"
                        id="contact-name"
                        name="name"
                        placeholder="e.g. Ananya Roy"
                        className={`form-input ${errors.name ? 'has-error' : ''}`}
                        value={formData.name}
                        onChange={handleChange}
                      />
                      {errors.name && (
                        <span className="form-error-msg">
                          <AlertCircle size={13} /> {errors.name}
                        </span>
                      )}
                    </div>

                    {/* Email */}
                    <div className="form-group">
                      <label htmlFor="contact-email" className="form-label">
                        Email Address <span className="required-star">*</span>
                      </label>
                      <input
                        type="email"
                        id="contact-email"
                        name="email"
                        placeholder="ananya@college.edu"
                        className={`form-input ${errors.email ? 'has-error' : ''}`}
                        value={formData.email}
                        onChange={handleChange}
                      />
                      {errors.email && (
                        <span className="form-error-msg">
                          <AlertCircle size={13} /> {errors.email}
                        </span>
                      )}
                    </div>

                    {/* Subject */}
                    <div className="form-group">
                      <label htmlFor="contact-subject" className="form-label">
                        Subject / Topic
                      </label>
                      <input
                        type="text"
                        id="contact-subject"
                        name="subject"
                        placeholder="e.g. Application status inquiry or employer partnership"
                        className="form-input"
                        value={formData.subject}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Message */}
                    <div className="form-group">
                      <label htmlFor="contact-message" className="form-label">
                        Message <span className="required-star">*</span>
                      </label>
                      <textarea
                        id="contact-message"
                        name="message"
                        rows={5}
                        placeholder="Please write your questions or feedback here..."
                        className={`form-textarea ${errors.message ? 'has-error' : ''}`}
                        value={formData.message}
                        onChange={handleChange}
                      />
                      {errors.message && (
                        <span className="form-error-msg">
                          <AlertCircle size={13} /> {errors.message}
                        </span>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      style={{ width: '100%' }}
                      disabled={isSubmitting}
                      id="contact-submit-btn"
                    >
                      <Send size={16} />
                      <span>{isSubmitting ? 'Sending Message...' : 'Send Message'}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions Mini Section */}
      <section className="contact-faq-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-eyebrow">Common Queries</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>

          <div className="faq-cards-grid">
            <div className="faq-card">
              <h4 className="faq-question">Are all internships on DG Interns Hub paid?</h4>
              <p className="faq-answer">
                Yes. We strictly feature verified opportunities that offer a guaranteed monthly stipend. Unpaid internships are not listed on our platform.
              </p>
            </div>

            <div className="faq-card">
              <h4 className="faq-question">Can 1st or 2nd year students apply?</h4>
              <p className="faq-answer">
                Absolutely! Many partner organizations welcome passionate early-year undergraduates who demonstrate good problem-solving and fundamental skills.
              </p>
            </div>

            <div className="faq-card">
              <h4 className="faq-question">How soon will I hear back after applying?</h4>
              <p className="faq-answer">
                Employers review candidate profiles on a rolling basis. Most candidates receive initial feedback or screening invitations within 3 to 5 business days.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, Building, UserCheck, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import InputField from '../components/InputField';

const Register = () => {
  const { register } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'candidate',
    companyName: '',
    bio: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError('');
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Full Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9+\-\s()]{7,15}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please provide a valid phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.role === 'recruiter' && !formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required for recruiter accounts';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError('');

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        role: formData.role,
        companyName: formData.companyName.trim(),
        bio: formData.bio.trim()
      });

      success('Account created successfully! Welcome to DG Interns Hub.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Unable to register account.';
      setApiError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card-modern auth-register-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-icon-bubble">
            <UserCheck size={26} className="text-primary" />
          </div>
          <h1 className="auth-title">Create Your Account</h1>
          <p className="auth-subtitle">
            Join thousands of students and recruiters discovering careers on DG Interns Hub
          </p>
        </div>

        {/* Error Alert */}
        {apiError && (
          <div className="alert-callout alert-danger mb-4" role="alert">
            <AlertCircle size={18} className="callout-icon" />
            <span className="callout-text">{apiError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="auth-form">
          {/* Role Selection Tabs */}
          <div className="role-selection-group">
            <label className="form-label">I want to join as:</label>
            <div className="role-pills-toggle">
              <button
                type="button"
                className={`role-pill-btn ${formData.role === 'candidate' ? 'is-active' : ''}`}
                onClick={() => setFormData((prev) => ({ ...prev, role: 'candidate' }))}
              >
                <User size={16} />
                <span>Job Seeker / Intern</span>
              </button>
              <button
                type="button"
                className={`role-pill-btn ${formData.role === 'recruiter' ? 'is-active' : ''}`}
                onClick={() => setFormData((prev) => ({ ...prev, role: 'recruiter' }))}
              >
                <Building size={16} />
                <span>Recruiter / Employer</span>
              </button>
            </div>
          </div>

          <div className="form-grid-2col">
            <InputField
              label="Full Name"
              id="register-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              icon={<User size={16} />}
              error={errors.name}
              required
              autoComplete="name"
            />

            <InputField
              label="Email Address"
              id="register-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              icon={<Mail size={16} />}
              error={errors.email}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-grid-2col">
            <InputField
              label="Phone Number"
              id="register-phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              icon={<Phone size={16} />}
              error={errors.phone}
              required
              autoComplete="tel"
            />

            {formData.role === 'recruiter' ? (
              <InputField
                label="Company Name"
                id="register-company"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Nexora Cloud Solutions"
                icon={<Building size={16} />}
                error={errors.companyName}
                required
              />
            ) : (
              <InputField
                label="Headline / Area of Study"
                id="register-bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Computer Science Student • React Dev"
                helperText="Optional headline for your profile"
              />
            )}
          </div>

          <div className="form-grid-2col">
            <InputField
              label="Password"
              id="register-password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              icon={<Lock size={16} />}
              error={errors.password}
              required
              autoComplete="new-password"
            />

            <InputField
              label="Confirm Password"
              id="register-confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
              icon={<Lock size={16} />}
              error={errors.confirmPassword}
              required
              autoComplete="new-password"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            id="register-submit-btn"
            className="w-full mt-2"
          >
            <span>Create Account</span>
            <Sparkles size={16} />
          </Button>
        </form>

        {/* Footer Link */}
        <div className="auth-card-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-switch-link" id="login-switch-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

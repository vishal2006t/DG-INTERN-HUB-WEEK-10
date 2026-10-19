import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import InputField from '../components/InputField';

const Login = () => {
  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Intended destination or fallback to dashboard
  const destination = location.state?.from?.pathname || '/dashboard';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: true
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
      await login(formData.email.trim(), formData.password);
      success('Welcome back! Successfully signed in.');
      navigate(destination, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid email or password.';
      setApiError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Quick autofill buttons for evaluation/testing
  const fillCredentials = (email, pass) => {
    setFormData((prev) => ({ ...prev, email, password: pass }));
    setErrors({});
    setApiError('');
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card-modern">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-icon-bubble">
            <LogIn size={26} className="text-primary" />
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">
            Sign in to access your applications, saved jobs, and profile
          </p>
        </div>

        {/* Redirect Notice if routed from protected area */}
        {location.state?.from && (
          <div className="alert-callout alert-info mb-4" role="status">
            <span>Please log in to view this protected page.</span>
          </div>
        )}

        {/* Error Alert */}
        {apiError && (
          <div className="alert-callout alert-danger mb-4" role="alert">
            <AlertCircle size={18} className="callout-icon" />
            <span className="callout-text">{apiError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate className="auth-form">
          <InputField
            label="Email Address"
            id="login-email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@domain.com"
            icon={<Mail size={16} />}
            error={errors.email}
            required
            autoComplete="email"
          />

          <InputField
            label="Password"
            id="login-password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            icon={<Lock size={16} />}
            error={errors.password}
            required
            autoComplete="current-password"
          />

          <div className="auth-meta-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="custom-checkbox"
              />
              <span>Remember me on this device</span>
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            id="login-submit-btn"
            className="w-full"
          >
            Sign In to Account
          </Button>
        </form>

        {/* Testing / Quick Demo Login Helpers */}
        <div className="demo-credentials-box">
          <p className="demo-label">Quick Testing Credentials:</p>
          <div className="demo-pills-row">
            <button
              type="button"
              className="demo-pill"
              onClick={() => fillCredentials('candidate@example.com', 'CandidatePassword123!')}
            >
              Candidate Demo
            </button>
            <button
              type="button"
              className="demo-pill"
              onClick={() => fillCredentials('recruiter@nexoracloud.com', 'RecruiterPassword123!')}
            >
              Recruiter Demo
            </button>
            <button
              type="button"
              className="demo-pill"
              onClick={() => fillCredentials('admin@dginternshub.com', 'AdminPassword123!')}
            >
              Admin Demo
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <div className="auth-card-footer">
          <p>
            Don't have an account yet?{' '}
            <Link to="/register" className="auth-switch-link" id="register-switch-link">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

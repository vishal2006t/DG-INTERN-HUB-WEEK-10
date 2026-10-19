import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Sparkles, 
  Save, 
  Plus, 
  X, 
  AlertCircle, 
  Trash2, 
  CheckCircle2, 
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import Button from '../components/Button';
import InputField from '../components/InputField';
import Loader from '../components/Loader';
import Modal from '../components/Modal';

const Profile = () => {
  const { user, updateUserProfile, logout } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    companyName: '',
    skills: []
  });

  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Hydrate user profile from backend
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const res = await api.users.getProfile();
        const profile = res?.data?.user || res?.data || user;
        if (profile) {
          setFormData({
            name: profile.name || '',
            email: profile.email || '',
            phone: profile.phone || '',
            bio: profile.bio || '',
            companyName: profile.companyName || '',
            skills: Array.isArray(profile.skills) ? profile.skills : []
          });
        }
      } catch (err) {
        console.warn('Profile fetch warning (using auth user):', err.message);
        if (user) {
          setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            bio: user.bio || '',
            companyName: user.companyName || '',
            skills: Array.isArray(user.skills) ? user.skills : []
          });
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    const skillTrimmed = newSkill.trim();
    if (!skillTrimmed) return;

    if (formData.skills.some((s) => s.toLowerCase() === skillTrimmed.toLowerCase())) {
      toastError(`"${skillTrimmed}" is already in your skills list.`);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, skillTrimmed]
    }));
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toastError('Name cannot be empty.');
      return;
    }

    setSaving(true);
    try {
      const res = await api.users.updateProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        bio: formData.bio.trim(),
        companyName: formData.companyName.trim(),
        skills: formData.skills
      });

      const updatedUser = res?.data?.user || res?.data;
      if (updatedUser) {
        updateUserProfile(updatedUser);
      }
      success('Profile updated successfully!');
    } catch (err) {
      toastError(err.message || 'Unable to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await api.users.deleteProfile();
      await logout();
      success('Account deleted successfully.');
      navigate('/');
    } catch (err) {
      toastError(err.message || 'Failed to delete account.');
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-16 flex justify-center">
        <Loader type="spinner" text="Loading your profile..." />
      </div>
    );
  }

  return (
    <div className="profile-page-container container">
      <div className="profile-layout-grid">
        {/* Left Column: Account Overview Card */}
        <div className="profile-overview-col">
          <div className="profile-summary-box">
            <div className="profile-large-avatar">
              {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <h2 className="profile-user-name">{formData.name}</h2>
            <p className="profile-user-email">{formData.email}</p>
            <div className="mt-2">
              <span className="badge badge-blue">
                {user?.role ? user.role.toUpperCase() : 'CANDIDATE'}
              </span>
            </div>

            <div className="profile-metadata-divider" />

            <div className="profile-meta-lines">
              <div className="meta-line">
                <ShieldCheck size={16} className="text-success" />
                <span>Verified Candidate Account</span>
              </div>
              <div className="meta-line">
                <Calendar size={16} className="text-muted" />
                <span>
                  Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2026'}
                </span>
              </div>
            </div>

            <div className="profile-metadata-divider" />

            {/* Quick Skills Display */}
            <div className="profile-skills-summary">
              <h4 className="skills-subhead">Top Skills ({formData.skills.length})</h4>
              <div className="skills-tags-cluster">
                {formData.skills.length > 0 ? (
                  formData.skills.map((skill, index) => (
                    <span key={index} className="skill-pill">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-muted text-xs">No skills listed yet. Add skills on the right.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="profile-edit-col">
          <div className="profile-edit-card">
            <div className="card-header-line">
              <h1 className="profile-heading">Profile & Preferences</h1>
              <p className="profile-subheading">Update your candidate information and technical skill tags</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="profile-form">
              <div className="form-grid-2col">
                <InputField
                  label="Full Name"
                  id="profile-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  icon={<User size={16} />}
                  required
                />

                <InputField
                  label="Email Address"
                  id="profile-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@domain.com"
                  icon={<Mail size={16} />}
                  disabled
                  helperText="Primary account email cannot be altered."
                />
              </div>

              <div className="form-grid-2col">
                <InputField
                  label="Phone Number"
                  id="profile-phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  icon={<Phone size={16} />}
                  helperText="Visible to recruiters for interview scheduling."
                />

                {user?.role === 'recruiter' && (
                  <InputField
                    label="Company Name"
                    id="profile-company"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Your organization name"
                    icon={<Building size={16} />}
                  />
                )}
              </div>

              <InputField
                label="Headline & Professional Bio"
                id="profile-bio"
                name="bio"
                type="textarea"
                rows={3}
                value={formData.bio}
                onChange={handleChange}
                placeholder="Share your technical interests, career focus, and aspirations..."
                helperText="Summarize your background in 2-3 sentences."
              />

              {/* Skills Tag Management */}
              <div className="skills-management-section">
                <label className="form-label" htmlFor="skill-input">
                  Technical Skills & Technologies
                </label>
                <div className="skill-input-row">
                  <input
                    type="text"
                    id="skill-input"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="e.g. React.js, Node.js, Python, Figma"
                    className="form-input flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill(e);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    icon={<Plus size={16} />}
                    onClick={handleAddSkill}
                  >
                    Add Skill
                  </Button>
                </div>

                {/* Skill Badges with Delete button */}
                <div className="active-skills-list mt-3">
                  {formData.skills.map((skill, index) => (
                    <span key={index} className="editable-skill-badge">
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        aria-label={`Remove ${skill}`}
                        className="skill-remove-btn"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="profile-form-footer">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={saving}
                  icon={<Save size={16} />}
                  id="save-profile-btn"
                >
                  Save Profile Changes
                </Button>
              </div>
            </form>

            {/* Danger Zone */}
            <div className="profile-danger-zone">
              <h3 className="danger-heading">Danger Zone</h3>
              <p className="danger-desc">
                Permanently delete your account and all associated applications. This action is irreversible.
              </p>
              <Button
                variant="danger"
                size="sm"
                icon={<Trash2 size={14} />}
                onClick={() => setDeleteModalOpen(true)}
                id="delete-account-btn"
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Account?"
        size="sm"
      >
        <div className="delete-modal-body">
          <p className="text-secondary">
            Are you sure you want to permanently delete your account (<strong>{user?.email}</strong>)?
          </p>
          <p className="text-danger text-sm mt-2">
            All submitted job applications, profile records, and bookmarks will be completely removed.
          </p>
          <div className="modal-actions-footer mt-6">
            <Button
              variant="secondary"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleting}
              onClick={handleDeleteAccount}
              id="confirm-delete-account-btn"
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;

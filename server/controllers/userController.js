import User from '../models/User.js';
import Application from '../models/Application.js';
import { sendSuccess, sendError } from '../utils/helpers.js';

// @desc    Get current user's profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return sendError(res, 404, 'User profile not found');
    }

    return sendSuccess(res, 200, 'Profile fetched successfully', {
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user's profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return sendError(res, 404, 'User profile not found');
    }

    const { name, phone, bio, skills, resumeUrl, companyName, currentPassword, newPassword } = req.body;

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (skills !== undefined) {
      user.skills = Array.isArray(skills) ? skills : skills.split(',').map((s) => s.trim());
    }
    if (resumeUrl !== undefined) user.resumeUrl = resumeUrl.trim();
    if (companyName !== undefined) user.companyName = companyName.trim();

    // Password change handling
    if (newPassword) {
      if (!currentPassword) {
        return sendError(res, 400, 'Current password is required to set a new password');
      }
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return sendError(res, 400, 'Current password does not match');
      }
      if (newPassword.length < 6) {
        return sendError(res, 400, 'New password must be at least 6 characters');
      }
      user.password = newPassword;
    }

    const updatedUser = await user.save();

    return sendSuccess(res, 200, 'Profile updated successfully', {
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        bio: updatedUser.bio,
        skills: updatedUser.skills,
        resumeUrl: updatedUser.resumeUrl,
        companyName: updatedUser.companyName,
        updatedAt: updatedUser.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete current user's profile
// @route   DELETE /api/users/profile
// @access  Private
export const deleteProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // Clean up applications submitted by this user
    await Application.deleteMany({ applicant: user._id });

    // Delete user
    await User.findByIdAndDelete(user._id);

    return sendSuccess(res, 200, 'User profile and related records deleted successfully');
  } catch (error) {
    next(error);
  }
};

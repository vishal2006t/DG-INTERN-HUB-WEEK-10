import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/helpers.js';

// Helper to generate JWT token
export const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'dg_interns_hub_jwt_fallback_secret',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, bio, companyName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return sendError(res, 409, 'An account with this email address already exists');
    }

    // Default to candidate if not specified or invalid (admin cannot be self-assigned via public registration)
    const assignedRole = ['candidate', 'recruiter'].includes(role) ? role : 'candidate';

    // Create user (password is automatically hashed by Mongoose pre-save hook)
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: assignedRole,
      phone: phone || '',
      bio: bio || '',
      companyName: companyName || ''
    });

    const token = generateToken(user._id, user.role);

    return sendSuccess(res, 201, 'User registered successfully', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        bio: user.bio,
        skills: user.skills,
        companyName: user.companyName,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and explicitly include password field
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return sendError(res, 401, 'Invalid email or password');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password');
    }

    const token = generateToken(user._id, user.role);

    return sendSuccess(res, 200, 'Login successful', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        bio: user.bio,
        skills: user.skills,
        companyName: user.companyName,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged in user profile
// @route   GET /api/auth/me
// @access  Private (Authenticated)
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    return sendSuccess(res, 200, 'Current user retrieved successfully', {
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user (clears client session)
// @route   POST /api/auth/logout
// @access  Public / Private
export const logout = async (req, res) => {
  return sendSuccess(res, 200, 'Logged out successfully', null);
};

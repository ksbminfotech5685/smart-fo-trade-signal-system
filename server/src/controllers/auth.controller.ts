import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import * as KiteService from '../services/kite.service';
import { encrypt, decrypt, generateApiKey, generateApiSecret } from '../utils/encryption.util';

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists with this email or username'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      role: 'user',
      isAutoTradingEnabled: false,
      maxTradesPerDay: 3,
      maxCapitalPerTrade: 5000,
    });

    await user.save();

    // Create JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get user profile
 * @route GET /api/auth/profile
 * @access Private
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        zerodhaApiKey: user.zerodhaApiKey ? true : false,
        zerodhaAccessToken: user.zerodhaAccessToken ? true : false,
        isAutoTradingEnabled: user.isAutoTradingEnabled,
        maxTradesPerDay: user.maxTradesPerDay,
        maxCapitalPerTrade: user.maxCapitalPerTrade,
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update user profile
 * @route PUT /api/auth/profile
 * @access Private
 */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { username, email, maxTradesPerDay, maxCapitalPerTrade } = req.body;

    // Find user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided
    if (username) user.username = username;
    if (email) user.email = email;
    if (maxTradesPerDay) user.maxTradesPerDay = maxTradesPerDay;
    if (maxCapitalPerTrade) user.maxCapitalPerTrade = maxCapitalPerTrade;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        zerodhaApiKey: user.zerodhaApiKey ? true : false,
        zerodhaAccessToken: user.zerodhaAccessToken ? true : false,
        isAutoTradingEnabled: user.isAutoTradingEnabled,
        maxTradesPerDay: user.maxTradesPerDay,
        maxCapitalPerTrade: user.maxCapitalPerTrade,
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Change password
 * @route PUT /api/auth/change-password
 * @access Private
 */
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Find user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Set Zerodha API credentials
 * @route POST /api/auth/zerodha-credentials
 * @access Private
 */
export const setZerodhaCredentials = async (req: Request, res: Response) => {
  try {
    const { apiKey, apiSecret } = req.body;

    // Find user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update Zerodha credentials
    user.zerodhaApiKey = apiKey;
    user.zerodhaApiSecret = apiSecret;

    await user.save();

    // Generate login URL
    const loginUrl = KiteService.getLoginURL(apiKey);

    res.json({
      message: 'Zerodha API credentials updated successfully',
      loginUrl,
    });
  } catch (error) {
    console.error('Set Zerodha credentials error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Generate Zerodha session from request token
 * @route POST /api/auth/zerodha-session
 * @access Private
 */
export const generateZerodhaSession = async (req: Request, res: Response) => {
  try {
    const { requestToken } = req.body;

    // Find user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.zerodhaApiKey || !user.zerodhaApiSecret) {
      return res.status(400).json({ message: 'Zerodha API credentials not set' });
    }

    // Generate session
    const session = await KiteService.generateSession(
      user.zerodhaApiKey,
      user.zerodhaApiSecret,
      requestToken
    );

    // Store tokens
    user.zerodhaAccessToken = encrypt(session.access_token);

    if (session.refresh_token) {
      user.zerodhaRefreshToken = encrypt(session.refresh_token);
    }

    // Set expiry time (usually 1 day)
    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + 24);
    user.tokenExpiryTime = expiryTime;

    await user.save();

    res.json({
      message: 'Zerodha session generated successfully',
      expiryTime: user.tokenExpiryTime,
    });
  } catch (error) {
    console.error('Generate Zerodha session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Toggle auto-trading
 * @route POST /api/auth/toggle-auto-trading
 * @access Private
 */
export const toggleAutoTrading = async (req: Request, res: Response) => {
  try {
    const { enabled } = req.body;

    // Find user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if Zerodha credentials are set
    if (!user.zerodhaApiKey || !user.zerodhaAccessToken) {
      return res.status(400).json({ message: 'Zerodha API credentials not set or login required' });
    }

    // Toggle auto-trading
    user.isAutoTradingEnabled = enabled;
    await user.save();

    res.json({
      message: `Auto-trading ${enabled ? 'enabled' : 'disabled'} successfully`,
      isAutoTradingEnabled: user.isAutoTradingEnabled,
    });
  } catch (error) {
    console.error('Toggle auto-trading error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create admin user (first time setup)
 * @route POST /api/auth/create-admin
 * @access Public (only works if no admin user exists)
 */
export const createAdmin = async (req: Request, res: Response) => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ role: 'admin' });

    if (adminExists) {
      return res.status(400).json({ message: 'Admin user already exists' });
    }

    const { username, email, password } = req.body;

    // Create new admin user
    const admin = new User({
      username,
      email,
      password,
      role: 'admin',
      isAutoTradingEnabled: false,
      maxTradesPerDay: 5,
      maxCapitalPerTrade: 10000,
    });

    await admin.save();

    // Create JWT token
    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'Admin user created successfully',
      token,
      user: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

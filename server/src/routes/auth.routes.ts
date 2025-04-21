import express from 'express';
import * as AuthController from '../controllers/auth.controller';
import { auth, admin } from '../middleware/auth.middleware';
import { validate } from '../middleware/validator.middleware';
import { body } from 'express-validator';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('username')
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email')
    .isEmail().withMessage('Invalid email address'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email')
    .isEmail().withMessage('Invalid email address'),
  body('password')
    .notEmpty().withMessage('Password is required'),
];

const passwordChangeValidation = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];

const zerodhaCredentialsValidation = [
  body('apiKey')
    .notEmpty().withMessage('API key is required'),
  body('apiSecret')
    .notEmpty().withMessage('API secret is required'),
];

const zerodhaSessionValidation = [
  body('requestToken')
    .notEmpty().withMessage('Request token is required'),
];

const autoTradingValidation = [
  body('enabled')
    .isBoolean().withMessage('Enabled field must be a boolean'),
];

// Public routes
router.post('/register', validate(registerValidation), AuthController.register);
router.post('/login', validate(loginValidation), AuthController.login);
router.post('/create-admin', validate(registerValidation), AuthController.createAdmin);

// Protected routes
router.get('/profile', auth, AuthController.getProfile);
router.put('/profile', auth, AuthController.updateProfile);
router.put('/change-password', auth, validate(passwordChangeValidation), AuthController.changePassword);
router.post('/zerodha-credentials', auth, validate(zerodhaCredentialsValidation), AuthController.setZerodhaCredentials);
router.post('/zerodha-session', auth, validate(zerodhaSessionValidation), AuthController.generateZerodhaSession);
router.post('/toggle-auto-trading', auth, validate(autoTradingValidation), AuthController.toggleAutoTrading);

export default router;

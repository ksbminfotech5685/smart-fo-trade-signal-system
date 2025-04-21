import express from 'express';
import * as AdminController from '../controllers/admin.controller';
import { auth, admin } from '../middleware/auth.middleware';
import { validate } from '../middleware/validator.middleware';
import { body } from 'express-validator';

const router = express.Router();

// Validation rules
const notificationValidation = [
  body('message').notEmpty().withMessage('Message is required'),
  body('type').isIn(['info', 'warning', 'error']).withMessage('Type must be info, warning, or error'),
];

const schedulerValidation = [
  body('action').isIn(['start', 'stop']).withMessage('Action must be start or stop'),
];

// Admin routes
router.get('/status', auth, admin, AdminController.getSystemStatus);
router.get('/users', auth, admin, AdminController.getAllUsers);
router.get('/users/:id', auth, admin, AdminController.getUserById);
router.put('/users/:id', auth, admin, AdminController.updateUser);
router.delete('/users/:id', auth, admin, AdminController.deleteUser);
router.get('/analytics', auth, admin, AdminController.getAnalytics);
router.post('/send-notification', auth, admin, validate(notificationValidation), AdminController.sendNotification);
router.post('/scheduler', auth, admin, validate(schedulerValidation), AdminController.controlScheduler);
router.get('/orders', auth, admin, AdminController.getOrderHistory);

export default router;

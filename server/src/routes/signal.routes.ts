import express from 'express';
import * as SignalController from '../controllers/signal.controller';
import { auth, admin } from '../middleware/auth.middleware';
import { validate } from '../middleware/validator.middleware';
import { tradeSignalValidator } from '../middleware/validator.middleware';
import { body } from 'express-validator';

const router = express.Router();

// Validation rules
const createSignalValidation = [
  body('type').isIn(['BUY', 'SELL']).withMessage('Type must be either BUY or SELL'),
  body('stock').notEmpty().withMessage('Stock is required'),
  body('option').notEmpty().withMessage('Option is required'),
  body('currentMarketPrice').isNumeric().withMessage('Current market price must be a number'),
  body('entryPrice').isNumeric().withMessage('Entry price must be a number'),
  body('targetPrice').isNumeric().withMessage('Target price must be a number'),
  body('stopLoss').isNumeric().withMessage('Stop loss must be a number'),
  body('riskRewardRatio').notEmpty().withMessage('Risk reward ratio is required'),
];

// Signal routes
router.get('/', auth, SignalController.getAllSignals);
router.get('/today', auth, SignalController.getTodaySignals);
router.get('/stats', auth, SignalController.getSignalStats);
router.get('/:id', auth, SignalController.getSignalById);

// Admin-only routes
router.post('/', auth, admin, validate(createSignalValidation), tradeSignalValidator, SignalController.createSignal);
router.put('/:id', auth, admin, SignalController.updateSignal);
router.delete('/:id', auth, admin, SignalController.deleteSignal);
router.post('/generate', auth, admin, SignalController.generateSignals);

export default router;

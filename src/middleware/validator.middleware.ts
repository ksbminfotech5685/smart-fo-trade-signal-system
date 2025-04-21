import type { Request, Response, NextFunction } from 'express';
import { validationResult, type ValidationChain } from 'express-validator';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Execute all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Format validation errors
    const formattedErrors = errors.array().reduce((acc: any, error: any) => {
      const { param, msg } = error;
      if (!acc[param]) {
        acc[param] = [];
      }
      acc[param].push(msg);
      return acc;
    }, {});

    // Return validation errors
    return res.status(400).json({
      message: 'Validation Error',
      errors: formattedErrors,
    });
  };
};

// Specific validation middleware for API tokens
export const apiTokenValidator = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.header('X-API-KEY');
  const apiSecret = req.header('X-API-SECRET');

  if (!apiKey || !apiSecret) {
    return res.status(400).json({
      message: 'API Key and Secret are required',
      errors: {
        api: 'Missing API Key or Secret',
      },
    });
  }

  // Check if API key and secret match a specific pattern
  const apiKeyPattern = /^[a-zA-Z0-9]{8,}$/;
  const apiSecretPattern = /^[a-zA-Z0-9]{32,}$/;

  if (!apiKeyPattern.test(apiKey)) {
    return res.status(400).json({
      message: 'Invalid API Key format',
      errors: {
        apiKey: 'API Key should be at least 8 alphanumeric characters',
      },
    });
  }

  if (!apiSecretPattern.test(apiSecret)) {
    return res.status(400).json({
      message: 'Invalid API Secret format',
      errors: {
        apiSecret: 'API Secret should be at least 32 alphanumeric characters',
      },
    });
  }

  next();
};

// Specific validation middleware for trade signals
export const tradeSignalValidator = (req: Request, res: Response, next: NextFunction) => {
  const { type, entryPrice, targetPrice, stopLoss } = req.body;

  if (!type || !entryPrice || !targetPrice || !stopLoss) {
    return res.status(400).json({
      message: 'Missing required trade signal parameters',
      errors: {
        trade: 'Type, entry price, target price, and stop loss are required',
      },
    });
  }

  if (type !== 'BUY' && type !== 'SELL') {
    return res.status(400).json({
      message: 'Invalid trade type',
      errors: {
        type: 'Trade type must be either BUY or SELL',
      },
    });
  }

  // For BUY signals, target should be higher than entry, and stop loss lower
  if (type === 'BUY') {
    if (Number.parseFloat(targetPrice) <= Number.parseFloat(entryPrice)) {
      return res.status(400).json({
        message: 'Invalid target price for BUY signal',
        errors: {
          targetPrice: 'Target price must be higher than entry price for BUY signals',
        },
      });
    }

    if (Number.parseFloat(stopLoss) >= Number.parseFloat(entryPrice)) {
      return res.status(400).json({
        message: 'Invalid stop loss for BUY signal',
        errors: {
          stopLoss: 'Stop loss must be lower than entry price for BUY signals',
        },
      });
    }
  }

  // For SELL signals, target should be lower than entry, and stop loss higher
  if (type === 'SELL') {
    if (Number.parseFloat(targetPrice) >= Number.parseFloat(entryPrice)) {
      return res.status(400).json({
        message: 'Invalid target price for SELL signal',
        errors: {
          targetPrice: 'Target price must be lower than entry price for SELL signals',
        },
      });
    }

    if (Number.parseFloat(stopLoss) <= Number.parseFloat(entryPrice)) {
      return res.status(400).json({
        message: 'Invalid stop loss for SELL signal',
        errors: {
          stopLoss: 'Stop loss must be higher than entry price for SELL signals',
        },
      });
    }
  }

  next();
};

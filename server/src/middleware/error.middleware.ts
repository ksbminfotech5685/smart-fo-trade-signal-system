import type { Request, Response, NextFunction } from 'express';

// Not Found Error Handler
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// General Error Handler
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  console.error(`Error: ${err.message}`);
  console.error(`Stack: ${err.stack}`);

  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};

// Validation Error Handler
export const validationErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err && err.errors) {
    // Format validation errors
    const formattedErrors = Object.keys(err.errors).reduce((acc: any, key) => {
      acc[key] = err.errors[key].message;
      return acc;
    }, {});

    return res.status(400).json({
      message: 'Validation Error',
      errors: formattedErrors,
    });
  }

  next(err);
};

// Market Hours Check Middleware
export const marketHoursCheck = (req: Request, res: Response, next: NextFunction) => {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  const minute = now.getMinutes();

  // Check if it's a weekend (0 = Sunday, 6 = Saturday)
  if (day === 0 || day === 6) {
    return res.status(403).json({
      message: 'Market is closed on weekends',
    });
  }

  // Check if it's outside market hours (9:15 AM to 3:30 PM)
  if (hour < 9 || (hour === 9 && minute < 15) || hour > 15 || (hour === 15 && minute > 30)) {
    return res.status(403).json({
      message: 'Market is closed. Trading hours are 9:15 AM to 3:30 PM',
    });
  }

  next();
};

// Market Hours Info Middleware (doesn't block, just informs)
export const marketHoursInfo = (req: Request, res: Response, next: NextFunction) => {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  const minute = now.getMinutes();

  // Check if it's a weekend (0 = Sunday, 6 = Saturday)
  if (day === 0 || day === 6) {
    req.body.marketClosed = true;
    req.body.marketMessage = 'Market is closed on weekends';
  }

  // Check if it's outside market hours (9:15 AM to 3:30 PM)
  else if (hour < 9 || (hour === 9 && minute < 15) || hour > 15 || (hour === 15 && minute > 30)) {
    req.body.marketClosed = true;
    req.body.marketMessage = 'Market is closed. Trading hours are 9:15 AM to 3:30 PM';
  } else {
    req.body.marketClosed = false;
    req.body.marketMessage = 'Market is open';
  }

  next();
};

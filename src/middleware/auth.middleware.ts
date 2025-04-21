import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

// Extend the Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No authentication token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };

    // Find user by id
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Token is valid but user no longer exists' });
    }

    // Set user in request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export const admin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin permission required' });
  }
};

export const validateApiToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const apiKey = req.header('X-API-KEY');

    if (!apiKey) {
      return res.status(401).json({ message: 'No API key, authorization denied' });
    }

    // Find user by API key
    const user = await User.findOne({ zerodhaApiKey: apiKey });

    if (!user) {
      return res.status(401).json({ message: 'Invalid API key' });
    }

    // Set user in request object
    req.user = user;
    next();
  } catch (error) {
    console.error('API token validation error:', error);
    res.status(401).json({ message: 'Invalid API key' });
  }
};

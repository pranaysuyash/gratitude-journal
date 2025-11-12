/**
 * Authentication Middleware
 * JWT verification and user authentication
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import logger from '../utils/logger';

interface JWTPayload {
  userId: string;
  iat: number;
  exp: number;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Authenticate user with JWT token
 */
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    // Get user from database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }

    logger.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Check if user has premium subscription
 */
export async function requirePremium(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (req.user.subscription.tier === 'free') {
      return res.status(403).json({ error: 'Premium subscription required' });
    }

    if (req.user.subscription.status !== 'active') {
      return res.status(403).json({ error: 'Subscription is not active' });
    }

    next();
  } catch (error: any) {
    logger.error('Premium check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Check if user is admin
 */
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Check if user has admin role (you'd need to add this to User model)
    // For now, just check if user email is in admin list
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',');
    if (!adminEmails.includes(req.user.email)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error: any) {
    logger.error('Admin check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Optional authentication (doesn't fail if no token)
 */
export async function optionalAuthenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    const user = await User.findById(decoded.userId);

    if (user) {
      req.user = user;
    }

    next();
  } catch (error: any) {
    // Just continue without user
    next();
  }
}

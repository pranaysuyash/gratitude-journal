/**
 * Error Handler Middleware
 * Global error handling for Express
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

interface ErrorResponse {
  error: string;
  message?: string;
  stack?: string;
  details?: any;
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // Log error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    user: req.user?.id,
  });

  // Default error response
  const errorResponse: ErrorResponse = {
    error: err.name || 'Error',
    message: err.message || 'An error occurred',
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  // Handle specific error types
  let statusCode = 500;

  switch (err.name) {
    case 'ValidationError':
      statusCode = 400;
      errorResponse.details = err.errors;
      break;

    case 'CastError':
      statusCode = 400;
      errorResponse.message = 'Invalid ID format';
      break;

    case 'MongoServerError':
      if (err.code === 11000) {
        statusCode = 409;
        errorResponse.message = 'Duplicate key error';
        errorResponse.details = err.keyValue;
      }
      break;

    case 'JsonWebTokenError':
      statusCode = 401;
      errorResponse.message = 'Invalid token';
      break;

    case 'TokenExpiredError':
      statusCode = 401;
      errorResponse.message = 'Token expired';
      break;

    case 'MulterError':
      statusCode = 400;
      if (err.code === 'LIMIT_FILE_SIZE') {
        errorResponse.message = 'File too large';
      } else if (err.code === 'LIMIT_FILE_COUNT') {
        errorResponse.message = 'Too many files';
      }
      break;

    case 'UnauthorizedError':
      statusCode = 401;
      break;

    case 'ForbiddenError':
      statusCode = 403;
      break;

    case 'NotFoundError':
      statusCode = 404;
      break;

    default:
      if (err.statusCode) {
        statusCode = err.statusCode;
      }
  }

  res.status(statusCode).json(errorResponse);
}

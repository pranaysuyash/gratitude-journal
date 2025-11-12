/**
 * Gratitude Journal Backend API Server
 * Complete REST API for all platforms
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import http from 'http';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

// Routes
import authRoutes from './routes/auth';
import entriesRoutes from './routes/entries';
import usersRoutes from './routes/users';
import goalsRoutes from './routes/goals';
import badgesRoutes from './routes/badges';
import collectionsRoutes from './routes/collections';
import remindersRoutes from './routes/reminders';
import analyticsRoutes from './routes/analytics';
import socialRoutes from './routes/social';
import aiRoutes from './routes/ai';
import exportRoutes from './routes/export';
import integrationsRoutes from './routes/integrations';
import adminRoutes from './routes/admin';

// Middleware
import { errorHandler } from './middleware/errorHandler';
import { authenticate } from './middleware/auth';
import logger from './utils/logger';

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Application = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  },
});

// Constants
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gratitude-journal';

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Gratitude Journal API',
      version: '1.0.0',
      description: 'Complete REST API for Gratitude Journal application',
      contact: {
        name: 'API Support',
        email: 'support@gratitudejournal.app',
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
      {
        url: 'https://api.gratitudejournal.app',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Security Middleware
app.use(helmet());
app.use(mongoSanitize());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }));
}

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/entries', authenticate, entriesRoutes);
app.use('/api/v1/users', authenticate, usersRoutes);
app.use('/api/v1/goals', authenticate, goalsRoutes);
app.use('/api/v1/badges', authenticate, badgesRoutes);
app.use('/api/v1/collections', authenticate, collectionsRoutes);
app.use('/api/v1/reminders', authenticate, remindersRoutes);
app.use('/api/v1/analytics', authenticate, analyticsRoutes);
app.use('/api/v1/social', authenticate, socialRoutes);
app.use('/api/v1/ai', authenticate, aiRoutes);
app.use('/api/v1/export', authenticate, exportRoutes);
app.use('/api/v1/integrations', authenticate, integrationsRoutes);
app.use('/api/v1/admin', authenticate, adminRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found`,
  });
});

// Error handler
app.use(errorHandler);

// Socket.IO for real-time features
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on('join-family-journal', (familyId: string) => {
    socket.join(`family-${familyId}`);
    logger.info(`Client ${socket.id} joined family ${familyId}`);
  });

  socket.on('new-family-entry', (data) => {
    io.to(`family-${data.familyId}`).emit('family-entry-added', data);
  });

  socket.on('join-group-challenge', (challengeId: string) => {
    socket.join(`challenge-${challengeId}`);
  });

  socket.on('challenge-progress-update', (data) => {
    io.to(`challenge-${data.challengeId}`).emit('challenge-progress', data);
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Database connection
mongoose
  .connect(MONGO_URI)
  .then(() => {
    logger.info('✅ MongoDB connected successfully');

    // Start server
    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      logger.info(`🏥 Health Check: http://localhost:${PORT}/health`);
    });
  })
  .catch((error) => {
    logger.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
  });
});

export { io };
export default app;

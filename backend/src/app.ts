import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import routes from './routes';
import { errorHandler, createRateLimiter } from './middlewares';
import { cacheService } from './services/cache.service';
import { schedulerService } from './services/scheduler.service';
import { wsService } from './services/websocket.service';
import { createServer } from 'http';

// Load environment variables
dotenv.config();

// Initialize Prisma Client
export const prisma = new PrismaClient();

// Create Express application
const app: Application = express();
const server = createServer(app);

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 全局 API 限流：每分钟 100 次请求
app.use('/api', createRateLimiter({
  windowMs: 60 * 1000,
  max: 100,
  keyPrefix: 'global',
  message: '请求过于频繁，请稍后再试',
}));

// API routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use(errorHandler);

// Server configuration
const PORT = process.env.PORT || 3000;

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('Database connected successfully');

    // Initialize Redis connection
    await cacheService.connect();
    if (cacheService.isConnected()) {
      console.log('Redis connected successfully');
    } else {
      console.log('Redis not available, running without cache');
    }

    // Initialize and start scheduler
    await schedulerService.init();
    schedulerService.startAll();

    // Initialize WebSocket server
    wsService.init(server);

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`WebSocket available at ws://localhost:${PORT}/ws`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

startServer();

export default app;

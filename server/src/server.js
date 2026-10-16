import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { connectDB } from './config/db.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: false
}));

// CORS Configuration
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-region-id', 'x-household-token', 'x-volunteer-token']
}));

// Request parsers
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

// HTTP Logger
app.use(pinoHttp({
  logger,
  autoLogging: {
    ignore: (req) => req.url.includes('/health') || req.url.includes('/favicon.ico')
  }
}));

// Global rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

// Strict rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: { success: false, message: 'Too many login attempts, please try again later.' }
});
app.use('/api/auth/login', authLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', time: new Date(), version: '1.0.0' });
});

// Central API Routes
app.use('/api', routes);

// 404 handler for unmatched API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Error handling middleware
app.use(errorHandler);

// Start server function
async function startServer() {
  await connectDB();
  const server = app.listen(env.PORT, () => {
    logger.info(`🛡️ AegisFlow Disaster Response API running on http://localhost:${env.PORT} in ${env.NODE_ENV} mode`);
  });

  return server;
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;

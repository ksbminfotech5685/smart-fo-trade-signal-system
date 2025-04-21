import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import http from 'http';

// Import middleware
import { notFound, errorHandler, validationErrorHandler } from './src/middleware/error.middleware';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './src/routes/auth.routes';
import marketDataRoutes from './src/routes/marketData.routes';
import signalRoutes from './src/routes/signal.routes';
import orderRoutes from './src/routes/order.routes';
import adminRoutes from './src/routes/admin.routes';

// Import services
import * as KiteService from './src/services/kite.service';
import * as TelegramService from './src/services/telegram.service';
import * as SchedulerService from './src/services/scheduler.service';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/market-data', marketDataRoutes);
app.use('/api/signals', signalRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Error handlers
app.use(validationErrorHandler);
app.use(notFound);
app.use(errorHandler);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');

  ws.on('message', (message) => {
    console.log('Received message:', message);
  });

  ws.on('close', () => {
    console.log('Client disconnected from WebSocket');
  });
});

// Initialize services
KiteService.initializeKiteService()
  .then(() => console.log('Kite Service initialized'))
  .catch(err => console.error('Failed to initialize Kite Service:', err));

TelegramService.initializeTelegramBot()
  .then(() => console.log('Telegram Bot initialized'))
  .catch(err => console.error('Failed to initialize Telegram Bot:', err));

// Initialize schedulers if not in development mode
if (process.env.NODE_ENV !== 'development') {
  SchedulerService.initializeSchedulers();
  SchedulerService.scheduleTokenRefresh();
}

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

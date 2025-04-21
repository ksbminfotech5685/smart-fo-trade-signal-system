import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import http from 'http';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.routes';
import marketDataRoutes from './routes/marketData.routes';
import signalRoutes from './routes/signal.routes';
import orderRoutes from './routes/order.routes';
import adminRoutes from './routes/admin.routes';

// Import services
import { initializeKiteService } from './services/kite.service';
import { initializeTelegramBot } from './services/telegram.service';

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
initializeKiteService();
initializeTelegramBot();

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

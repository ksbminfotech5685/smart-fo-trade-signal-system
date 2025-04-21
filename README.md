# Smart F&O Trade Signal System - Backend Server

Backend server for the Smart F&O Trade Signal System, a full-stack application for futures and options trading with signal generation and order execution capabilities.

## Features

- User authentication and authorization
- Signal generation and management
- Order tracking and execution
- Real-time market data processing
- Technical indicator calculations
- Telegram notifications
- Admin dashboard with user management
- Analytics and performance metrics
- Zerodha API integration

## Technology Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- WebSockets
- Zerodha Kite Connect API
- Telegram Bot API
- TypeScript

## Configuration

The application uses environment variables for configuration:

```
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your_jwt_secret_key
ZERODHA_API_KEY=your_zerodha_api_key
ZERODHA_API_SECRET=your_zerodha_api_secret
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHANNEL_ID=your_telegram_channel_id
NODE_ENV=production
```

## Setup and Installation

1. Clone the repository
2. Install dependencies: `npm install` or `bun install`
3. Create a `.env` file with the required environment variables
4. Build the project: `npm run build` or `bun run build`
5. Start the server: `npm start` or `bun start`

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login a user
- GET /api/auth/profile - Get user profile
- PUT /api/auth/profile - Update user profile
- POST /api/auth/zerodha-credentials - Set Zerodha API credentials
- POST /api/auth/zerodha-session - Generate Zerodha session

### Signals
- GET /api/signals - Get all signals
- GET /api/signals/:id - Get signal by ID
- POST /api/signals/generate - Generate a new signal
- GET /api/signals/stats - Get signal statistics

### Orders
- GET /api/orders - Get all orders
- GET /api/orders/:id - Get order by ID
- POST /api/orders/execute - Execute an order
- POST /api/orders/cancel - Cancel an order

### Market Data
- GET /api/market-data/:symbol - Get market data for a symbol
- GET /api/market-data/historical/:symbol - Get historical data
- GET /api/market-data/top-gainers - Get top gainers
- GET /api/market-data/top-losers - Get top losers
- GET /api/market-data/status - Get market status

### Admin
- GET /api/admin/users - Get all users
- GET /api/admin/users/:id - Get user by ID
- PUT /api/admin/users/:id - Update user
- DELETE /api/admin/users/:id - Delete user
- GET /api/admin/system-status - Get system status
- POST /api/admin/refresh-market-data - Refresh market data
- GET /api/admin/analytics - Get analytics data

## Initial Admin Setup

After deploying, create an admin user by sending a POST request:

```
POST /api/auth/create-admin
Content-Type: application/json

{
  "username": "admin",
  "email": "admin@example.com",
  "password": "admin123"
}
```

## License

MIT

# Server Deployment Guide

## Backend Deployment on Render.com

The backend server for the Smart F&O Trade Signal System should be deployed on Render.com as a Web Service. Follow these steps:

1. Create a new account on [Render.com](https://render.com) if you don't have one already
2. Click on "New +" and select "Web Service"
3. Connect your GitHub repository or use the "Deploy from an existing repository" option
4. Configure your Web Service with the following settings:

### Basic Configuration
- **Name**: smart-fo-signal-api
- **Region**: Choose the region closest to your users (e.g., Singapore for Asia)
- **Branch**: main (or your preferred branch)
- **Root Directory**: server
- **Runtime**: Node
- **Build Command**: `npm install && npm run build` (or `bun install && bun run build` if using Bun)
- **Start Command**: `npm start` (or `bun start` if using Bun)

### Advanced Configuration
- **Environment Variables**:
  ```
  PORT=10000
  MONGODB_URI=mongodb+srv://ksbmabhishek:OiAK7cRudefU45O8@cluster0.qxcgatc.mongodb.net/fotradedb?retryWrites=true&w=majority&appName=Cluster0
  JWT_SECRET=your_jwt_secret_key
  ZERODHA_API_KEY=your_zerodha_api_key
  ZERODHA_API_SECRET=your_zerodha_api_secret
  TELEGRAM_BOT_TOKEN=7765890634:AAESgjPoxIQpSgj69gfLj2Ig-nW5EGaAoVE
  TELEGRAM_CHANNEL_ID=AI_fosoftware
  NODE_ENV=production
  ```

- **Health Check Path**: `/api/health`
- **Plan**: Free (Starter) for testing or Basic for production

## Setting up Initial Database

After the server is deployed, you'll need to make a POST request to create the initial admin user:

```
POST https://smart-fo-signal-api.onrender.com/api/auth/create-admin
Content-Type: application/json

{
  "username": "admin",
  "email": "admin@example.com",
  "password": "admin123"
}
```

You can use tools like Postman or cURL to make this request.

## Configuring CORS (if needed)

If you encounter CORS issues, you may need to update the server's CORS configuration to allow requests from your frontend domain:

```typescript
// In server/src/index.ts
app.use(cors({
  origin: ['https://your-frontend-domain.com', 'http://localhost:5173'],
  credentials: true
}));
```

## Monitoring and Logs

Render.com provides built-in logs and metrics for your service. You can access them from the dashboard:
1. Go to your Web Service
2. Click on "Logs" in the left sidebar

## Regular Maintenance

1. **Database Backup**: Set up regular backups of your MongoDB data
2. **Server Updates**: Periodically update dependencies for security patches
3. **Log Rotation**: Monitor log size to prevent disk space issues

## Frontend Integration

The frontend deployment should point to this backend server. The Netlify.toml configuration in the frontend project has already been updated to proxy API requests to this backend:

```toml
[[redirects]]
  from = "/api/*"
  to = "https://smart-fo-signal-api.onrender.com/api/:splat"
  status = 200
  force = true
```

## Login Credentials

After initial setup, you can log in with:

**Admin User:**
- Email: admin@example.com
- Password: admin123

You can create additional users through the frontend after logging in as admin.

## Zerodha API Configuration

For the Zerodha API integration, use the following URLs in your Zerodha Developer Console:

- **Redirect URL**: `https://smart-fo-signal-api.onrender.com/api/auth/zerodha/callback`
- **Postback URL**: `https://smart-fo-signal-api.onrender.com/api/webhook/zerodha`

# Zerodha Kite API Setup Guide

## Zerodha Kite Connect API Setup

To set up the Zerodha Kite Connect API integration for this application, follow these steps:

1. First, create a Zerodha Kite Connect developer account at https://developers.kite.trade/
2. Register a new application with the following details:

### API Configuration Values:

- **Redirect URL**: `https://your-domain.com/api/auth/zerodha/callback`
  - For local development: `http://localhost:5000/api/auth/zerodha/callback`
  - For production: Use your actual domain

- **Postback URL**: Not needed for this application, but you can set it to:
  - `https://your-domain.com/api/webhook/zerodha`

3. After registering, you'll receive:
   - API Key
   - API Secret

4. Update the `.env` file in the server directory with these values:
   ```
   ZERODHA_API_KEY=your_api_key_here
   ZERODHA_API_SECRET=your_api_secret_here
   ```

## Authentication Flow

The application uses the following flow for Zerodha authentication:

1. User clicks "Connect to Zerodha" in the Settings page
2. User is redirected to Zerodha login page
3. After login, Zerodha redirects back to the callback URL with a request token
4. The application exchanges the request token for an access token
5. The access token is encrypted and stored in the database
6. The application uses this token for all Zerodha API requests

## Telegram Bot Setup

The Telegram bot is already configured with:
- Bot Token: `7765890634:AAESgjPoxIQpSgj69gfLj2Ig-nW5EGaAoVE`
- Channel ID: `AI_fosoftware`

Make sure the bot is added to your channel as an administrator to send messages.

## Important Files

Key files related to Zerodha integration:

1. `server/src/services/kite.service.ts` - Main service for Zerodha API interaction
2. `server/src/controllers/auth.controller.ts` - Handles Zerodha authentication
3. `src/pages/dashboard/SettingsPage.tsx` - Frontend for connecting Zerodha account
4. `server/.env` - Environment variables for API keys

## Technical Notes

- The system uses the `kiteconnect` Node.js library to interact with Zerodha's API
- Tokens are encrypted in the database for security
- The WebSocket connection is used for real-time market data
- Auto-reconnection is implemented for WebSocket disconnections
- The system periodically refreshes the access token to maintain connectivity

## Troubleshooting

If you encounter issues with Zerodha API:

1. Verify API keys in the `.env` file
2. Check console logs for specific errors
3. Ensure the redirect URL matches exactly what's configured in the Zerodha developer portal
4. For authentication issues, try reconnecting through the Settings page

# Simplified Deployment Steps

## Quick Deployment Steps

### 1. Deploying the Backend Server (on Render.com)

1. Log in to Render.com with your account
2. Click on "New" and select "Web Service"
3. In the "Public Git repository" field, paste your GitHub repository URL (or use "Deploy from existing source code")
4. Configure the service:
   - Name: smart-fo-signal-api
   - Root Directory: server-only (or leave empty if using a separate repository just for the server code)
   - Runtime: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Set Environment Variables:
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
   - Set Health Check Path to: `/api/health`
   - Click "Create Web Service"

5. After deployment, copy the URL (it will look like `https://smart-fo-signal-api.onrender.com`)

### 2. Deploying the Frontend (on Netlify)

The frontend is already deployed at: https://same-8ly4hmvppol-latest.netlify.app

If you need to redeploy:

1. Make sure the `netlify.toml` file in the frontend project has the correct API URL:
   ```toml
   [[redirects]]
     from = "/api/*"
     to = "https://smart-fo-signal-api.onrender.com/api/:splat"
     status = 200
     force = true
   ```

2. Build and deploy the frontend to Netlify

### 3. Setting up Zerodha API Integration

In your Zerodha Developer Console:

1. Set Redirect URL to: `https://smart-fo-signal-api.onrender.com/api/auth/zerodha/callback`
2. Set Postback URL to: `https://smart-fo-signal-api.onrender.com/api/webhook/zerodha`
3. Get your API Key and Secret and update them in the backend environment variables

### 4. Creating Initial Admin User

After the backend is deployed, make this API call to create the admin user:

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

### 5. Login Credentials

Once setup is complete, you can log in with:

**Admin User:**
- Email: admin@example.com
- Password: admin123

### 6. Testing the Application

1. Log in with the admin credentials
2. Navigate to Settings and connect your Zerodha account
3. Check the Signals page to see generated signals
4. Set up auto-trading options if desired

# Shop Backend Deployment Guide

## ✅ Issues Fixed

1. **Package.json Start Script**: Fixed from `app.js` to `index.js`
2. **SQLite Configuration**: Properly configured for cloud deployment
3. **Admin User**: Created default admin credentials
4. **API Endpoint**: Login endpoint now works correctly

## 🚀 How to Fix Render Deployment

### Step 1: Update Render Environment Variables

In your Render dashboard, set these environment variables:

```
NODE_ENV=production
USE_SQLITE=true
JWT_SECRET=572f56cad4c2e436c3fa9f685aa68572
PORT=10000
DATABASE_PATH=/tmp/data/database.sqlite
```

### Step 2: Update Start Command

In Render dashboard, set the start command to:

```
bash startup.sh
```

### Step 3: Commit and Deploy

```bash
git add .
git commit -m "Fix deployment configuration"
git push origin main
```

## 🔧 Local Testing

### Start the server:

```bash
npm start
```

### Test the login endpoint:

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@example.com\",\"password\":\"password123\"}"
```

### Expected Response:

```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": 2,
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

## 🔐 Admin Credentials

- **Email**: admin@example.com
- **Password**: password123

## 📁 File Structure

```
shop-be/
├── index.js                 # Main server file
├── src/
│   ├── routes/auth.js       # Authentication routes
│   ├── controllers/authController.js
│   └── config/database.js   # Database configuration
├── package.json             # Fixed start script
├── render.yaml             # Render deployment config
├── startup.sh              # Startup script for Render
└── DEPLOYMENT_GUIDE.md     # This file
```

## 🔍 Troubleshooting

### If you still get "Something went wrong!" on Render:

1. Check Render logs for specific error messages
2. Ensure all environment variables are set
3. Verify the database file has write permissions
4. Check that the startup script runs successfully

### Common Issues:

- **Port conflicts**: Make sure PORT is set to 10000 on Render
- **Database permissions**: The startup.sh script handles this
- **Missing environment variables**: Double-check all variables are set

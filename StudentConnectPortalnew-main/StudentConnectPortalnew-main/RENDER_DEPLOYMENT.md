# Render Deployment Guide

This guide will help you deploy your StudyConnect application to Render.

## Prerequisites

1. Create a Render account at [render.com](https://render.com)
2. Have your MongoDB connection string ready
3. Have your Cloudinary credentials ready

## Backend Deployment

### Step 1: Deploy Backend Service

1. Go to your Render dashboard
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Select the `backend` folder as the root directory
5. Configure the service:
   - **Name**: `studyconnect-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free (or paid as needed)

### Step 2: Set Environment Variables for Backend

In your Render backend service settings, add these environment variables:

```
SECRET_KEY=your-jwt-secret-key-generate-a-strong-random-string
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/studyconnect
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
FRONTEND_URL=https://student-connect-portalnew.vercel.app
```

**Important**: Generate a strong SECRET_KEY using:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Step 3: Deploy and Get Backend URL

After deployment, your backend will be available at:
`https://studentconnectportalnew.onrender.com`

## Frontend Deployment

### Step 1: Deploy Frontend Static Site

1. Go to your Render dashboard
2. Click "New" → "Static Site"
3. Connect your GitHub repository
4. Select the root directory (not backend folder)
5. Configure the service:
   - **Name**: `studyconnect-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Plan**: Free

### Step 2: Set Environment Variables for Frontend

In your Render frontend service settings, add this environment variable:

```
VITE_API_URL=https://studentconnectportalnew.onrender.com
```

Replace `studentconnectportalnew` with your actual backend service name.

## Update CORS Settings

After deploying the frontend, update the backend environment variable:

```
FRONTEND_URL=https://your-actual-frontend-url.onrender.com
```

## Deployment Commands (Alternative Method)

If you prefer using Git deployment:

### Backend
```bash
cd backend
git init
git add .
git commit -m "Initial backend commit"
git remote add origin <your-backend-repo-url>
git push -u origin main
```

### Frontend
```bash
# From project root
git init
git add .
git commit -m "Initial frontend commit"
git remote add origin <your-frontend-repo-url>
git push -u origin main
```

## Environment Variable Templates

The following template files have been created for your reference:

- `backend/.env.render.backend` - Backend environment variables
- `.env.render.frontend` - Frontend environment variables

## Verification

1. Check backend health: `https://studentconnectportalnew.onrender.com/docs`
2. Check frontend: `https://your-frontend.onrender.com`
3. Test API calls from frontend to backend

## Troubleshooting

1. **CORS Issues**: Ensure FRONTEND_URL environment variable is set correctly
2. **Database Connection**: Verify MONGODB_URL is correct and database is accessible
3. **Build Failures**: Check logs in Render dashboard for specific error messages
4. **Environment Variables**: Ensure all required variables are set and have correct values

## Free Tier Limitations

- Backend services sleep after 15 minutes of inactivity
- Cold start delays when waking up
- 750 hours per month limit for web services
- Static sites have no limitations on free tier

## Costs

- Static Sites: Free
- Web Services: Free tier available, $7/month for always-on instances

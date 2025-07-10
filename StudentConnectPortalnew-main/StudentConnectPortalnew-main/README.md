# StudyConnect - Social Media Platform for Students

A complete social media platform built for students to share notes, job opportunities, and engage in discussions.

## Features

### Authentication
- User registration and login
- JWT-based authentication
- Password reset via email
- Profile management

### Posts System
- **Notes**: Share study materials with document uploads and tags
- **Jobs**: Post job opportunities with company details and application links
- **Threads**: Start discussions with comments and replies

### User Features
- User profiles with bio and profile pictures
- Search and filter posts
- File uploads (documents and images)
- Real-time interactions

## Tech Stack

### Frontend
- **React.js** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for build tooling

### Backend
- **FastAPI** (Python)
- **MongoDB Atlas** for database
- **JWT** for authentication
- **Cloudinary** for file storage
- **Gmail SMTP** for email notifications

### Deployment
- **Frontend**: Vercel
- **Backend**: Railway

## Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB Atlas account
- Cloudinary account
- Gmail account with app password

### Backend Setup

1. **Clone and navigate to backend directory**
```bash
cd backend
```

2. **Install Python dependencies**
```bash
pip install -r requirements.txt
```

3. **Environment Configuration**
Create a `.env` file in the backend directory:
```env
# Database
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/studyconnect

# JWT
SECRET_KEY=your-super-secret-key-change-in-production

# Gmail SMTP
GMAIL_EMAIL=your-email@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend URL
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

4. **Run the backend**
```bash
uvicorn main:app --reload
```

### Frontend Setup

1. **Install dependencies**
```bash
npm install
```

2. **Environment Configuration**
Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:8000
# For production: VITE_API_URL=https://your-backend-domain.railway.app
```

3. **Run the frontend**
```bash
npm run dev
```

## Deployment

### Backend Deployment (Railway)

1. **Connect your GitHub repository to Railway**
2. **Set environment variables in Railway dashboard**
3. **Railway will automatically deploy using the Dockerfile**

### Frontend Deployment (Vercel)

1. **Connect your GitHub repository to Vercel**
2. **Set environment variables in Vercel dashboard**:
   - `VITE_API_URL=https://your-backend-domain.railway.app`
3. **Vercel will automatically deploy**

## MongoDB Atlas Setup

1. **Create a MongoDB Atlas cluster**
2. **Create a database user**
3. **Whitelist your IP addresses**
4. **Get the connection string**

## Cloudinary Setup

1. **Create a Cloudinary account**
2. **Get your cloud name, API key, and API secret**
3. **Configure upload presets if needed**

## Gmail SMTP Setup

1. **Enable 2-factor authentication on your Gmail account**
2. **Generate an app password**
3. **Use the app password in your environment variables**

## API Endpoints

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password
- `GET /auth/me` - Get current user
- `PUT /auth/profile` - Update profile

### Posts
- `GET /posts` - Get posts with search/filter
- `POST /posts` - Create new post
- `POST /posts/{post_id}/replies` - Add reply to thread

### File Upload
- `POST /upload/image` - Upload profile pictures
- `POST /upload/document` - Upload documents

### Users
- `GET /users/{user_id}` - Get user profile

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  username: String,
  email: String,
  password: String (hashed),
  bio: String,
  profile_picture: String,
  created_at: DateTime
}
```

### Posts Collection
```javascript
{
  _id: ObjectId,
  author_id: ObjectId,
  author_name: String,
  author_username: String,
  author_profile_picture: String,
  type: String, // 'note', 'job', 'thread'
  title: String,
  content: String,
  tags: [String], // for notes
  company: String, // for jobs
  location: String, // for jobs
  job_link: String, // for jobs
  document_name: String, // for notes
  document_url: String, // for notes
  replies: [Reply], // for threads
  created_at: DateTime,
  updated_at: DateTime
}
```

### Password Resets Collection
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  token: String,
  expires_at: DateTime,
  used: Boolean
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License."# StudentCollab_hub" 

from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import os
import asyncio
import cloudinary
import cloudinary.uploader
from bson import ObjectId
import secrets
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize FastAPI
app = FastAPI(title="StudyConnect API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "https://student-connect-portalnew.vercel.app",
        "https://*.onrender.com",
        "https://studentconnectportalnew.onrender.com",
        os.getenv("FRONTEND_URL", "http://localhost:5173")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb+srv://admin:wbWR1zL8vNgWylMg@cluster0.nxklt.mongodb.net/studyconnect")

# Email configuration (temporarily disabled)
# GMAIL_EMAIL = os.getenv("GMAIL_EMAIL", "your-email@gmail.com")
# GMAIL_PASSWORD = os.getenv("GMAIL_APP_PASSWORD", "your-app-password")

# Cloudinary configuration
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME", "your-cloud-name"),
    api_key=os.getenv("CLOUDINARY_API_KEY", "your-api-key"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET", "your-api-secret")
)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# MongoDB client
client = AsyncIOMotorClient(MONGODB_URL)
db = client.studyconnect

# Pydantic models
class UserCreate(BaseModel):
    name: str
    username: str
    email: EmailStr
    password: str
    bio: Optional[str] = ""

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    bio: Optional[str] = None
    profile_picture: Optional[str] = None

class ForgotPassword(BaseModel):
    email: EmailStr

class ResetPassword(BaseModel):
    token: str
    new_password: str

class PostCreate(BaseModel):
    type: str  # 'note', 'job', 'thread'
    title: str
    content: str
    tags: Optional[List[str]] = []
    company: Optional[str] = None
    location: Optional[str] = None
    job_link: Optional[str] = None
    document_name: Optional[str] = None
    document_url: Optional[str] = None

class ReplyCreate(BaseModel):
    content: str

class Token(BaseModel):
    access_token: str
    token_type: str

class User(BaseModel):
    id: str
    name: str
    username: str
    email: str
    bio: str
    profile_picture: Optional[str] = None
    created_at: datetime

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise credentials_exception
    return user

def send_reset_email(email: str, reset_token: str):
    # Email functionality temporarily disabled for deployment
    # TODO: Implement email service (SendGrid, AWS SES, etc.)
    print(f"Password reset requested for {email}. Reset token: {reset_token}")
    print(f"Reset link would be: https://student-connect-portalnew.vercel.app/reset-password?token={reset_token}")
    
    # For now, we'll just log the reset token
    # In production, you should implement proper email service
    return True  # Return True to allow password reset flow to continue

# Routes
@app.get("/")
async def root():
    return {"message": "StudyConnect API is running!"}

@app.get("/health")
async def health_check():
    """Health check endpoint that tests database connectivity"""
    try:
        # Test database connection by listing collections
        collections = await db.list_collection_names()
        
        # Count documents in users collection
        user_count = await db.users.count_documents({})
        
        return {
            "status": "healthy",
            "database": "connected",
            "collections": collections,
            "user_count": user_count,
            "mongodb_url": MONGODB_URL.split("@")[-1] if "@" in MONGODB_URL else "localhost"  # Hide credentials
        }
    except Exception as e:
        raise HTTPException(
            status_code=503, 
            detail=f"Database connection failed: {str(e)}"
        )

@app.post("/auth/signup", response_model=dict)
async def signup(user: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"$or": [{"email": user.email}, {"username": user.username}]})
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email or username already exists")
    
    # Hash password
    hashed_password = get_password_hash(user.password)
    
    # Create user document
    user_doc = {
        "name": user.name,
        "username": user.username,  # <--- This is the username field
        "email": user.email,
        "password": hashed_password,
        "bio": user.bio,
        "profile_picture": None,
        "created_at": datetime.utcnow()
    }
    
    # Insert user
    result = await db.users.insert_one(user_doc)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(result.inserted_id)}, expires_delta=access_token_expires
    )
    
    # Get created user
    created_user = await db.users.find_one({"_id": result.inserted_id})
    user_response = {
        "id": str(created_user["_id"]),
        "name": created_user["name"],
        "username": created_user["username"],
        "email": created_user["email"],
        "bio": created_user["bio"],
        "profile_picture": created_user["profile_picture"]
    }
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_response
    }

@app.post("/auth/login", response_model=dict)
async def login(user_credentials: UserLogin):
    user = await db.users.find_one({"email": user_credentials.email})
    if not user or not verify_password(user_credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user["_id"])}, expires_delta=access_token_expires
    )
    
    user_response = {
        "id": str(user["_id"]),
        "name": user["name"],
        "username": user["username"],
        "email": user["email"],
        "bio": user["bio"],
        "profile_picture": user["profile_picture"]
    }
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_response
    }

@app.post("/auth/forgot-password")
async def forgot_password(request: ForgotPassword):
    user = await db.users.find_one({"email": request.email})
    if not user:
        # Don't reveal if email exists or not
        return {"message": "If the email exists, a reset link has been sent"}
    
    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=1)
    
    # Store reset token
    await db.password_resets.insert_one({
        "user_id": user["_id"],
        "token": reset_token,
        "expires_at": expires_at,
        "used": False
    })
    
    # Send email
    if send_reset_email(request.email, reset_token):
        return {"message": "If the email exists, a reset link has been sent"}
    else:
        raise HTTPException(status_code=500, detail="Failed to send reset email")

@app.post("/auth/reset-password")
async def reset_password(request: ResetPassword):
    # Find valid reset token
    reset_doc = await db.password_resets.find_one({
        "token": request.token,
        "expires_at": {"$gt": datetime.utcnow()},
        "used": False
    })
    
    if not reset_doc:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    # Update password
    hashed_password = get_password_hash(request.new_password)
    await db.users.update_one(
        {"_id": reset_doc["user_id"]},
        {"$set": {"password": hashed_password}}
    )
    
    # Mark token as used
    await db.password_resets.update_one(
        {"_id": reset_doc["_id"]},
        {"$set": {"used": True}}
    )
    
    return {"message": "Password reset successfully"}

@app.get("/auth/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    return {
        "id": str(current_user["_id"]),
        "name": current_user["name"],
        "username": current_user["username"],
        "email": current_user["email"],
        "bio": current_user["bio"],
        "profile_picture": current_user["profile_picture"],
        "created_at": current_user["created_at"]
    }

@app.put("/auth/profile")
async def update_profile(user_update: UserUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {}
    if user_update.name is not None:
        update_data["name"] = user_update.name
    if user_update.username is not None:
        # Check if username is already taken
        existing = await db.users.find_one({"username": user_update.username, "_id": {"$ne": current_user["_id"]}})
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken")
        update_data["username"] = user_update.username
    if user_update.email is not None:
        # Check if email is already taken
        existing = await db.users.find_one({"email": user_update.email, "_id": {"$ne": current_user["_id"]}})
        if existing:
            raise HTTPException(status_code=400, detail="Email already taken")
        update_data["email"] = user_update.email
    if user_update.bio is not None:
        update_data["bio"] = user_update.bio
    if user_update.profile_picture is not None:
        update_data["profile_picture"] = user_update.profile_picture
    
    if update_data:
        await db.users.update_one({"_id": current_user["_id"]}, {"$set": update_data})
    
    # Return updated user
    updated_user = await db.users.find_one({"_id": current_user["_id"]})
    return {
        "id": str(updated_user["_id"]),
        "name": updated_user["name"],
        "username": updated_user["username"],
        "email": updated_user["email"],
        "bio": updated_user["bio"],
        "profile_picture": updated_user["profile_picture"]
    }

@app.post("/upload/image")
async def upload_image(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    try:
        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            file.file,
            folder="studyconnect/profiles",
            public_id=f"user_{current_user['_id']}_{int(datetime.utcnow().timestamp())}"
        )
        return {"url": result["secure_url"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.post("/upload/document")
async def upload_document(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    try:
        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            file.file,
            folder="studyconnect/documents",
            resource_type="auto",
            public_id=f"doc_{current_user['_id']}_{int(datetime.utcnow().timestamp())}"
        )
        return {"url": result["secure_url"], "name": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.post("/posts")
async def create_post(post: PostCreate, current_user: dict = Depends(get_current_user)):
    post_doc = {
        "author_id": current_user["_id"],
        "author_name": current_user["name"],
        "author_username": current_user["username"],
        "author_profile_picture": current_user["profile_picture"],
        "type": post.type,
        "title": post.title,
        "content": post.content,
        "tags": post.tags,
        "company": post.company,
        "location": post.location,
        "job_link": post.job_link,
        "document_name": post.document_name,
        "document_url": post.document_url,
        "replies": [],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.posts.insert_one(post_doc)
    created_post = await db.posts.find_one({"_id": result.inserted_id})
    
    # Convert ObjectId to string
    created_post["id"] = str(created_post["_id"])
    created_post["author_id"] = str(created_post["author_id"])
    del created_post["_id"]
    
    return created_post

@app.get("/posts")
async def get_posts(skip: int = 0, limit: int = 20, search: str = None, category: str = None):
    query = {}
    
    if category and category != "all":
        query["type"] = category
    
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"content": {"$regex": search, "$options": "i"}},
            {"author_name": {"$regex": search, "$options": "i"}},
            {"author_username": {"$regex": search, "$options": "i"}},
            {"tags": {"$regex": search, "$options": "i"}}
        ]
    
    cursor = db.posts.find(query).sort("created_at", -1).skip(skip).limit(limit)
    posts = await cursor.to_list(length=limit)
    
    # Convert ObjectIds to strings
    for post in posts:
        post["id"] = str(post["_id"])
        post["author_id"] = str(post["author_id"])
        del post["_id"]
        
        # Convert reply ObjectIds
        for reply in post.get("replies", []):
            reply["id"] = str(reply["id"]) if "id" in reply else str(reply.get("_id", ""))
            reply["author_id"] = str(reply["author_id"])
    
    return posts

@app.post("/posts/{post_id}/replies")
async def add_reply(post_id: str, reply: ReplyCreate, current_user: dict = Depends(get_current_user)):
    try:
        post_object_id = ObjectId(post_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid post ID")
    
    post = await db.posts.find_one({"_id": post_object_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    reply_doc = {
        "id": ObjectId(),
        "author_id": current_user["_id"],
        "author_name": current_user["name"],
        "author_username": current_user["username"],
        "author_profile_picture": current_user["profile_picture"],
        "content": reply.content,
        "created_at": datetime.utcnow()
    }
    
    await db.posts.update_one(
        {"_id": post_object_id},
        {
            "$push": {"replies": reply_doc},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    # Convert ObjectIds to strings for response
    reply_doc["id"] = str(reply_doc["id"])
    reply_doc["author_id"] = str(reply_doc["author_id"])
    
    return reply_doc

@app.get("/users/{user_id}")
async def get_user_profile(user_id: str):
    try:
        user_object_id = ObjectId(user_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    user = await db.users.find_one({"_id": user_object_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user's posts count
    posts_count = await db.posts.count_documents({"author_id": user_object_id})
    
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "username": user["username"],
        "email": user["email"],
        "bio": user["bio"],
        "profile_picture": user["profile_picture"],
        "created_at": user["created_at"],
        "posts_count": posts_count
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
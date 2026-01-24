from fastapi import FastAPI, APIRouter, HTTPException, status, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from datetime import timedelta
from typing import Optional
import uuid

# Import local modules
from models import (
    User, UserCreate, UserLogin, UserResponse, 
    TokenResponse, ForgotPasswordRequest, ResetPasswordRequest
)
from auth import (
    verify_password, get_password_hash, 
    create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
)
from dependencies import get_current_user, set_database

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Set database for dependencies
set_database(db)

# Create the main app without a prefix
app = FastAPI(title="GAZ MAN API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============================================
# Authentication Endpoints
# ============================================

@api_router.post("/auth/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """Register a new user."""
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user = User(
        **user_data.model_dump(exclude={"password"}),
        password_hash=get_password_hash(user_data.password),
        role="client"
    )
    
    # Save to database
    user_dict = user.model_dump()
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    await db.users.insert_one(user_dict)
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.id},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    # Return token and user info
    user_response = UserResponse(**user.model_dump())
    return TokenResponse(access_token=access_token, user=user_response)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Login user and return JWT token."""
    # Find user by email
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    user = User(**user_doc)
    
    # Verify password
    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.id},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    # Return token and user info
    user_response = UserResponse(**user.model_dump())
    return TokenResponse(access_token=access_token, user=user_response)

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user."""
    return UserResponse(**current_user.model_dump())

@api_router.post("/auth/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    """Initiate password reset process."""
    # Check if user exists
    user_doc = await db.users.find_one({"email": request.email})
    if not user_doc:
        # Don't reveal if email exists or not for security
        return {"message": "If the email exists, a password reset link has been sent"}
    
    # Generate reset token (in production, this should be time-limited and stored)
    reset_token = str(uuid.uuid4())
    
    # Store reset token in database with expiration
    await db.password_resets.update_one(
        {"email": request.email},
        {
            "$set": {
                "reset_token": reset_token,
                "created_at": None,  # Would be datetime.utcnow().isoformat() in production
                "used": False
            }
        },
        upsert=True
    )
    
    # In production, send email with reset link
    # For MVP, we'll just return the token
    return {
        "message": "Password reset instructions sent to your email",
        "reset_token": reset_token  # Remove this in production
    }

@api_router.post("/auth/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """Reset password using reset token."""
    # Verify reset token
    reset_doc = await db.password_resets.find_one({
        "email": request.email,
        "reset_token": request.reset_token,
        "used": False
    })
    
    if not reset_doc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Update user password
    new_password_hash = get_password_hash(request.new_password)
    result = await db.users.update_one(
        {"email": request.email},
        {"$set": {"password_hash": new_password_hash}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Mark token as used
    await db.password_resets.update_one(
        {"email": request.email, "reset_token": request.reset_token},
        {"$set": {"used": True}}
    )
    
    return {"message": "Password reset successful"}

# ============================================
# Health Check Endpoints
# ============================================

@api_router.get("/")
async def root():
    """API health check."""
    return {"message": "GAZ MAN API is running", "version": "1.0.0"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
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
# Product Endpoints
# ============================================

@api_router.get("/products")
async def get_products(
    category: Optional[str] = None,
    brand: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = "name",
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    limit: int = 50
):
    """Get all products with optional filters and sorting."""
    query = {}
    
    # Apply filters
    if category:
        query["category"] = category
    if brand:
        query["brand"] = brand
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"brand": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    if min_price is not None or max_price is not None:
        query["price"] = {}
        if min_price is not None:
            query["price"]["$gte"] = min_price
        if max_price is not None:
            query["price"]["$lte"] = max_price
    
    # Determine sort order
    sort_field = sort_by if sort_by else "name"
    sort_order = 1  # ascending
    if sort_field.startswith("-"):
        sort_field = sort_field[1:]
        sort_order = -1
    
    # Execute query
    products = await db.products.find(query, {"_id": 0}).sort(sort_field, sort_order).limit(limit).to_list(limit)
    
    # Convert ISO timestamps to datetime
    for product in products:
        if isinstance(product.get('created_at'), str):
            product['created_at'] = datetime.fromisoformat(product['created_at'])
    
    return products

@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    """Get a single product by ID."""
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if isinstance(product.get('created_at'), str):
        product['created_at'] = datetime.fromisoformat(product['created_at'])
    
    return product

@api_router.get("/categories")
async def get_categories():
    """Get all unique product categories."""
    categories = await db.products.distinct("category")
    return {
        "categories": [
            {"value": "domestic", "label": "Domestic Gas"},
            {"value": "industrial", "label": "Industrial Gas"},
            {"value": "refill", "label": "Cylinder Refills"},
            {"value": "rental", "label": "Cylinder Rentals"},
            {"value": "installation", "label": "Installation & Maintenance"},
            {"value": "emergency", "label": "Emergency Intervention"}
        ]
    }

@api_router.get("/brands")
async def get_brands():
    """Get all unique brands."""
    brands = await db.products.distinct("brand")
    return {"brands": brands}

# ============================================
# Cart Endpoints
# ============================================

@api_router.get("/cart")
async def get_cart(current_user: User = Depends(get_current_user)):
    """Get current user's cart with calculated totals."""
    cart = await db.carts.find_one({"user_id": current_user.id}, {"_id": 0})
    
    if not cart:
        return {
            "id": None,
            "items": [],
            "subtotal": 0,
            "delivery_fee": 5.50,
            "total": 5.50
        }
    
    # Calculate totals
    subtotal = sum(item["price"] * item["quantity"] for item in cart.get("items", []))
    delivery_fee = 5.50
    total = subtotal + delivery_fee
    
    return {
        "id": cart.get("id"),
        "items": cart.get("items", []),
        "subtotal": round(subtotal, 2),
        "delivery_fee": delivery_fee,
        "total": round(total, 2)
    }

@api_router.post("/cart/items")
async def add_to_cart(
    product_id: str,
    quantity: int = 1,
    size: str = "medium",
    current_user: User = Depends(get_current_user)
):
    """Add item to cart or update quantity if exists."""
    # Verify product exists
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Get or create cart
    cart = await db.carts.find_one({"user_id": current_user.id})
    
    if not cart:
        # Create new cart
        cart_id = str(uuid.uuid4())
        cart = {
            "id": cart_id,
            "user_id": current_user.id,
            "items": [],
            "updated_at": datetime.utcnow().isoformat()
        }
    
    # Check if item already exists in cart
    items = cart.get("items", [])
    existing_item = None
    for item in items:
        if item["product_id"] == product_id and item["size"] == size:
            existing_item = item
            break
    
    if existing_item:
        # Update quantity
        existing_item["quantity"] += quantity
    else:
        # Add new item
        items.append({
            "product_id": product_id,
            "product_name": product["name"],
            "product_image": product["image_url"],
            "quantity": quantity,
            "size": size,
            "price": product["price"]
        })
    
    cart["items"] = items
    cart["updated_at"] = datetime.utcnow().isoformat()
    
    # Upsert cart
    await db.carts.update_one(
        {"user_id": current_user.id},
        {"$set": cart},
        upsert=True
    )
    
    return {"message": "Item added to cart", "cart_id": cart["id"]}

@api_router.put("/cart/items/{product_id}")
async def update_cart_item(
    product_id: str,
    quantity: int,
    size: str = "medium",
    current_user: User = Depends(get_current_user)
):
    """Update item quantity in cart."""
    cart = await db.carts.find_one({"user_id": current_user.id})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    items = cart.get("items", [])
    item_found = False
    
    for item in items:
        if item["product_id"] == product_id and item["size"] == size:
            if quantity <= 0:
                items.remove(item)
            else:
                item["quantity"] = quantity
            item_found = True
            break
    
    if not item_found:
        raise HTTPException(status_code=404, detail="Item not found in cart")
    
    cart["items"] = items
    cart["updated_at"] = datetime.utcnow().isoformat()
    
    await db.carts.update_one(
        {"user_id": current_user.id},
        {"$set": cart}
    )
    
    return {"message": "Cart updated"}

@api_router.delete("/cart/items/{product_id}")
async def remove_from_cart(
    product_id: str,
    size: str = "medium",
    current_user: User = Depends(get_current_user)
):
    """Remove item from cart."""
    cart = await db.carts.find_one({"user_id": current_user.id})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    items = cart.get("items", [])
    original_length = len(items)
    items = [item for item in items if not (item["product_id"] == product_id and item["size"] == size)]
    
    if len(items) == original_length:
        raise HTTPException(status_code=404, detail="Item not found in cart")
    
    cart["items"] = items
    cart["updated_at"] = datetime.utcnow().isoformat()
    
    await db.carts.update_one(
        {"user_id": current_user.id},
        {"$set": cart}
    )
    
    return {"message": "Item removed from cart"}

@api_router.delete("/cart")
async def clear_cart(current_user: User = Depends(get_current_user)):
    """Clear all items from cart."""
    await db.carts.delete_one({"user_id": current_user.id})
    return {"message": "Cart cleared"}

# ============================================
# Profile Endpoints
# ============================================

@api_router.get("/profile")
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get current user's profile."""
    return UserResponse(**current_user.model_dump())

@api_router.put("/profile")
async def update_profile(
    name: Optional[str] = None,
    address: Optional[str] = None,
    state: Optional[str] = None,
    language: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Update user profile."""
    update_data = {}
    if name is not None:
        update_data["name"] = name
    if address is not None:
        update_data["address"] = address
    if state is not None:
        update_data["state"] = state
    if language is not None:
        if language not in ["en", "fr"]:
            raise HTTPException(status_code=400, detail="Language must be 'en' or 'fr'")
        update_data["language"] = language
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data provided for update")
    
    result = await db.users.update_one(
        {"id": current_user.id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get updated user
    updated_user = await db.users.find_one({"id": current_user.id}, {"_id": 0})
    return UserResponse(**updated_user)

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
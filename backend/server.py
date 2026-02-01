from fastapi import FastAPI, APIRouter, HTTPException, status, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional
import uuid

# Import local modules
from models import (
    User, UserCreate, UserLogin, UserResponse, 
    TokenResponse, ForgotPasswordRequest, ResetPasswordRequest,
    AddToCartRequest, UpdateCartRequest, CheckoutRequest, Order, OrderItem,
    Address, AddressCreate, AddressUpdate
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
            "delivery_fee": 3500,
            "total": 3500
        }
    
    # Calculate totals (all in XAF - integers)
    subtotal = sum(item["price"] * item["quantity"] for item in cart.get("items", []))
    delivery_fee = 3500  # 3,500 FCFA
    total = subtotal + delivery_fee
    
    return {
        "id": cart.get("id"),
        "items": cart.get("items", []),
        "subtotal": subtotal,
        "delivery_fee": delivery_fee,
        "total": total
    }

@api_router.post("/cart/items")
async def add_to_cart(
    request: AddToCartRequest,
    current_user: User = Depends(get_current_user)
):
    """Add item to cart or update quantity if exists."""
    # Verify product exists
    product = await db.products.find_one({"id": request.product_id}, {"_id": 0})
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
        if item["product_id"] == request.product_id and item["size"] == request.size:
            existing_item = item
            break
    
    if existing_item:
        # Update quantity
        existing_item["quantity"] += request.quantity
    else:
        # Add new item
        items.append({
            "product_id": request.product_id,
            "product_name": product["name"],
            "product_image": product["image_url"],
            "quantity": request.quantity,
            "size": request.size,
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
    request: UpdateCartRequest,
    current_user: User = Depends(get_current_user)
):
    """Update item quantity in cart."""
    cart = await db.carts.find_one({"user_id": current_user.id})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    items = cart.get("items", [])
    item_found = False
    
    for item in items:
        if item["product_id"] == product_id and item["size"] == request.size:
            if request.quantity <= 0:
                items.remove(item)
            else:
                item["quantity"] = request.quantity
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
# Order Endpoints
# ============================================

@api_router.post("/orders")
async def create_order(
    checkout_data: CheckoutRequest,
    current_user: User = Depends(get_current_user)
):
    """Create order from cart and clear cart."""
    # Get cart
    cart = await db.carts.find_one({"user_id": current_user.id}, {"_id": 0})
    if not cart or not cart.get("items"):
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Calculate totals
    subtotal = sum(item["price"] * item["quantity"] for item in cart["items"])
    delivery_fee = 0 if subtotal >= 20000 else 3500
    total = subtotal + delivery_fee
    
    # Create order items with product images
    order_items = []
    for cart_item in cart["items"]:
        order_items.append({
            "product_id": cart_item["product_id"],
            "product_name": cart_item["product_name"],
            "product_image": cart_item["product_image"],
            "quantity": cart_item["quantity"],
            "size": cart_item["size"],
            "price": cart_item["price"]
        })
    
    # Create order
    order = Order(
        user_id=current_user.id,
        items=order_items,
        subtotal=subtotal,
        delivery_fee=delivery_fee,
        total=total,
        delivery_address=checkout_data.delivery_address,
        phone=checkout_data.phone,
        payment_method=checkout_data.payment_method,
        status="en_attente"
    )
    
    # Save order
    order_dict = order.model_dump()
    order_dict['created_at'] = order_dict['created_at'].isoformat()
    await db.orders.insert_one(order_dict)
    
    # Update stock for each product
    for item in order_items:
        await db.products.update_one(
            {"id": item["product_id"]},
            {"$inc": {"stock": -item["quantity"]}}
        )
    
    # Clear cart
    await db.carts.delete_one({"user_id": current_user.id})
    
    return {
        "message": "Order created successfully",
        "order_id": order.id,
        "total": total
    }

@api_router.get("/orders")
async def get_orders(current_user: User = Depends(get_current_user)):
    """Get all orders for current user."""
    orders = await db.orders.find(
        {"user_id": current_user.id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    # Convert ISO timestamps
    for order in orders:
        if isinstance(order.get('created_at'), str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
    
    return orders

@api_router.get("/orders/{order_id}")
async def get_order(
    order_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get single order by ID."""
    order = await db.orders.find_one(
        {"id": order_id, "user_id": current_user.id},
        {"_id": 0}
    )
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if isinstance(order.get('created_at'), str):
        order['created_at'] = datetime.fromisoformat(order['created_at'])
    
    return order

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
# Address Endpoints
# ============================================

@api_router.get("/addresses")
async def get_addresses(current_user: User = Depends(get_current_user)):
    """Get all addresses for current user."""
    addresses = await db.addresses.find(
        {"user_id": current_user.id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    return addresses

@api_router.post("/addresses", status_code=status.HTTP_201_CREATED)
async def create_address(
    address_data: AddressCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new address."""
    # If this is set as default, unset other defaults
    if address_data.is_default:
        await db.addresses.update_many(
            {"user_id": current_user.id},
            {"$set": {"is_default": False}}
        )
    
    # Check if user has no addresses, make this one default
    existing_count = await db.addresses.count_documents({"user_id": current_user.id})
    if existing_count == 0:
        address_data.is_default = True
    
    address = Address(
        **address_data.model_dump(),
        user_id=current_user.id
    )
    
    address_dict = address.model_dump()
    address_dict['created_at'] = address_dict['created_at'].isoformat()
    await db.addresses.insert_one(address_dict)
    
    return {"message": "Address created successfully", "id": address.id}

@api_router.get("/addresses/{address_id}")
async def get_address(
    address_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a single address by ID."""
    address = await db.addresses.find_one(
        {"id": address_id, "user_id": current_user.id},
        {"_id": 0}
    )
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    return address

@api_router.put("/addresses/{address_id}")
async def update_address(
    address_id: str,
    address_data: AddressUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update an existing address."""
    # Check if address exists and belongs to user
    existing = await db.addresses.find_one(
        {"id": address_id, "user_id": current_user.id}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Address not found")
    
    # If setting as default, unset other defaults
    if address_data.is_default:
        await db.addresses.update_many(
            {"user_id": current_user.id, "id": {"$ne": address_id}},
            {"$set": {"is_default": False}}
        )
    
    # Build update dict with only provided fields
    update_dict = {k: v for k, v in address_data.model_dump().items() if v is not None}
    
    if update_dict:
        await db.addresses.update_one(
            {"id": address_id, "user_id": current_user.id},
            {"$set": update_dict}
        )
    
    # Get updated address
    updated = await db.addresses.find_one(
        {"id": address_id, "user_id": current_user.id},
        {"_id": 0}
    )
    return updated

@api_router.delete("/addresses/{address_id}")
async def delete_address(
    address_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete an address."""
    # Check if address exists
    existing = await db.addresses.find_one(
        {"id": address_id, "user_id": current_user.id}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Address not found")
    
    was_default = existing.get("is_default", False)
    
    # Delete the address
    await db.addresses.delete_one({"id": address_id, "user_id": current_user.id})
    
    # If deleted address was default, set another one as default
    if was_default:
        remaining = await db.addresses.find_one(
            {"user_id": current_user.id},
            {"_id": 0}
        )
        if remaining:
            await db.addresses.update_one(
                {"id": remaining["id"]},
                {"$set": {"is_default": True}}
            )
    
    return {"message": "Address deleted successfully"}

@api_router.post("/addresses/{address_id}/set-default")
async def set_default_address(
    address_id: str,
    current_user: User = Depends(get_current_user)
):
    """Set an address as the default."""
    # Check if address exists
    existing = await db.addresses.find_one(
        {"id": address_id, "user_id": current_user.id}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Address not found")
    
    # Unset all other defaults
    await db.addresses.update_many(
        {"user_id": current_user.id},
        {"$set": {"is_default": False}}
    )
    
    # Set this one as default
    await db.addresses.update_one(
        {"id": address_id},
        {"$set": {"is_default": True}}
    )
    
    return {"message": "Address set as default"}

# ============================================
# Admin Endpoints
# ============================================

async def get_admin_user(current_user: User = Depends(get_current_user)):
    """Dependency to verify admin role."""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# Admin Orders
@api_router.get("/admin/orders")
async def admin_get_orders(
    status: Optional[str] = None,
    limit: int = 50,
    skip: int = 0,
    admin: User = Depends(get_admin_user)
):
    """Get all orders (admin only)."""
    query = {}
    if status:
        query["status"] = status
    
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.orders.count_documents(query)
    
    # Enrich with user info
    for order in orders:
        user = await db.users.find_one({"id": order["user_id"]}, {"_id": 0, "password_hash": 0})
        order["user"] = user
    
    return {"orders": orders, "total": total}

@api_router.get("/admin/orders/{order_id}")
async def admin_get_order(
    order_id: str,
    admin: User = Depends(get_admin_user)
):
    """Get single order details (admin only)."""
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Enrich with user info
    user = await db.users.find_one({"id": order["user_id"]}, {"_id": 0, "password_hash": 0})
    order["user"] = user
    
    return order

@api_router.put("/admin/orders/{order_id}/status")
async def admin_update_order_status(
    order_id: str,
    status_update: dict,
    admin: User = Depends(get_admin_user)
):
    """Update order status (admin only)."""
    valid_statuses = ["en_attente", "en_preparation", "en_livraison", "livree", "annulee"]
    new_status = status_update.get("status")
    
    if not new_status or new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": new_status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {"message": "Order status updated", "new_status": new_status}

# Admin Products
@api_router.get("/admin/products")
async def admin_get_products(
    limit: int = 50,
    skip: int = 0,
    admin: User = Depends(get_admin_user)
):
    """Get all products with full details (admin only)."""
    products = await db.products.find({}, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    total = await db.products.count_documents({})
    return {"products": products, "total": total}

@api_router.post("/admin/products")
async def admin_create_product(
    product_data: dict,
    admin: User = Depends(get_admin_user)
):
    """Create a new product (admin only)."""
    required_fields = ["name", "brand", "price", "stock", "category"]
    for field in required_fields:
        if field not in product_data:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
    
    product_id = str(uuid.uuid4())
    product = {
        "id": product_id,
        "name": product_data["name"],
        "brand": product_data["brand"],
        "category": product_data.get("category", "domestic"),
        "size": product_data.get("size", "medium"),
        "capacity": product_data.get("capacity", "12kg"),
        "price": int(product_data["price"]),
        "stock": int(product_data["stock"]),
        "image_url": product_data.get("image_url", ""),
        "description": product_data.get("description", ""),
        "rating": product_data.get("rating", 4.5),
        "delivery_time": product_data.get("delivery_time", "15-20 min"),
        "created_at": datetime.utcnow().isoformat()
    }
    
    await db.products.insert_one(product)
    del product["_id"] if "_id" in product else None
    
    return {"message": "Product created", "product": product}

@api_router.put("/admin/products/{product_id}")
async def admin_update_product(
    product_id: str,
    product_data: dict,
    admin: User = Depends(get_admin_user)
):
    """Update a product (admin only)."""
    # Check if product exists
    existing = await db.products.find_one({"id": product_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Build update dict
    update_fields = {}
    allowed_fields = ["name", "brand", "category", "size", "capacity", "price", "stock", 
                      "image_url", "description", "rating", "delivery_time"]
    
    for field in allowed_fields:
        if field in product_data:
            if field in ["price", "stock"]:
                update_fields[field] = int(product_data[field])
            elif field == "rating":
                update_fields[field] = float(product_data[field])
            else:
                update_fields[field] = product_data[field]
    
    if update_fields:
        await db.products.update_one({"id": product_id}, {"$set": update_fields})
    
    # Return updated product
    updated = await db.products.find_one({"id": product_id}, {"_id": 0})
    return {"message": "Product updated", "product": updated}

@api_router.delete("/admin/products/{product_id}")
async def admin_delete_product(
    product_id: str,
    admin: User = Depends(get_admin_user)
):
    """Delete a product (admin only)."""
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}

# Admin Users
@api_router.get("/admin/users")
async def admin_get_users(
    limit: int = 50,
    skip: int = 0,
    admin: User = Depends(get_admin_user)
):
    """Get all users (admin only, read-only)."""
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).skip(skip).limit(limit).to_list(limit)
    total = await db.users.count_documents({})
    return {"users": users, "total": total}

# Admin Stats
@api_router.get("/admin/stats")
async def admin_get_stats(admin: User = Depends(get_admin_user)):
    """Get dashboard statistics (admin only)."""
    total_orders = await db.orders.count_documents({})
    pending_orders = await db.orders.count_documents({"status": "en_attente"})
    preparing_orders = await db.orders.count_documents({"status": "en_preparation"})
    delivering_orders = await db.orders.count_documents({"status": "en_livraison"})
    delivered_orders = await db.orders.count_documents({"status": "livree"})
    cancelled_orders = await db.orders.count_documents({"status": "annulee"})
    
    total_users = await db.users.count_documents({})
    total_products = await db.products.count_documents({})
    
    # Calculate revenue from delivered orders
    pipeline = [
        {"$match": {"status": "livree"}},
        {"$group": {"_id": None, "total_revenue": {"$sum": "$total"}}}
    ]
    revenue_result = await db.orders.aggregate(pipeline).to_list(1)
    total_revenue = revenue_result[0]["total_revenue"] if revenue_result else 0
    
    return {
        "orders": {
            "total": total_orders,
            "pending": pending_orders,
            "preparing": preparing_orders,
            "delivering": delivering_orders,
            "delivered": delivered_orders,
            "cancelled": cancelled_orders
        },
        "users": total_users,
        "products": total_products,
        "revenue": total_revenue
    }

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
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Literal
from datetime import datetime
import uuid

# User Models
class UserBase(BaseModel):
    name: str
    email: EmailStr
    address: Optional[str] = None
    state: Optional[str] = None
    language: Literal["en", "fr"] = "en"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    password_hash: str
    role: Literal["client", "driver", "admin"] = "client"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserResponse(UserBase):
    id: str
    role: str
    created_at: datetime

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    reset_token: str
    new_password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Product Models
class ProductBase(BaseModel):
    name: str
    brand: str
    category: Literal["domestic", "industrial", "refill", "rental", "installation", "emergency"]
    size: Literal["small", "medium", "large"]
    capacity: str  # e.g., "7.5L", "12kg", "15kg"
    price: float
    stock: int
    image_url: str
    description: str
    rating: float = 4.5
    delivery_time: str = "15-20 min"

class Product(ProductBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Cart Models
class CartItem(BaseModel):
    product_id: str
    quantity: int
    size: str
    price: float

class CartBase(BaseModel):
    user_id: str
    items: List[CartItem] = []

class Cart(CartBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class CartResponse(BaseModel):
    id: str
    items: List[CartItem]
    subtotal: float
    delivery_fee: float = 5.50
    total: float

# Order Models
class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    size: str
    price: float

class OrderBase(BaseModel):
    user_id: str
    items: List[OrderItem]
    subtotal: float
    delivery_fee: float = 5.50
    total: float
    delivery_address: str
    status: Literal["pending", "confirmed", "in_progress", "delivered", "cancelled"] = "pending"

class Order(OrderBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)

class OrderCreate(BaseModel):
    delivery_address: str

# Delivery Models
class Location(BaseModel):
    lat: float
    lng: float

class DriverInfo(BaseModel):
    name: str
    phone: str
    photo_url: str

class DeliveryBase(BaseModel):
    order_id: str
    status: Literal["pending", "in_progress", "delivered", "failed"] = "pending"
    current_location: Optional[Location] = None
    warehouse_location: Location
    delivery_location: Location
    eta: int  # in minutes
    driver_info: DriverInfo

class Delivery(DeliveryBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)

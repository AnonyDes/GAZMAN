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
    price: int  # Price in XAF (FCFA) - integer, no decimals
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
    product_name: str
    product_image: str
    quantity: int
    size: str
    price: int  # Price in XAF (FCFA)

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
    subtotal: int  # XAF
    delivery_fee: int = 3500  # 3,500 FCFA delivery fee
    total: int  # XAF

# Order Models
class OrderItem(BaseModel):
    product_id: str
    product_name: str
    product_image: str
    quantity: int
    size: str
    price: int  # XAF

class OrderBase(BaseModel):
    user_id: str
    items: List[OrderItem]
    subtotal: int  # XAF
    delivery_fee: int = 3500  # 3,500 FCFA
    total: int  # XAF
    delivery_address: str
    phone: str
    payment_method: Literal["cash", "mobile_money"] = "cash"
    status: Literal["en_attente", "en_preparation", "en_livraison", "livree", "annulee"] = "en_attente"

class Order(OrderBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CheckoutRequest(BaseModel):
    delivery_address: str
    phone: str
    payment_method: Literal["cash", "mobile_money"] = "cash"

class AddToCartRequest(BaseModel):
    product_id: str
    quantity: int = 1
    size: str = "medium"

class UpdateCartRequest(BaseModel):
    quantity: int
    size: str = "medium"

# Address Models
class AddressBase(BaseModel):
    name: str  # e.g., "Maison", "Bureau"
    city: str  # e.g., "Yaoundé", "Douala"
    quartier: str  # e.g., "Bastos", "Bonapriso"
    description: Optional[str] = None  # Landmark / Point de repère
    phone: str
    is_default: bool = False

class AddressCreate(AddressBase):
    pass

class AddressUpdate(BaseModel):
    name: Optional[str] = None
    city: Optional[str] = None
    quartier: Optional[str] = None
    description: Optional[str] = None
    phone: Optional[str] = None
    is_default: Optional[bool] = None

class Address(AddressBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

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

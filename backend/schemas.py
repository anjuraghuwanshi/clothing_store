from pydantic import BaseModel,Field, ConfigDict
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class UserRegister(BaseModel):
    email: str
    password: str
    fullname: str
    phone : str
    role: Optional[str] = "customer"

class UserResponse(BaseModel):
    id: UUID
    email: str
    fullname: str
    phone: str
    role: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str
# =========================================================
# Categories
# =========================================================

class CategoryBase(BaseModel):
    name: str
    slug: str
    image_url: Optional[str] = None
    parent_id: Optional[UUID] = None
    is_active: bool = True


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    image_url: Optional[str] = None
    parent_id: Optional[UUID] = None
    is_active: Optional[bool] = None


class Category(CategoryBase):
    id: UUID
    product_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)


# =========================================================
# Product Images
# =========================================================

class ProductImageBase(BaseModel):
    id: Optional[UUID] = None
    image_url: str
    is_primary: bool = False
    color: Optional[str] = None


class ProductImage(ProductImageBase):
    id: UUID
    product_id: UUID

    model_config = ConfigDict(from_attributes=True)


# =========================================================
# Product Variants
# =========================================================

class ProductVariantBase(BaseModel):
    id: Optional[UUID] = None
    size: str
    color: str
    sku: str
    stock_quantity: int = 0


class ProductVariant(ProductVariantBase):
    id: UUID
    product_id: UUID

    model_config = ConfigDict(from_attributes=True)

# =========================================================
# Products
# =========================================================

class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    compare_at_price: Optional[float] = None
    category_id: UUID
    is_active: bool = True
    is_featured: bool = False
    is_new_arrival: bool = False
    is_best_seller: bool = False


class ProductCreate(ProductBase):
    variants: List[ProductVariantBase] = Field(default_factory=list)
    images: List[ProductImageBase] = Field(default_factory=list)


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    compare_at_price: Optional[float] = None
    category_id: Optional[UUID] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    is_new_arrival: Optional[bool] = None
    is_best_seller: Optional[bool] = None
    variants: Optional[List[ProductVariantBase]] = None
    images: Optional[List[ProductImageBase]] = None


class Product(ProductBase):
    id: UUID
    rating: float
    review_count: int

    variants: List[ProductVariant] = Field(default_factory=list)
    images: List[ProductImage] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)

# =========================================================
# Cart
# =========================================================

class CartItemCreate(BaseModel):
    product_variant_id: UUID
    quantity: int = 1


class CartItemUpdate(BaseModel):
    quantity: int

class CartProduct(ProductBase):
    id: UUID
    images: List[ProductImage] = Field(default_factory=list)
    model_config = ConfigDict(from_attributes=True)

class ProductVariantInCart(ProductVariantBase):
    id: UUID
    product_id: UUID
    product: CartProduct
    model_config = ConfigDict(from_attributes=True)

class CartItem(BaseModel):
    id: UUID
    cart_id: UUID
    product_variant_id: UUID
    quantity: int
    variant: ProductVariantInCart

    model_config = ConfigDict(from_attributes=True)

class Cart(BaseModel):
    id: UUID
    user_id: Optional[UUID] = None
    session_id: Optional[str] = None
    items: List[CartItem] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)



# =========================================================
# Wishlist
# =========================================================

class WishlistItemCreate(BaseModel):
    product_id: UUID


class WishlistItem(BaseModel):
    id: UUID
    wishlist_id: UUID
    product_id: UUID
    product: Product

    model_config = ConfigDict(from_attributes=True)



class Wishlist(BaseModel):
    id: UUID
    user_id: UUID
    items: List[WishlistItem] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


# =========================================================
# Orders
# =========================================================

class OrderItem(BaseModel):
    id: UUID
    order_id: UUID
    product_variant_id: UUID
    product_name: str
    product_image_url: Optional[str] = None
    size: str
    color: str
    quantity: int
    price: float

    model_config = ConfigDict(from_attributes=True)


class OrderShipmentCreate(BaseModel):
    delivery_partner: str
    tracking_number: str
    tracking_url: Optional[str] = None


class OrderShipment(OrderShipmentCreate):
    id: UUID
    order_id: UUID
    shipped_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrderStatusHistory(BaseModel):
    id: UUID
    order_id: UUID
    status: str
    changed_at: datetime
    changed_by: Optional[str] = None
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class Order(BaseModel):
    id: UUID
    user_id: UUID
    customer_name: str
    customer_email: str
    customer_phone: str
    
    shipping_address: str
    shipping_city: str
    shipping_state: str
    shipping_pincode: str
    
    subtotal: float
    discount: float
    shipping_charge: float
    total_amount: float
    
    payment_method: str
    payment_status: str
    order_status: str
    
    created_at: datetime
    updated_at: datetime
    
    items: List[OrderItem] = Field(default_factory=list)
    shipment: Optional[OrderShipment] = None
    status_history: List[OrderStatusHistory] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class OrderStatusUpdate(BaseModel):
    order_status: str
    notes: Optional[str] = None


class PaymentStatusUpdate(BaseModel):
    payment_status: str

# =========================================================
# ADMIN CUSTOMERS
# =========================================================

class Address(BaseModel):
    id: UUID
    address_line1: str
    city: str
    state: str
    pincode: str
    is_default: bool
    
    model_config = ConfigDict(from_attributes=True)

class CustomerList(BaseModel):
    id: UUID
    fullname: str
    email: str
    phone: Optional[str] = None
    created_at: datetime
    total_orders: int
    total_spent: float
    
    model_config = ConfigDict(from_attributes=True)

class CustomerStats(BaseModel):
    total_orders: int
    total_spent: float
    pending_orders: int
    delivered_orders: int
    cancelled_orders: int

class CustomerDetail(BaseModel):
    id: UUID
    fullname: str
    email: str
    phone: Optional[str] = None
    created_at: datetime
    
    stats: CustomerStats
    addresses: List[Address] = Field(default_factory=list)
    orders: List[Order] = Field(default_factory=list)
    
    model_config = ConfigDict(from_attributes=True)


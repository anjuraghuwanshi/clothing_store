import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    ForeignKey,
    Integer,
    String,
    DateTime,
    Numeric,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    

    email = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    password_hash = Column(
        String,
        nullable=False
    )

    fullname = Column(String, nullable=False)

    phone = Column(String, nullable=True)
    role = Column(String, default="customer", nullable=False)
    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    cart = relationship(
        "Cart",
        back_populates="user",
        uselist=False
    )

    wishlist = relationship(
        "Wishlist",
        back_populates="user",
        uselist=False
    )
    
    addresses = relationship(
        "Address",
        back_populates="user",
        cascade="all, delete-orphan"
    )

class Address(Base):
    __tablename__ = "addresses"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    address_line1 = Column(String, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    pincode = Column(String, nullable=False)
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="addresses")

class Category(Base):
    __tablename__ = "categories"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )

    image_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    
    parent_id = Column(
        UUID(as_uuid=True),
        ForeignKey("categories.id"),
        nullable=True
    )

    name = Column(
        String,
        index=True,
        nullable=False
    )

    slug = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    image_url = Column(
        String,
        nullable=True
    )

    subcategories = relationship(
        "Category"
    )

    products = relationship(
        "Product",
        back_populates="category"
    )


class Product(Base):
    __tablename__ = "products"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )

    category_id = Column(
        UUID(as_uuid=True),
        ForeignKey("categories.id"),
        nullable=False
    )

    name = Column(
        String,
        index=True,
        nullable=False
    )

    description = Column(
        String,
        nullable=True
    )

    # Numeric is better than Float for money
    price = Column(
        Numeric(10, 2),
        nullable=False
    )

    compare_at_price = Column(
        Numeric(10, 2),
        nullable=True
    )

    rating = Column(
        Numeric(3, 2),
        default=0.0
    )

    review_count = Column(
        Integer,
        default=0
    )

    is_active = Column(
        Boolean,
        default=True,
        nullable=False
    )
    
    is_featured = Column(
        Boolean,
        default=False,
        nullable=False
    )
    
    is_new_arrival = Column(
        Boolean,
        default=False,
        nullable=False
    )
    
    is_best_seller = Column(
        Boolean,
        default=False,
        nullable=False
    )

    category = relationship(
        "Category",
        back_populates="products"
    )

    variants = relationship(
        "ProductVariant",
        back_populates="product"
    )

    images = relationship(
        "ProductImage",
        back_populates="product"
    )

    wishlisted_by = relationship(
        "WishlistItem",
        back_populates="product"
    )


class ProductVariant(Base):
    __tablename__ = "product_variants"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )

    product_id = Column(
        UUID(as_uuid=True),
        ForeignKey("products.id"),
        nullable=False
    )

    size = Column(
        String,
        nullable=False
    )

    color = Column(
        String,
        nullable=False
    )

    sku = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    stock_quantity = Column(
        Integer,
        default=0
    )

    product = relationship(
        "Product",
        back_populates="variants"
    )

    cart_items = relationship(
        "CartItem",
        back_populates="variant"
    )


class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )

    product_id = Column(
        UUID(as_uuid=True),
        ForeignKey("products.id"),
        nullable=False
    )

    image_url = Column(
        String,
        nullable=False
    )

    color = Column(
        String,
        nullable=True
    )

    is_primary = Column(
        Boolean,
        default=False
    )

    product = relationship(
        "Product",
        back_populates="images"
    )


class Cart(Base):
    __tablename__ = "carts"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
        unique=True
    )

    # Used for guest carts
    session_id = Column(
        String,
        nullable=True,
        index=True
    )

    user = relationship(
        "User",
        back_populates="cart"
    )

    items = relationship(
        "CartItem",
        back_populates="cart"
    )


class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )

    cart_id = Column(
        UUID(as_uuid=True),
        ForeignKey("carts.id"),
        nullable=False
    )

    product_variant_id = Column(
        UUID(as_uuid=True),
        ForeignKey("product_variants.id"),
        nullable=False
    )

    quantity = Column(
        Integer,
        default=1
    )

    cart = relationship(
        "Cart",
        back_populates="items"
    )

    variant = relationship(
        "ProductVariant",
        back_populates="cart_items"
    )


class Wishlist(Base):
    __tablename__ = "wishlists"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    user = relationship(
        "User",
        back_populates="wishlist"
    )

    items = relationship(
        "WishlistItem",
        back_populates="wishlist"
    )


class WishlistItem(Base):
    __tablename__ = "wishlist_items"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )

    wishlist_id = Column(
        UUID(as_uuid=True),
        ForeignKey("wishlists.id"),
        nullable=False
    )

    product_id = Column(
        UUID(as_uuid=True),
        ForeignKey("products.id"),
        nullable=False
    )

    wishlist = relationship(
        "Wishlist",
        back_populates="items"
    )

    product = relationship(
        "Product",
        back_populates="wishlisted_by"
    )

# =========================================================
# Orders
# =========================================================

class Order(Base):
    __tablename__ = "orders"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    customer_name = Column(String, nullable=False)
    customer_email = Column(String, nullable=False)
    customer_phone = Column(String, nullable=False)
    
    shipping_address = Column(String, nullable=False)
    shipping_city = Column(String, nullable=False)
    shipping_state = Column(String, nullable=False)
    shipping_pincode = Column(String, nullable=False)
    
    subtotal = Column(Numeric(10, 2), nullable=False)
    discount = Column(Numeric(10, 2), default=0)
    shipping_charge = Column(Numeric(10, 2), default=0)
    total_amount = Column(Numeric(10, 2), nullable=False)
    
    payment_method = Column(String, nullable=False)
    payment_status = Column(String, default="Pending")
    
    order_status = Column(String, default="Pending")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    shipment = relationship("OrderShipment", back_populates="order", uselist=False, cascade="all, delete-orphan")
    status_history = relationship("OrderStatusHistory", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False)
    product_variant_id = Column(UUID(as_uuid=True), ForeignKey("product_variants.id"), nullable=False)
    
    product_name = Column(String, nullable=False)
    product_image_url = Column(String, nullable=True)
    size = Column(String, nullable=False)
    color = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    
    order = relationship("Order", back_populates="items")
    variant = relationship("ProductVariant")


class OrderShipment(Base):
    __tablename__ = "order_shipments"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False, unique=True)
    
    delivery_partner = Column(String, nullable=False)
    tracking_number = Column(String, nullable=False)
    tracking_url = Column(String, nullable=True)
    shipped_at = Column(DateTime, default=datetime.utcnow)
    
    order = relationship("Order", back_populates="shipment")


class OrderStatusHistory(Base):
    __tablename__ = "order_status_history"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False)
    
    status = Column(String, nullable=False)
    changed_at = Column(DateTime, default=datetime.utcnow)
    changed_by = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    
    order = relationship("Order", back_populates="status_history")

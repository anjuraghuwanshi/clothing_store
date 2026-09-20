from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

import models
import schemas

from database import engine, get_db
from routes import auth


# =========================================================
# Database
# =========================================================

models.Base.metadata.create_all(bind=engine)


# =========================================================
# FastAPI App
# =========================================================

app = FastAPI(
    title="Fashion E-Commerce API"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://maison-fashions.netlify.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# Root
# =========================================================

@app.get("/")
def read_root():
    return {
        "message": "Welcome to the Fashion E-Commerce API"
    }


# =========================================================
# AUTHENTICATION
# =========================================================

@app.post(
    "/auth/register",
    response_model=schemas.UserResponse
)
def register_user(
    user: schemas.UserRegister,
    db: Session = Depends(get_db)
):
    # Check if email already exists
    existing_user = db.query(models.User).filter(
        models.User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Hash password
    hashed_password = auth.hash_password(
        user.password
    )

    # Create user
    db_user = models.User(
        email=user.email,
        password_hash=hashed_password,
        phone=user.phone,
        fullname=user.fullname,
        role=user.role
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


# =========================================================
# LOGIN
# =========================================================

@app.post(
    "/auth/login",
    response_model=schemas.Token
)
def login_user(
    form_data: auth.OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(
        models.User.email == form_data.username
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not auth.verify_password(
        form_data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = auth.create_access_token(
        data={
            "sub": str(user.id)
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# =========================================================
# CURRENT USER
# =========================================================

@app.get(
    "/auth/me",
    response_model=schemas.UserResponse
)
def get_current_user(
    current_user: models.User = Depends(
        auth.get_current_user
    )
):
    return current_user


# =========================================================
# ADMIN STATS
# =========================================================

@app.get("/admin/stats")
def get_admin_stats(
    current_admin: models.User = Depends(auth.get_current_admin_user),
    db: Session = Depends(get_db)
):
    total_products = db.query(models.Product).count()
    # Orders feature doesn't fully exist in db yet, we'll return 0 or mock
    total_orders = 0 
    total_customers = db.query(models.User).filter(models.User.role == "customer").count()
    low_stock_products = db.query(models.ProductVariant).filter(models.ProductVariant.stock_quantity < 10).count()
    
    return {
        "total_products": total_products,
        "total_orders": total_orders,
        "total_customers": total_customers,
        "low_stock_products": low_stock_products
    }


# =========================================================
# CATEGORIES
# =========================================================

@app.get(
    "/categories/",
    response_model=List[schemas.Category]
)
def read_categories(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    categories = (
        db.query(models.Category)
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    # Manually compute product_count for each category
    for cat in categories:
        cat.product_count = len(cat.products)

    return categories


@app.get(
    "/categories/{category_id}",
    response_model=schemas.Category
)
def read_category(
    category_id: UUID,
    db: Session = Depends(get_db)
):
    category = db.query(models.Category).filter(
        models.Category.id == category_id
    ).first()

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )
        
    category.product_count = len(category.products)
    return category


@app.post(
    "/categories/",
    response_model=schemas.Category
)
def create_category(
    category: schemas.CategoryCreate,
    current_admin: models.User = Depends(auth.get_current_admin_user),
    db: Session = Depends(get_db)
):
    # Check for duplicate name or slug
    existing_category = db.query(models.Category).filter(
        (models.Category.name == category.name) | (models.Category.slug == category.slug)
    ).first()
    
    if existing_category:
        raise HTTPException(
            status_code=400,
            detail="Category with this name or slug already exists"
        )

    # Check parent category if provided
    if category.parent_id:
        parent_category = db.query(models.Category).filter(
            models.Category.id == category.parent_id
        ).first()
        if not parent_category:
            raise HTTPException(
                status_code=400,
                detail="Parent category not found"
            )

    db_category = models.Category(
        **category.model_dump()
    )

    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    db_category.product_count = 0

    return db_category


@app.put(
    "/categories/{category_id}",
    response_model=schemas.Category
)
def update_category(
    category_id: UUID,
    category_update: schemas.CategoryUpdate,
    current_admin: models.User = Depends(auth.get_current_admin_user),
    db: Session = Depends(get_db)
):
    db_category = db.query(models.Category).filter(
        models.Category.id == category_id
    ).first()

    if not db_category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    update_data = category_update.model_dump(exclude_unset=True)

    # Check for duplicates if name or slug is being updated
    if "name" in update_data or "slug" in update_data:
        name_to_check = update_data.get("name", db_category.name)
        slug_to_check = update_data.get("slug", db_category.slug)
        
        duplicate = db.query(models.Category).filter(
            (models.Category.id != category_id) & 
            ((models.Category.name == name_to_check) | (models.Category.slug == slug_to_check))
        ).first()
        
        if duplicate:
            raise HTTPException(
                status_code=400,
                detail="Category with this name or slug already exists"
            )

    # Check parent category if being updated
    if "parent_id" in update_data and update_data["parent_id"] is not None:
        if str(update_data["parent_id"]) == str(category_id):
            raise HTTPException(
                status_code=400,
                detail="Category cannot be its own parent"
            )
            
        parent_category = db.query(models.Category).filter(
            models.Category.id == update_data["parent_id"]
        ).first()
        if not parent_category:
            raise HTTPException(
                status_code=400,
                detail="Parent category not found"
            )

    for key, value in update_data.items():
        setattr(db_category, key, value)

    db.commit()
    db.refresh(db_category)
    db_category.product_count = len(db_category.products)
    return db_category


@app.delete("/categories/{category_id}")
def delete_category(
    category_id: UUID,
    current_admin: models.User = Depends(auth.get_current_admin_user),
    db: Session = Depends(get_db)
):
    db_category = db.query(models.Category).filter(
        models.Category.id == category_id
    ).first()

    if not db_category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    # Check if category has subcategories
    subcategories = db.query(models.Category).filter(
        models.Category.parent_id == category_id
    ).first()
    
    if subcategories:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete category that has subcategories"
        )
        
    # Check if category has products
    products = db.query(models.Product).filter(
        models.Product.category_id == category_id
    ).first()
    
    if products:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete category that contains products"
        )

    db.delete(db_category)
    db.commit()
    return {"detail": "Category deleted successfully"}


# =========================================================
# PRODUCTS
# =========================================================

@app.get(
    "/products/",
    response_model=List[schemas.Product]
)
def read_products(
    search: Optional[str] = None,
    category: Optional[str] = None,
    featured: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(models.Product).filter(models.Product.is_active == True)
    
    if featured is not None:
        query = query.filter(models.Product.is_featured == featured)
        
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (models.Product.name.ilike(search_term)) | 
            (models.Product.description.ilike(search_term))
        )
        
    if category:
        slugs = category.strip("/").split("/")
        
        target_category = None
        current_parent_id = None
        
        for slug in slugs:
            target_category = db.query(models.Category).filter(
                models.Category.slug.ilike(slug),
                models.Category.parent_id == current_parent_id
            ).first()
            if not target_category:
                break
            current_parent_id = target_category.id
            
        # Fallback to direct slug match for backward compatibility
        if not target_category:
            target_category = db.query(models.Category).filter(
                models.Category.slug.ilike(category)
            ).first()
        
        if target_category:
            def get_all_subcategories(cat_id):
                subs = db.query(models.Category).filter(models.Category.parent_id == cat_id).all()
                all_ids = []
                for sub in subs:
                    all_ids.append(sub.id)
                    all_ids.extend(get_all_subcategories(sub.id))
                return all_ids
                
            all_category_ids = [target_category.id] + get_all_subcategories(target_category.id)
            query = query.filter(models.Product.category_id.in_(all_category_ids))
        else:
            return []
        
    products = query.offset(skip).limit(limit).all()

    return products


@app.get(
    "/products/{product_id}",
    response_model=schemas.Product
)
def read_product(
    product_id: UUID,
    db: Session = Depends(get_db)
):
    product = db.query(models.Product).filter(
        models.Product.id == product_id,
        models.Product.is_active == True
    ).first()

    if product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return product


@app.get(
    "/products/{product_id}/related",
    response_model=List[schemas.Product]
)
def read_related_products(
    product_id: UUID,
    limit: int = 4,
    db: Session = Depends(get_db)
):
    base_product = db.query(models.Product).filter(
        models.Product.id == product_id,
        models.Product.is_active == True
    ).first()

    if not base_product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )
        
    related = db.query(models.Product).filter(
        models.Product.category_id == base_product.category_id,
        models.Product.id != product_id,
        models.Product.is_active == True
    ).limit(limit).all()
    
    if len(related) < limit:
        remaining = limit - len(related)
        exclude_ids = [p.id for p in related] + [product_id]
        
        more_products = db.query(models.Product).filter(
            models.Product.id.notin_(exclude_ids),
            models.Product.is_active == True
        ).limit(remaining).all()
        
        related.extend(more_products)

    return related

@app.get(
    "/admin/products/",
    response_model=List[schemas.Product]
)
def read_admin_products(
    skip: int = 0,
    limit: int = 100,
    current_admin: models.User = Depends(auth.get_current_admin_user),
    db: Session = Depends(get_db)
):
    return db.query(models.Product).offset(skip).limit(limit).all()

@app.get(
    "/admin/products/{product_id}",
    response_model=schemas.Product
)
def read_admin_product(
    product_id: UUID,
    current_admin: models.User = Depends(auth.get_current_admin_user),
    db: Session = Depends(get_db)
):
    product = db.query(models.Product).filter(
        models.Product.id == product_id
    ).first()

    if product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )
    return product

@app.post(
    "/products/",
    response_model=schemas.Product
)
def create_product(
    product: schemas.ProductCreate,
    current_admin: models.User = Depends(auth.get_current_admin_user),
    db: Session = Depends(get_db)
):
    product_data = product.model_dump(exclude={"variants", "images"})
    db_product = models.Product(**product_data)
    db.add(db_product)
    db.flush()

    for variant_data in product.variants:
        db_variant = models.ProductVariant(product_id=db_product.id, **variant_data.model_dump())
        db.add(db_variant)
        
    for image_data in product.images:
        db_image = models.ProductImage(product_id=db_product.id, **image_data.model_dump())
        db.add(db_image)

    db.commit()
    db.refresh(db_product)
    return db_product


@app.put(
    "/products/{product_id}",
    response_model=schemas.Product
)
def update_product(
    product_id: UUID,
    product_update: schemas.ProductUpdate,
    current_admin: models.User = Depends(auth.get_current_admin_user),
    db: Session = Depends(get_db)
):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = product_update.model_dump(exclude_unset=True, exclude={"variants", "images"})
    for key, value in update_data.items():
        setattr(db_product, key, value)
        
    if product_update.variants is not None:
        incoming_variant_ids = {v.id for v in product_update.variants if v.id}
        # Delete variants not in incoming list
        variants_to_delete = db.query(models.ProductVariant).filter(
            models.ProductVariant.product_id == product_id,
            ~models.ProductVariant.id.in_(incoming_variant_ids) if incoming_variant_ids else True
        ).all()
        for v in variants_to_delete:
            db.query(models.CartItem).filter(models.CartItem.product_variant_id == v.id).delete(synchronize_session=False)
            db.delete(v)
            
        # Upsert
        for variant_data in product_update.variants:
            v_dict = variant_data.model_dump(exclude_unset=True)
            if variant_data.id:
                existing = db.query(models.ProductVariant).filter(models.ProductVariant.id == variant_data.id).first()
                if existing:
                    for k, val in v_dict.items():
                        setattr(existing, k, val)
                    continue
            v_dict.pop('id', None)
            db.add(models.ProductVariant(product_id=product_id, **v_dict))
            
    if product_update.images is not None:
        incoming_image_ids = {i.id for i in product_update.images if i.id}
        db.query(models.ProductImage).filter(
            models.ProductImage.product_id == product_id,
            ~models.ProductImage.id.in_(incoming_image_ids) if incoming_image_ids else True
        ).delete(synchronize_session=False)
        
        for image_data in product_update.images:
            i_dict = image_data.model_dump(exclude_unset=True)
            if image_data.id:
                existing = db.query(models.ProductImage).filter(models.ProductImage.id == image_data.id).first()
                if existing:
                    for k, val in i_dict.items():
                        setattr(existing, k, val)
                    continue
            i_dict.pop('id', None)
            db.add(models.ProductImage(product_id=product_id, **i_dict))

    db.commit()
    db.refresh(db_product)
    return db_product


@app.delete("/products/{product_id}")
def delete_product(
    product_id: UUID,
    current_admin: models.User = Depends(auth.get_current_admin_user),
    db: Session = Depends(get_db)
):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Clean up relations
    variants = db.query(models.ProductVariant).filter(models.ProductVariant.product_id == product_id).all()
    variant_ids = [v.id for v in variants]
    
    if variant_ids:
        db.query(models.CartItem).filter(models.CartItem.product_variant_id.in_(variant_ids)).delete(synchronize_session=False)

    db.query(models.ProductVariant).filter(models.ProductVariant.product_id == product_id).delete(synchronize_session=False)
    db.query(models.ProductImage).filter(models.ProductImage.product_id == product_id).delete(synchronize_session=False)
    db.query(models.WishlistItem).filter(models.WishlistItem.product_id == product_id).delete(synchronize_session=False)
    
    db.delete(db_product)
    db.commit()
    return {"detail": "Product deleted successfully"}


# =========================================================
# CART
# =========================================================

@app.get(
    "/cart/",
    response_model=schemas.Cart
)
def get_cart(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    cart = db.query(models.Cart).filter(
        models.Cart.user_id == current_user.id
    ).first()

    if not cart:
        cart = models.Cart(user_id=current_user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)

    return cart


@app.post(
    "/cart/items/",
    response_model=schemas.CartItem
)
def add_item_to_cart(
    item: schemas.CartItemCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if item.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than 0")

    # Validate variant
    variant = db.query(models.ProductVariant).filter(
        models.ProductVariant.id == item.product_variant_id
    ).first()

    if not variant:
        raise HTTPException(status_code=404, detail="Product variant not found")

    cart = db.query(models.Cart).filter(
        models.Cart.user_id == current_user.id
    ).first()

    if not cart:
        cart = models.Cart(user_id=current_user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)

    # Check if variant already in cart
    existing_item = db.query(models.CartItem).filter(
        models.CartItem.cart_id == cart.id,
        models.CartItem.product_variant_id == item.product_variant_id
    ).first()

    if existing_item:
        new_quantity = existing_item.quantity + item.quantity
        if new_quantity > variant.stock_quantity:
            raise HTTPException(status_code=400, detail="Not enough stock available")
        
        existing_item.quantity = new_quantity
        db.commit()
        db.refresh(existing_item)
        return existing_item

    if item.quantity > variant.stock_quantity:
        raise HTTPException(status_code=400, detail="Not enough stock available")

    db_item = models.CartItem(
        cart_id=cart.id,
        **item.model_dump()
    )

    db.add(db_item)
    db.commit()
    db.refresh(db_item)

    return db_item


@app.put(
    "/cart/items/{item_id}",
    response_model=schemas.CartItem
)
def update_cart_item(
    item_id: UUID,
    update_data: schemas.CartItemUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if update_data.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than 0")

    cart = db.query(models.Cart).filter(
        models.Cart.user_id == current_user.id
    ).first()

    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    item = db.query(models.CartItem).filter(
        models.CartItem.id == item_id,
        models.CartItem.cart_id == cart.id
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    if update_data.quantity > item.variant.stock_quantity:
        raise HTTPException(status_code=400, detail="Not enough stock available")

    item.quantity = update_data.quantity
    db.commit()
    db.refresh(item)
    return item


@app.delete("/cart/items/{item_id}")
def remove_item_from_cart(
    item_id: UUID,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    cart = db.query(models.Cart).filter(
        models.Cart.user_id == current_user.id
    ).first()

    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    item = db.query(models.CartItem).filter(
        models.CartItem.id == item_id,
        models.CartItem.cart_id == cart.id
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    db.delete(item)
    db.commit()
    return {"detail": "Item removed"}


# =========================================================
# WISHLIST
# =========================================================

@app.get(
    "/wishlist/",
    response_model=schemas.Wishlist
)
def get_wishlist(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    wishlist = db.query(models.Wishlist).filter(
        models.Wishlist.user_id == current_user.id
    ).first()

    if not wishlist:
        wishlist = models.Wishlist(user_id=current_user.id)
        db.add(wishlist)
        db.commit()
        db.refresh(wishlist)

    return wishlist


@app.post(
    "/wishlist/items/",
    response_model=schemas.WishlistItem
)
def add_item_to_wishlist(
    item: schemas.WishlistItemCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    wishlist = db.query(models.Wishlist).filter(
        models.Wishlist.user_id == current_user.id
    ).first()

    if not wishlist:
        wishlist = models.Wishlist(user_id=current_user.id)
        db.add(wishlist)
        db.commit()
        db.refresh(wishlist)

    # Prevent duplicate
    existing_item = db.query(models.WishlistItem).filter(
        models.WishlistItem.wishlist_id == wishlist.id,
        models.WishlistItem.product_id == item.product_id
    ).first()

    if existing_item:
        return existing_item

    db_item = models.WishlistItem(
        wishlist_id=wishlist.id,
        **item.model_dump()
    )

    db.add(db_item)
    db.commit()
    db.refresh(db_item)

    return db_item


@app.delete("/wishlist/items/{product_id}")
def remove_item_from_wishlist(
    product_id: UUID,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    wishlist = db.query(models.Wishlist).filter(
        models.Wishlist.user_id == current_user.id
    ).first()

    if not wishlist:
        raise HTTPException(status_code=404, detail="Wishlist not found")

    item = db.query(models.WishlistItem).filter(
        models.WishlistItem.wishlist_id == wishlist.id,
        models.WishlistItem.product_id == product_id
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Item not found in wishlist")

    db.delete(item)
    db.commit()
    return {"detail": "Item removed"}

# =========================================================
# CUSTOMER CHECKOUT (For testing real orders)
# =========================================================

import pydantic

class CheckoutRequest(pydantic.BaseModel):
    shipping_address: str
    shipping_city: str
    shipping_state: str
    shipping_pincode: str
    payment_method: str

@app.post("/checkout", response_model=schemas.Order)
def process_checkout(
    req: CheckoutRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    cart = db.query(models.Cart).filter(models.Cart.user_id == current_user.id).first()
    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty")
        
    subtotal = sum(item.variant.product.price * item.quantity for item in cart.items)
    shipping = 10.00 if subtotal < 150 else 0.00 # Example rule
    total = float(subtotal) + shipping
    
    order = models.Order(
        user_id=current_user.id,
        customer_name=current_user.fullname,
        customer_email=current_user.email,
        customer_phone=current_user.phone or "N/A",
        shipping_address=req.shipping_address,
        shipping_city=req.shipping_city,
        shipping_state=req.shipping_state,
        shipping_pincode=req.shipping_pincode,
        subtotal=subtotal,
        discount=0.0,
        shipping_charge=shipping,
        total_amount=total,
        payment_method=req.payment_method,
        payment_status="Pending",
        order_status="Pending"
    )
    db.add(order)
    db.flush() # get order id
    
    # Create status history
    history = models.OrderStatusHistory(
        order_id=order.id,
        status="Pending",
        changed_by="Customer"
    )
    db.add(history)
    
    # Create order items
    for item in cart.items:
        # Stock check
        if item.variant.stock_quantity < item.quantity:
            raise HTTPException(status_code=400, detail=f"Not enough stock for {item.variant.product.name}")
        
        # Deduct stock
        item.variant.stock_quantity -= item.quantity
        
        # Save exact price/details at purchase time
        order_item = models.OrderItem(
            order_id=order.id,
            product_variant_id=item.variant.id,
            product_name=item.variant.product.name,
            product_image_url=item.variant.product.images[0].image_url if item.variant.product.images else None,
            size=item.variant.size,
            color=item.variant.color,
            quantity=item.quantity,
            price=item.variant.product.price
        )
        db.add(order_item)
    
    # Clear cart
    db.query(models.CartItem).filter(models.CartItem.cart_id == cart.id).delete()
    
    db.commit()
    db.refresh(order)
    return order

@app.get("/admin/orders", response_model=List[schemas.Order])
def get_admin_orders(
    skip: int = 0,
    limit: int = 100,
    current_admin: models.User = Depends(auth.get_current_admin_user),
    db: Session = Depends(get_db)
):
    orders = db.query(models.Order).order_by(models.Order.created_at.desc()).offset(skip).limit(limit).all()
    return orders

@app.get("/admin/orders/{order_id}", response_model=schemas.Order)
def get_admin_order(
    order_id: UUID,
    current_admin: models.User = Depends(auth.get_current_admin_user),
    db: Session = Depends(get_db)
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@app.put("/admin/orders/{order_id}/status", response_model=schemas.Order)
def update_order_status(
    order_id: UUID,
    status_update: schemas.OrderStatusUpdate,
    current_admin: models.User = Depends(auth.get_current_admin_user),
    db: Session = Depends(get_db)
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.order_status = status_update.order_status
    
    # Add history
    history = models.OrderStatusHistory(
        order_id=order.id,
        status=status_update.order_status,
        changed_by=current_admin.email,
        notes=status_update.notes
    )
    db.add(history)
    db.commit()
    db.refresh(order)
    return order

@app.put("/admin/orders/{order_id}/payment", response_model=schemas.Order)
def update_payment_status(
    order_id: UUID,
    payment_update: schemas.PaymentStatusUpdate,
    current_admin: models.User = Depends(auth.get_current_admin_user),
    db: Session = Depends(get_db)
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.payment_status = payment_update.payment_status
    db.commit()
    db.refresh(order)
    return order

@app.post("/admin/orders/{order_id}/shipment", response_model=schemas.OrderShipment)
def create_update_shipment(
    order_id: UUID,
    shipment_data: schemas.OrderShipmentCreate,
    current_admin: models.User = Depends(auth.get_current_admin_user),
    db: Session = Depends(get_db)
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    shipment = db.query(models.OrderShipment).filter(models.OrderShipment.order_id == order_id).first()
    
    if shipment:
        shipment.delivery_partner = shipment_data.delivery_partner
        shipment.tracking_number = shipment_data.tracking_number
        shipment.tracking_url = shipment_data.tracking_url
    else:
        shipment = models.OrderShipment(
            order_id=order_id,
            delivery_partner=shipment_data.delivery_partner,
            tracking_number=shipment_data.tracking_number,
            tracking_url=shipment_data.tracking_url
        )
        db.add(shipment)
        
    # Auto-update status to Shipped if not already beyond
    if order.order_status in ["Pending", "Confirmed", "Packed"]:
        order.order_status = "Shipped"
        history = models.OrderStatusHistory(
            order_id=order.id,
            status="Shipped",
            changed_by=current_admin.email,
            notes=f"Shipment created via {shipment_data.delivery_partner}"
        )
        db.add(history)

    db.commit()
    db.refresh(shipment)
    return shipment

# =========================================================
# ADMIN CUSTOMERS
# =========================================================
from sqlalchemy import func

@app.get("/admin/customers", response_model=List[schemas.CustomerList])
def get_admin_customers(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    current_admin: models.User = Depends(auth.get_current_admin_user),
    db: Session = Depends(get_db)
):
    query = db.query(
        models.User,
        func.count(models.Order.id).label('total_orders'),
        func.coalesce(func.sum(models.Order.total_amount), 0.0).label('total_spent')
    ).outerjoin(
        models.Order, models.User.id == models.Order.user_id
    ).filter(
        models.User.role == "customer"
    ).group_by(models.User.id).order_by(models.User.created_at.desc())
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (models.User.fullname.ilike(search_term)) |
            (models.User.email.ilike(search_term)) |
            (models.User.phone.ilike(search_term))
        )
        
    results = query.offset(skip).limit(limit).all()
    
    customers = []
    for user, total_orders, total_spent in results:
        customers.append(schemas.CustomerList(
            id=user.id,
            fullname=user.fullname,
            email=user.email,
            phone=user.phone,
            created_at=user.created_at,
            total_orders=total_orders,
            total_spent=total_spent
        ))
        
    return customers

@app.get("/admin/customers/{customer_id}", response_model=schemas.CustomerDetail)
def get_admin_customer_detail(
    customer_id: UUID,
    current_admin: models.User = Depends(auth.get_current_admin_user),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(
        models.User.id == customer_id,
        models.User.role == "customer"
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    orders = db.query(models.Order).filter(models.Order.user_id == user.id).order_by(models.Order.created_at.desc()).all()
    
    total_orders = len(orders)
    total_spent = sum(o.total_amount for o in orders)
    pending_orders = sum(1 for o in orders if o.order_status == "Pending")
    delivered_orders = sum(1 for o in orders if o.order_status == "Delivered")
    cancelled_orders = sum(1 for o in orders if o.order_status == "Cancelled")
    
    addresses = db.query(models.Address).filter(models.Address.user_id == user.id).all()
    
    stats = schemas.CustomerStats(
        total_orders=total_orders,
        total_spent=total_spent,
        pending_orders=pending_orders,
        delivered_orders=delivered_orders,
        cancelled_orders=cancelled_orders
    )
    
    return schemas.CustomerDetail(
        id=user.id,
        fullname=user.fullname,
        email=user.email,
        phone=user.phone,
        created_at=user.created_at,
        stats=stats,
        addresses=addresses,
        orders=orders
    )
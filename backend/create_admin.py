import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models import User
from routes.auth import hash_password

def create_admin():
    db = SessionLocal()
    
    # Check if admin already exists
    existing = db.query(User).filter(User.email == "admin@example.com").first()
    if existing:
        if existing.role != "admin":
            existing.role = "admin"
            db.commit()
            print("Updated existing admin@example.com to admin role.")
        else:
            print("Admin user admin@example.com already exists!")
        return

    admin_user = User(
        email="admin@example.com",
        password_hash=hash_password("admin123"),
        fullname="System Admin",
        phone="0000000000",
        role="admin"
    )
    
    db.add(admin_user)
    db.commit()
    print("Successfully created admin user!")
    print("Email: admin@example.com")
    print("Password: admin123")
    
    db.close()

if __name__ == "__main__":
    create_admin()

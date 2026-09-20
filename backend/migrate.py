import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR NOT NULL DEFAULT 'customer'"))
    conn.commit()
print('Added role column')

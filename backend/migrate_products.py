
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text('ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;'))
    conn.execute(text('ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE;'))
    conn.execute(text('ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new_arrival BOOLEAN NOT NULL DEFAULT FALSE;'))
    conn.execute(text('ALTER TABLE products ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN NOT NULL DEFAULT FALSE;'))
    conn.commit()
print('Added product flags')


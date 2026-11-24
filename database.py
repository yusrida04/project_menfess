import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL tidak ditemukan! Pastikan file .env ada di folder yang sama dengan database.py.")

def get_db():
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db():
    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor() as cur:
            cur.execute("""
                ALTER TABLE menfess
                ADD COLUMN IF NOT EXISTS music_data JSONB DEFAULT NULL,
                ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT NULL,
                ADD COLUMN IF NOT EXISTS flag_reason TEXT DEFAULT NULL;
            """)
        conn.commit()
    finally:
        conn.close()
import os, hmac, hashlib
from fastapi import Header, HTTPException

SECRET_KEY = os.getenv("SECRET_KEY", "ganti-dengan-secret-key-acak-panjang")

def get_token_hash(x_anon_token: str = Header(...)) -> str:
    if not 16 <= len(x_anon_token) <= 64:
        raise HTTPException(status_code=400, detail="Token tidak valid")
    return hmac.new(SECRET_KEY.encode(), x_anon_token.encode(), hashlib.sha256).hexdigest()
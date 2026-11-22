import hmac
import os
from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from database import get_db

router = APIRouter(prefix="/admin", tags=["Admin"])

def get_admin_secret() -> str:
    secret = os.getenv("ADMIN_SECRET_TOKEN")
    if not secret:
        raise HTTPException(status_code=503, detail="Autentikasi admin belum dikonfigurasi")
    return secret

# Dependency untuk mengunci semua endpoint admin
def verify_admin(authorization: str = Header(None)):
    if not hmac.compare_digest(authorization or "", f"Bearer {get_admin_secret()}"):
        raise HTTPException(status_code=401, detail="Akses admin ditolak")
    return True

class LoginRequest(BaseModel):
    password: str

class UpdateKategoriReq(BaseModel):
    kategori: str

# 1. Endpoint Login Admin
@router.post("/login")
def admin_login(payload: LoginRequest):
    secret = get_admin_secret()
    if not hmac.compare_digest(payload.password, secret):
        raise HTTPException(status_code=401, detail="Password admin salah")
    return {"token": secret}

# 2. Ambil daftar menfess berdasarkan status ('flagged' atau 'published')
@router.get("/menfess", dependencies=[Depends(verify_admin)])
def get_admin_menfess(status: str = "flagged", conn = Depends(get_db)):
    with conn.cursor() as cur:
        cur.execute("""
            SELECT 
                id, 
                category AS tag, 
                content, 
                confidence, 
                status, 
                is_corrected, 
                created_at
            FROM menfess
            WHERE status = %s
            ORDER BY created_at DESC
        """, (status,))
        rows = cur.fetchall()
    return {"data": rows}

# 3. Moderasi: Setujui (Approve) menfess agar tayang di beranda
@router.patch("/menfess/{menfess_id}/approve", dependencies=[Depends(verify_admin)])
def approve_menfess(menfess_id: int, conn = Depends(get_db)):
    with conn.cursor() as cur:
        cur.execute("""
            UPDATE menfess 
            SET status = 'published' 
            WHERE id = %s 
            RETURNING id
        """, (menfess_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Menfess tidak ditemukan")
    return {"status": "published", "id": menfess_id}

# 4. Moderasi: Tolak / Hapus menfess
@router.delete("/menfess/{menfess_id}", dependencies=[Depends(verify_admin)])
def reject_menfess(menfess_id: int, conn = Depends(get_db)):
    with conn.cursor() as cur:
        cur.execute("""
            DELETE FROM menfess 
            WHERE id = %s 
            RETURNING id
        """, (menfess_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Menfess tidak ditemukan")
    return {"status": "deleted", "id": menfess_id}

# 5. Koreksi Label: Ganti kategori hasil prediksi AI
@router.patch("/menfess/{menfess_id}/kategori", dependencies=[Depends(verify_admin)])
def correct_kategori(menfess_id: int, payload: UpdateKategoriReq, conn = Depends(get_db)):
    with conn.cursor() as cur:
        cur.execute("""
            UPDATE menfess
            SET category = %s, is_corrected = TRUE
            WHERE id = %s
            RETURNING id
        """, (payload.kategori, menfess_id))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Menfess tidak ditemukan")
    return {"id": menfess_id, "tag": payload.kategori, "is_corrected": True}
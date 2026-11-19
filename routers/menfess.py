from fastapi import APIRouter, Depends, Header, HTTPException, Request
from database import get_db
from dependencies import get_token_hash
from rate_limiter import LIMITS, cek_batas, cek_batas_ip
from schemas import MenfessCreate, VoteCreate, CommentCreate
from classifier import prediksi_kategori
import hmac, hashlib, os

router = APIRouter(prefix="/menfess", tags=["Menfess"])
SECRET_KEY = os.getenv("SECRET_KEY", "ganti-dengan-secret-key-acak-panjang")

def format_waktu(dt) -> str:
    return dt.strftime("%d %b %Y, %H:%M") if dt else "Baru saja"

@router.get("")
def baca_menfess(
    x_anon_token: str | None = Header(default=None),
    conn = Depends(get_db),
):
    token_hash = None
    if x_anon_token and 16 <= len(x_anon_token) <= 64:
        token_hash = hmac.new(SECRET_KEY.encode(), x_anon_token.encode(), hashlib.sha256).hexdigest()

    with conn.cursor() as cur:
        cur.execute("""
            SELECT 
                m.id,
                m.category AS tag,
                m.content,
                m.likes,
                m.created_at,
                COALESCE(v.value, 0) AS user_vote,
                (SELECT COUNT(*) FROM comments c WHERE c.menfess_id = m.id) AS comment_count
            FROM menfess m
            LEFT JOIN votes v 
                ON v.menfess_id = m.id AND v.token_hash = %s
            ORDER BY m.created_at DESC
        """, (token_hash,))
        rows = cur.fetchall()

    return [
        {
            "id": r["id"],
            "tag": r["tag"],
            "content": r["content"],
            "likes": r["likes"],
            "user_vote": r["user_vote"],
            "comment_count": r["comment_count"],
            "timestamp": format_waktu(r["created_at"]),
        }
        for r in rows
    ]

@router.get("/{menfess_id}")
def baca_detail_menfess(
    menfess_id: int,
    x_anon_token: str | None = Header(default=None),
    conn = Depends(get_db),
):
    token_hash = None
    if x_anon_token and 16 <= len(x_anon_token) <= 64:
        token_hash = hmac.new(SECRET_KEY.encode(), x_anon_token.encode(), hashlib.sha256).hexdigest()

    with conn.cursor() as cur:
        cur.execute("""
            SELECT 
                m.id,
                m.category AS tag,
                m.content,
                m.likes,
                m.created_at,
                COALESCE(v.value, 0) AS user_vote,
                (SELECT COUNT(*) FROM comments c WHERE c.menfess_id = m.id) AS comment_count
            FROM menfess m
            LEFT JOIN votes v 
                ON v.menfess_id = m.id AND v.token_hash = %s
            WHERE m.id = %s
        """, (token_hash, menfess_id))
        r = cur.fetchone()

    if not r:
        raise HTTPException(status_code=404, detail="Menfess tidak ditemukan")

    return {
        "id": r["id"],
        "tag": r["tag"],
        "content": r["content"],
        "likes": r["likes"],
        "user_vote": r["user_vote"],
        "comment_count": r["comment_count"],
        "timestamp": format_waktu(r["created_at"]),
    }

@router.post("")
def kirim_menfess(
    payload: MenfessCreate,
    request: Request,
    token_hash: str = Depends(get_token_hash),
    conn = Depends(get_db),
):
    cek_batas_ip(request)
    cek_batas(f"menfess_h:{token_hash}", *LIMITS["menfess_hour"], "mengirim menfess (3/jam)")
    cek_batas(f"menfess_d:{token_hash}", *LIMITS["menfess_day"], "mengirim menfess harian (10/hari)")

    teks_bersih = payload.content.strip()
    kategori_ai = prediksi_kategori(teks_bersih)

    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO menfess (category, content)
            VALUES (%s, %s)
            RETURNING id, category AS tag, content, likes, created_at
        """, (kategori_ai, teks_bersih))
        row = cur.fetchone()

    return {
        "id": row["id"],
        "tag": row["tag"],
        "content": row["content"],
        "likes": row["likes"],
        "user_vote": 0,
        "timestamp": "Baru saja",
    }

@router.post("/{menfess_id}/vote")
def vote_menfess(
    menfess_id: int,
    payload: VoteCreate,
    token_hash: str = Depends(get_token_hash),
    conn = Depends(get_db),
):
    cek_batas(f"vote:{token_hash}", *LIMITS["vote_min"], "vote terlalu cepat")

    with conn.cursor() as cur:
        cur.execute("SELECT id FROM menfess WHERE id = %s", (menfess_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Menfess tidak ditemukan")

        if payload.value == 0:
            # Batalkan vote
            cur.execute(
                "DELETE FROM votes WHERE menfess_id = %s AND token_hash = %s",
                (menfess_id, token_hash),
            )
        else:
            # Insert baru atau ubah arah vote (-1 <-> 1)
            cur.execute("""
                INSERT INTO votes (menfess_id, token_hash, value)
                VALUES (%s, %s, %s)
                ON CONFLICT (menfess_id, token_hash)
                DO UPDATE SET value = EXCLUDED.value
            """, (menfess_id, token_hash, payload.value))

        # Hitung ulang total skor dari tabel votes dan simpan ke tabel menfess
        cur.execute("""
            UPDATE menfess
            SET likes = GREATEST(COALESCE((SELECT SUM(value) FROM votes WHERE menfess_id = %s), 0), 0)
            WHERE id = %s
            RETURNING likes
        """, (menfess_id, menfess_id))
        updated = cur.fetchone()

    return {"id": menfess_id, "likes": updated["likes"], "user_vote": payload.value}

def alias_untuk(cur, menfess_id: int, token_hash: str) -> str:
    # 1. Cek apakah token_hash ini sudah pernah komentar di menfess yang sama
    cur.execute(
        "SELECT alias FROM comments WHERE menfess_id = %s AND token_hash = %s LIMIT 1",
        (menfess_id, token_hash),
    )
    row = cur.fetchone()
    if row:
        return row["alias"]

    # 2. Hitung berapa pengomentar unik yang sudah ada di menfess ini
    cur.execute(
        "SELECT COUNT(DISTINCT token_hash) AS total FROM comments WHERE menfess_id = %s",
        (menfess_id,),
    )
    total = cur.fetchone()["total"]
    return f"Anonim #A{total + 1}"

@router.get("/{menfess_id}/comments")
def baca_komentar(menfess_id: int, conn = Depends(get_db)):
    with conn.cursor() as cur:
        cur.execute("SELECT id FROM menfess WHERE id = %s", (menfess_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Menfess tidak ditemukan")

        cur.execute("""
            SELECT id, alias, content, created_at
            FROM comments
            WHERE menfess_id = %s
            ORDER BY created_at ASC
        """, (menfess_id,))
        rows = cur.fetchall()

    return [
        {
            "id": r["id"],
            "alias": r["alias"],
            "content": r["content"],
            "timestamp": format_waktu(r["created_at"]),
        }
        for r in rows
    ]

@router.post("/{menfess_id}/comments")
def kirim_komentar(
    menfess_id: int,
    payload: CommentCreate,
    request: Request,
    token_hash: str = Depends(get_token_hash),
    conn = Depends(get_db),
):
    cek_batas_ip(request)
    cek_batas(f"comment_m:{token_hash}", 10, 60, "berkomentar terlalu cepat")

    with conn.cursor() as cur:
        cur.execute("SELECT id FROM menfess WHERE id = %s", (menfess_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Menfess tidak ditemukan")

        label_alias = alias_untuk(cur, menfess_id, token_hash)
        teks_bersih = payload.content.strip()

        cur.execute("""
            INSERT INTO comments (menfess_id, token_hash, alias, content)
            VALUES (%s, %s, %s, %s)
            RETURNING id, alias, content, created_at
        """, (menfess_id, token_hash, label_alias, teks_bersih))
        row = cur.fetchone()

    return {
        "id": row["id"],
        "alias": row["alias"],
        "content": row["content"],
        "timestamp": "Baru saja",
    }
from fastapi import APIRouter, Depends, Header, HTTPException, Request
from psycopg2.extras import Json
from database import get_db
from dependencies import get_token_hash
from rate_limiter import LIMITS, cek_batas, cek_batas_ip
from schemas import MenfessCreate, MenfessModeratorUpdate, VoteCreate, CommentCreate
from classifier import prediksi_kategori
import hmac, hashlib, os

router = APIRouter(prefix="/menfess", tags=["Menfess"])
SECRET_KEY = os.getenv("SECRET_KEY", "ganti-dengan-secret-key-acak-panjang")
ADMIN_SECRET = os.getenv("ADMIN_SECRET") or "unimed-admin-2026"

def format_waktu(dt) -> str:
    return dt.strftime("%d %b %Y, %H:%M") if dt else "Baru saja"

def verify_admin(x_admin_key: str = Header(default="", alias="X-Admin-Key")):
    if not hmac.compare_digest(
        x_admin_key.encode("utf-8"), ADMIN_SECRET.encode("utf-8")
    ):
        raise HTTPException(status_code=401, detail="Akses moderator ditolak.")

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
                m.music_data,
                m.image_url,
                m.likes,
                m.created_at,
                COALESCE(v.value, 0) AS user_vote,
                (SELECT COUNT(*) FROM comments c WHERE c.menfess_id = m.id) AS comment_count
            FROM menfess m
            LEFT JOIN votes v 
                ON v.menfess_id = m.id AND v.token_hash = %s
            WHERE m.status = 'published'
            ORDER BY m.created_at DESC
        """, (token_hash,))
        rows = cur.fetchall()

    return [
        {
            "id": r["id"],
            "tag": r["tag"],
            "content": r["content"],
            "music_data": r["music_data"],
            "image_url": r["image_url"],
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
                m.music_data,
                m.image_url,
                m.likes,
                m.created_at,
                COALESCE(v.value, 0) AS user_vote,
                (SELECT COUNT(*) FROM comments c WHERE c.menfess_id = m.id) AS comment_count
            FROM menfess m
            LEFT JOIN votes v 
                ON v.menfess_id = m.id AND v.token_hash = %s
            WHERE m.id = %s AND m.status = 'published'
        """, (token_hash, menfess_id))
        r = cur.fetchone()

    if not r:
        raise HTTPException(status_code=404, detail="Menfess tidak ditemukan")

    return {
        "id": r["id"],
        "tag": r["tag"],
        "content": r["content"],
        "music_data": r["music_data"],
        "image_url": r["image_url"],
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

    image_data = payload.image_url
    if image_data is not None:
        if not image_data.startswith("data:image/"):
            raise HTTPException(status_code=400, detail="Format gambar tidak valid.")
        if len(image_data) > 700_000:
            raise HTTPException(status_code=400, detail="Ukuran gambar terlalu besar.")

    teks_bersih = payload.content.strip()
    kategori_ai, confidence_ai, is_safe, flag_reason = prediksi_kategori(teks_bersih)
    status_menfess = "published" if is_safe else "flagged"
    music_json = Json(payload.music_data) if payload.music_data else None

    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO menfess (
                category, content, music_data, image_url, status, confidence, flag_reason
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id, category AS tag, content, music_data, image_url, likes,
                      status, confidence, flag_reason, created_at
        """, (
            kategori_ai,
            teks_bersih,
            music_json,
            image_data,
            status_menfess,
            confidence_ai,
            flag_reason if status_menfess == "flagged" else None,
        ))
        row = cur.fetchone()

    return {
        "id": row["id"],
        "tag": row["tag"],
        "content": row["content"],
        "music_data": row["music_data"],
        "image_url": row["image_url"],
        "likes": row["likes"],
        "status": row["status"],
        "flag_reason": row["flag_reason"],
        "user_vote": 0,
        "comment_count": 0,
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
        cur.execute(
            "SELECT id FROM menfess WHERE id = %s AND status = 'published'",
            (menfess_id,),
        )
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Menfess tidak ditemukan")

        if payload.value == 0:
            cur.execute(
                "DELETE FROM votes WHERE menfess_id = %s AND token_hash = %s",
                (menfess_id, token_hash),
            )
        else:
            cur.execute("""
                INSERT INTO votes (menfess_id, token_hash, value)
                VALUES (%s, %s, %s)
                ON CONFLICT (menfess_id, token_hash)
                DO UPDATE SET value = EXCLUDED.value
            """, (menfess_id, token_hash, payload.value))

        cur.execute("""
            UPDATE menfess
            SET likes = GREATEST(COALESCE((SELECT SUM(value) FROM votes WHERE menfess_id = %s), 0), 0)
            WHERE id = %s
            RETURNING likes
        """, (menfess_id, menfess_id))
        updated = cur.fetchone()

    return {"id": menfess_id, "likes": updated["likes"], "user_vote": payload.value}

def alias_untuk(cur, menfess_id: int, token_hash: str) -> str:
    cur.execute(
        "SELECT alias FROM comments WHERE menfess_id = %s AND token_hash = %s LIMIT 1",
        (menfess_id, token_hash),
    )
    row = cur.fetchone()
    if row:
        return row["alias"]

    cur.execute(
        "SELECT COUNT(DISTINCT token_hash) AS total FROM comments WHERE menfess_id = %s",
        (menfess_id,),
    )
    total = cur.fetchone()["total"]
    return f"Anonim #A{total + 1}"

@router.get("/{menfess_id}/comments")
def baca_komentar(menfess_id: int, conn = Depends(get_db)):
    with conn.cursor() as cur:
        cur.execute(
            "SELECT id FROM menfess WHERE id = %s AND status = 'published'",
            (menfess_id,),
        )
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
        cur.execute(
            "SELECT id FROM menfess WHERE id = %s AND status = 'published'",
            (menfess_id,),
        )
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
@router.get("/moderator/queue", dependencies=[Depends(verify_admin)])
def baca_antrean_moderator(conn=Depends(get_db)):
    with conn.cursor() as cur:
        cur.execute("""
            SELECT id, category AS tag, content, music_data, image_url,
                   status, confidence, flag_reason, created_at
            FROM menfess
            WHERE status = 'flagged'
            ORDER BY created_at DESC
        """)
        rows = cur.fetchall()
    return [dict(r) for r in rows]

@router.patch("/moderator/{menfess_id}/approve", dependencies=[Depends(verify_admin)])
def setujui_menfess(menfess_id: int, conn=Depends(get_db)):
    with conn.cursor() as cur:
        cur.execute("""
            UPDATE menfess
            SET status = 'published', flag_reason = NULL
            WHERE id = %s
            RETURNING id, status
        """, (menfess_id,))
        row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Menfess tidak ditemukan.")
    return {"message": "Menfess disetujui dan tayang.", "id": row["id"]}

@router.put("/moderator/{menfess_id}", dependencies=[Depends(verify_admin)])
def edit_menfess_moderator(menfess_id: int, payload: MenfessModeratorUpdate, conn=Depends(get_db)):
    new_status = "published" if payload.approve else "flagged"
    clean_content = payload.content.strip()
    clean_tag = payload.tag.strip()
    if not clean_content:
        raise HTTPException(status_code=400, detail="Isi menfess tidak boleh kosong.")
    if not clean_tag:
        raise HTTPException(status_code=400, detail="Kategori menfess tidak boleh kosong.")

    with conn.cursor() as cur:
        cur.execute("""
            UPDATE menfess
            SET content = %s,
                category = %s,
                status = %s,
                flag_reason = CASE WHEN %s THEN NULL ELSE flag_reason END
            WHERE id = %s
            RETURNING id, category AS tag, content, status
        """, (clean_content, clean_tag, new_status, payload.approve, menfess_id))
        row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Menfess tidak ditemukan.")
    return dict(row)

@router.delete("/moderator/{menfess_id}", dependencies=[Depends(verify_admin)])
def hapus_menfess_moderator(menfess_id: int, conn=Depends(get_db)):
    with conn.cursor() as cur:
        cur.execute("DELETE FROM menfess WHERE id = %s RETURNING id", (menfess_id,))
        row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Menfess tidak ditemukan.")
    return {"message": "Menfess berhasil dihapus.", "id": row["id"]}
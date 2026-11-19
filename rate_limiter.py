from collections import defaultdict, deque
import math
import time
from fastapi import HTTPException, Request

# Konfigurasi batas (mudah diubah saat uji coba)
LIMITS = {
    "menfess_hour": (3, 3600),      # 3 per jam
    "menfess_day": (10, 86400),     # 10 per hari
    "comment_10m": (10, 600),       # 10 per 10 menit
    "vote_min": (60, 60),           # 60 per menit
    "report_hour": (5, 3600),       # 5 per jam
    "ip_hour": (100, 3600),         # Pengaman kasar per IP (Wi-Fi kampus)
}

hits = defaultdict(deque)

def cek_batas(kunci: str, batas: int, detik: int, label_aksi: str):
    now = time.time()
    q = hits[kunci]

    # Bersihkan timestamp yang sudah kedaluwarsa
    while q and now - q[0] > detik:
        q.popleft()

    if len(q) >= batas:
        sisa_detik = math.ceil(detik - (now - q[0]))
        if sisa_detik >= 60:
            menit = math.ceil(sisa_detik / 60)
            waktu_teks = f"{menit} menit"
        else:
            waktu_teks = f"{sisa_detik} detik"

        raise HTTPException(
            status_code=429,
            detail=f"Kamu sudah mencapai batas {label_aksi}. Coba lagi dalam {waktu_teks}."
        )

    q.append(now)

def cek_batas_ip(request: Request):
    # Ambil IP tanpa menyimpannya ke database atau log
    client_ip = request.client.host if request.client else "unknown"
    batas, detik = LIMITS["ip_hour"]
    cek_batas(f"ip:{client_ip}", batas, detik, "aktivitas dari jaringan ini")
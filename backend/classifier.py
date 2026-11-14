# Contoh: muat model AI kamu sekali di sini saat server start
# import joblib
# model = joblib.load("model_menfess.pkl")

VALID_CATEGORIES = {"Asmara", "Kampus", "Sosial", "Lainnya"}

def prediksi_kategori(teks: str) -> str:
    # --- GANTI BAGIAN INI DENGAN PREDIKSI MODEL AI KAMU ---
    # Contoh:
    # hasil = model.predict([teks])[0]
    # return hasil if hasil in VALID_CATEGORIES else "Lainnya"

    teks_lower = teks.lower()
    if any(k in teks_lower for k in ["crush", "pacar", "gebetan", "cinta", "baper", "sayang"]):
        return "Asmara"
    if any(k in teks_lower for k in ["dosen", "sks", "krs", "ukt", "praktikum", "tugas", "kampus", "fakultas"]):
        return "Kampus"
    if any(k in teks_lower for k in ["teman", "organisasi", "ukm", "event", "nongkrong", "panitia"]):
        return "Sosial"
    return "Lainnya"
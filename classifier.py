import json
import os
import re
import joblib
import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModelForSequenceClassification

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "model_indobert")
SAFETY_DIR = os.path.join(BASE_DIR, "model_safety")
VALID_CATEGORIES = {"Asmara", "Kampus", "Sosial", "Lainnya"}

# 1. Muat kamus slang & konfigurasi inference sekali saat server start
with open(os.path.join(MODEL_DIR, "slang_dict.json"), "r", encoding="utf-8") as f:
    SLANG_DICT = json.load(f)

with open(os.path.join(MODEL_DIR, "inference_config.json"), "r", encoding="utf-8") as f:
    INFERENCE_CFG = json.load(f)

THRESHOLD = float(INFERENCE_CFG.get("threshold", 0.799545))

with open(os.path.join(SAFETY_DIR, "safety_config.json"), "r", encoding="utf-8") as f:
    SAFETY_CFG = json.load(f)

SAFETY_MODEL = joblib.load(os.path.join(SAFETY_DIR, "safety_classifier.joblib"))
SAFETY_THRESHOLD = min(float(SAFETY_CFG.get("unsafe_threshold", 0.35)), 0.35)
SAFETY_CLASSES = SAFETY_CFG["classes"]
if "Aman" not in SAFETY_CLASSES:
    raise ValueError("Label 'Aman' tidak ditemukan pada konfigurasi model keamanan.")

UNSAFE_PATTERNS = (
    (re.compile(r"\b(?:anjing|babi|bangsat|bajingan|kontol|memek|ngentot|goblok|tolol|kampret)\b", re.I),
     "Terdeteksi kata kasar"),
    (re.compile(r"\b(?:kubunuh|bunuh(?:lah)?|membunuh|bakar(?:lah)?|pukul(?:lah)?|ancam(?:an)?|akan\s+(?:kubunuh|membunuh|mencelakai))\b", re.I),
     "Terdeteksi ancaman kekerasan"),
    (re.compile(r"\b(?:nim|nomor\s+induk(?:\s+mahasiswa)?)\b.{0,20}\b\d{6,}\b", re.I),
     "Terdeteksi kemungkinan pembocoran NIM"),
    (re.compile(r"(?<!\d)(?:\+?62|0)8(?:[\s.-]?\d){8,12}(?!\d)"),
     "Terdeteksi kemungkinan pembocoran nomor HP"),
    (re.compile(r"\b(?:judi\s+online|judol|slot\s+online|togel|taruhan\s+online|casino\s+online|kasino\s+online)\b", re.I),
     "Terdeteksi promosi judi online"),
)

# 2. Muat Tokenizer & Model IndoBERT sekali saat server start
tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR)
model.eval()

def normalize_slang(teks: str) -> str:
    teks = teks.lower()
    words = re.findall(r"\w+|[^\w\s]", teks)
    return " ".join(SLANG_DICT.get(w, w) for w in words)

def cek_keamanan(teks: str, teks_normal: str) -> tuple[bool, str | None]:
    for pattern, reason in UNSAFE_PATTERNS:
        if pattern.search(teks) or pattern.search(teks_normal):
            return False, reason

    if isinstance(SAFETY_MODEL, dict):
        vectorizer = SAFETY_MODEL["vectorizer"]
        classifier = SAFETY_MODEL["model"]
        probabilities = classifier.predict_proba(vectorizer.transform([teks_normal]))[0]
        classes = SAFETY_MODEL.get("classes", SAFETY_CLASSES)
    else:
        probabilities = SAFETY_MODEL.predict_proba([teks_normal])[0]
        classes = getattr(SAFETY_MODEL, "classes_", SAFETY_CLASSES)

    classes = [str(label) for label in classes]
    if "Aman" not in classes:
        raise ValueError("Label 'Aman' tidak ditemukan pada model keamanan.")

    safe_probability = float(probabilities[classes.index("Aman")])
    unsafe_score = 1.0 - safe_probability
    if unsafe_score >= SAFETY_THRESHOLD:
        return False, f"Terdeteksi potensi konten tidak aman (skor {unsafe_score:.2f})"

    return True, None

def prediksi_kategori(teks: str) -> tuple[str, float, bool, str | None]:
    teks_normal = normalize_slang(teks)
    is_safe, flag_reason = cek_keamanan(teks, teks_normal)

    inputs = tokenizer(
        teks_normal,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=128,
    )

    with torch.no_grad():
        outputs = model(**inputs)
        probabilities = F.softmax(outputs.logits, dim=-1)[0]
        confidence, pred_idx = torch.max(probabilities, dim=-1)

    idx = int(pred_idx.item())
    id2label = model.config.id2label
    label = id2label.get(idx) or id2label.get(str(idx), "Lainnya")

    if label not in VALID_CATEGORIES:
        label = "Lainnya"

    return label, float(confidence.item()), is_safe, flag_reason
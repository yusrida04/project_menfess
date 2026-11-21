import json
import os
import re
import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModelForSequenceClassification

MODEL_DIR = "model_indobert"

# 1. Muat kamus slang & threshold dari hasil Colab
slang_path = os.path.join(MODEL_DIR, "slang_dict.json")
config_path = os.path.join(MODEL_DIR, "inference_config.json")

with open(slang_path, "r", encoding="utf-8") as f:
    SLANG_DICT = json.load(f)

with open(config_path, "r", encoding="utf-8") as f:
    INFERENCE_CFG = json.load(f)

# Ambil threshold dari inference_config.json (default 0.799545)
THRESHOLD = float(INFERENCE_CFG.get("threshold", 0.799545))

# 2. Muat Tokenizer & Model IndoBERT (1x saat server start)
tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR)
model.eval()

def normalize_slang(text: str) -> str:
    text = text.lower()
    words = re.findall(r"\w+|[^\w\s]", text)
    normalized = [SLANG_DICT.get(w, w) for w in words]
    return " ".join(normalized)

def predict_menfess(raw_text: str) -> dict:
    clean_text = normalize_slang(raw_text)

    inputs = tokenizer(
        clean_text,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=128,
    )

    with torch.no_grad():
        outputs = model(**inputs)
        probs = F.softmax(outputs.logits, dim=-1)[0]
        confidence, pred_idx = torch.max(probs, dim=0)

    confidence_val = float(confidence.item())
    idx = int(pred_idx.item())

    # Ambil nama label dari config.json (support key string maupun int)
    id2label = model.config.id2label
    label = id2label.get(idx) or id2label.get(str(idx), "Lainnya")

    # Tentukan otomatis tayang ('published') atau masuk moderasi ('flagged')
    status = "published" if confidence_val >= THRESHOLD else "flagged"

    return {
        "kategori": label,
        "confidence": round(confidence_val, 4),
        "status": status,
    }
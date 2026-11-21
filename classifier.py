import json
import os
import re
import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModelForSequenceClassification

MODEL_DIR = "model_indobert"
VALID_CATEGORIES = {"Asmara", "Kampus", "Sosial", "Lainnya"}

# 1. Muat kamus slang & konfigurasi inference sekali saat server start
with open(os.path.join(MODEL_DIR, "slang_dict.json"), "r", encoding="utf-8") as f:
    SLANG_DICT = json.load(f)

with open(os.path.join(MODEL_DIR, "inference_config.json"), "r", encoding="utf-8") as f:
    INFERENCE_CFG = json.load(f)

THRESHOLD = float(INFERENCE_CFG.get("threshold", 0.799545))

# 2. Muat Tokenizer & Model IndoBERT sekali saat server start
tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR)
model.eval()

def normalize_slang(teks: str) -> str:
    teks = teks.lower()
    words = re.findall(r"\w+|[^\w\s]", teks)
    return " ".join(SLANG_DICT.get(w, w) for w in words)

def prediksi_kategori(teks: str) -> tuple[str, float]:
    teks_normal = normalize_slang(teks)
    
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
        
    return label, round(float(confidence.item()), 4)
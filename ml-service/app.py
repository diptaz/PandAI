"""PandAI ML Service: estimasi durasi pengerjaan tugas.

Endpoint:
    GET  /health               -> cek server dan model siap
    POST /ml/predict-duration  -> estimasi durasi (jam), rentang min-max, dan faktor

Model dilatih di machine-learning/ml.ipynb (KAN-25) lalu disimpan per versi
(models/pandai_model_v1.pkl, _v2.pkl, ...). models/registry.json mencatat metadata
tiap versi dan versi mana yang aktif.

Memilih versi:
    default              -> versi "aktif" di registry.json
    MODEL_VERSION=v1     -> paksa pakai versi tertentu (mis. rollback / A-B test)
"""

import hashlib
import json
import os
from pathlib import Path
from typing import Literal

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel, Field, field_validator

MODEL_DIR = Path(os.getenv("MODEL_DIR", "./models"))


def muat_model() -> tuple[str, dict]:
    """Baca registry, pilih versi, cek sha256, lalu muat paket model."""
    reg = json.loads((MODEL_DIR / "registry.json").read_text(encoding="utf-8"))
    versi = os.getenv("MODEL_VERSION") or reg["aktif"]
    if versi not in reg["versi"]:
        raise RuntimeError(f"Model versi '{versi}' tidak ada di registry: {list(reg['versi'])}")
    info = reg["versi"][versi]
    file = MODEL_DIR / info["file"]
    if hashlib.sha256(file.read_bytes()).hexdigest() != info["sha256"]:
        raise RuntimeError(f"sha256 {file.name} tidak cocok dengan registry (file rusak/tertukar)")
    return versi, joblib.load(file)

# Tugas kuliah terkecil dipetakan ke persentil 0.20 dan terbesar ke 0.95 dari data
# latih SiP. Di bawah 0.20 data SiP berisi tugas belasan menit (tidak realistis untuk
# tugas kuliah), di atas 0.95 kurva model mulai tidak stabil karena data tipis.
PCT_BAWAH, PCT_ATAS = 0.20, 0.95

LABEL_PEMAHAMAN = {1: "sangat rendah", 2: "rendah", 3: "sedang", 4: "baik", 5: "sangat baik"}

# Model dimuat SEKALI saat server menyala, bukan setiap request
VERSI_AKTIF, paket = muat_model()

app = FastAPI(title="PandAI ML Service", version="1.0.0")


# ---------- Skema request & response (kontrak dengan BE) ----------

class Features(BaseModel):
    size: float = Field(..., gt=0, description="Jumlah satuan tugas, mis. 10 (halaman)")
    type: Literal["laporan", "coding", "presentasi", "praktikum"]
    course_mastery: int = Field(..., ge=1, le=5, description="Pemahaman matkul 1-5")

    @field_validator("type", mode="before")
    @classmethod
    def rapikan_type(cls, v):
        # Terima "Laporan" / " LAPORAN " dari hasil parse BE, samakan jadi huruf kecil
        return v.strip().lower() if isinstance(v, str) else v


class PredictRequest(BaseModel):
    task_id: str
    user_id: str
    features: Features


class DurationRange(BaseModel):
    min: float
    max: float


class PredictResponse(BaseModel):
    estimated_duration_hours: float
    duration_range_hours: DurationRange
    factors: list[str]


# ---------- Logika prediksi ----------

def ukuran_ke_pct(tipe: str, size: float) -> float:
    """Ubah size dari BE (mis. 10 halaman) jadi posisi persentil di data latih."""
    r = paket["rentang_ukuran"][tipe]
    size = min(max(size, r["min"]), r["max"])
    posisi = (np.log(size) - np.log(r["min"])) / (np.log(r["max"]) - np.log(r["min"]))
    return PCT_BAWAH + (PCT_ATAS - PCT_BAWAH) * posisi


def prediksi(tipe: str, size: float, course_mastery: int) -> dict:
    pct = ukuran_ke_pct(tipe, size)
    X_baru = pd.DataFrame({"type": [tipe], "size_pct": [pct]})
    k = paket["pengali_mastery"][course_mastery]

    # Running max: tugas lebih besar tidak pernah diprediksi lebih cepat (jaminan monoton)
    grid = pd.DataFrame({"type": tipe, "size_pct": np.linspace(0, pct, 40)})
    est = float(paket["model_estimasi"].predict(grid).max()) * k
    # Rentang P10-P90 + koreksi conformal (CQR) di skala log
    q = paket.get("koreksi_log", 0.0)
    lo = float(np.expm1(np.log1p(paket["model_min"].predict(X_baru)[0]) - q)) * k
    hi = float(np.expm1(np.log1p(paket["model_max"].predict(X_baru)[0]) + q)) * k
    lo, hi = min(lo, est), max(hi, est)  # jaga urutan min <= estimasi <= max

    ukuran = "besar" if pct > 2 / 3 else "sedang" if pct > 1 / 3 else "kecil"
    return {
        "estimated_duration_hours": round(est, 1),
        "duration_range_hours": {"min": round(lo, 1), "max": round(hi, 1)},
        "factors": [f"Ukuran tugas {ukuran}",
                    f"Pemahaman matkul {LABEL_PEMAHAMAN[course_mastery]}"],
    }


# ---------- Endpoint ----------

@app.get("/health")
def health():
    return {"status": "ok", "model_version": VERSI_AKTIF, "model_name": paket["metadata"]["versi"]}


@app.post("/ml/predict-duration", response_model=PredictResponse)
def predict_duration(req: PredictRequest):
    f = req.features
    return prediksi(f.type, f.size, f.course_mastery)

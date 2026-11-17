"""PandAI ML Service: estimasi durasi pengerjaan tugas.

Endpoint:
    GET  /health               -> cek server dan model siap
    POST /ml/predict-duration  -> estimasi durasi (jam), rentang min-max, dan faktor

Model dilatih di machine-learning/ml.ipynb (KAN-25) lalu disimpan sebagai satu paket
joblib berisi: model_estimasi, model_min, model_max, pengali_mastery, rentang_ukuran,
dan metadata.
"""

import os
from typing import Literal

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel, Field, field_validator

MODEL_PATH = os.getenv("MODEL_PATH", "./models/pandai_model.pkl")

# Tugas kuliah terkecil dipetakan ke persentil 0.20 dan terbesar ke 0.95 dari data
# latih SiP. Di bawah 0.20 data SiP berisi tugas belasan menit (tidak realistis untuk
# tugas kuliah), di atas 0.95 kurva model mulai tidak stabil karena data tipis.
PCT_BAWAH, PCT_ATAS = 0.20, 0.95

LABEL_PEMAHAMAN = {1: "sangat rendah", 2: "rendah", 3: "sedang", 4: "baik", 5: "sangat baik"}

# Model dimuat SEKALI saat server menyala, bukan setiap request
paket: dict = joblib.load(MODEL_PATH)

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

    est = float(paket["model_estimasi"].predict(X_baru)[0]) * k
    lo = float(paket["model_min"].predict(X_baru)[0]) * k
    hi = float(paket["model_max"].predict(X_baru)[0]) * k
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
    return {"status": "ok", "model_version": paket["metadata"]["versi"]}


@app.post("/ml/predict-duration", response_model=PredictResponse)
def predict_duration(req: PredictRequest):
    f = req.features
    return prediksi(f.type, f.size, f.course_mastery)

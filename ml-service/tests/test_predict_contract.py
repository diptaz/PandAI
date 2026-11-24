"""Test kontrak POST /ml/predict-duration sesuai API Contract BE (17 Nov 2026)."""

import time

import pytest
from fastapi.testclient import TestClient

from app import app

TYPE_VALID = ["laporan", "coding", "presentasi", "praktikum"]


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


def body(size=10, type="laporan", course_mastery=3):
    return {"task_id": "T001", "user_id": "U123",
            "features": {"size": size, "type": type, "course_mastery": course_mastery}}


def test_health(client):
    res = client.get("/ml/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["model_loaded"] is True
    assert "model_version" in data


def test_contoh_dari_kontrak(client):
    res = client.post("/ml/predict-duration", json=body())
    assert res.status_code == 200
    data = res.json()
    assert set(data) == {"estimated_duration_hours", "duration_range_hours", "factors"}
    assert set(data["duration_range_hours"]) == {"min", "max"}
    assert isinstance(data["factors"], list) and len(data["factors"]) == 2


@pytest.mark.parametrize("tipe", TYPE_VALID)
@pytest.mark.parametrize("mastery", [1, 3, 5])
def test_urutan_min_estimasi_max(client, tipe, mastery):
    data = client.post("/ml/predict-duration", json=body(5, tipe, mastery)).json()
    r = data["duration_range_hours"]
    assert 0 < r["min"] <= data["estimated_duration_hours"] <= r["max"]


def test_type_huruf_besar_diterima(client):
    res = client.post("/ml/predict-duration", json=body(type=" Laporan "))
    assert res.status_code == 200


def test_pemahaman_rendah_lebih_lama(client):
    rendah = client.post("/ml/predict-duration", json=body(course_mastery=1)).json()
    tinggi = client.post("/ml/predict-duration", json=body(course_mastery=5)).json()
    assert rendah["estimated_duration_hours"] > tinggi["estimated_duration_hours"]


def test_tugas_lebih_besar_tidak_lebih_cepat(client):
    kecil = client.post("/ml/predict-duration", json=body(size=2)).json()
    besar = client.post("/ml/predict-duration", json=body(size=20)).json()
    assert besar["estimated_duration_hours"] >= kecil["estimated_duration_hours"]


@pytest.mark.parametrize("alias, tipe_model", [
    ("esai", "laporan"), ("Makalah", "laporan"), ("PPT", "presentasi"), ("UTS", "praktikum"),
])
def test_alias_type_sama_dengan_type_model(client, alias, tipe_model):
    a = client.post("/ml/predict-duration", json=body(size=5, type=alias))
    b = client.post("/ml/predict-duration", json=body(size=5, type=tipe_model))
    assert a.status_code == 200
    assert a.json()["estimated_duration_hours"] == b.json()["estimated_duration_hours"]


def test_type_tidak_dikenal_pakai_fallback(client):
    res = client.post("/ml/predict-duration", json=body(type="bikin video"))
    assert res.status_code == 200
    factors = res.json()["factors"]
    assert len(factors) == 3
    assert "belum dikenal" in factors[-1]


@pytest.mark.parametrize("features", [
    {"size": 10, "type": "   ", "course_mastery": 3},       # type kosong
    {"size": 10, "type": "x" * 51, "course_mastery": 3},    # type terlalu panjang
    {"size": 0, "type": "laporan", "course_mastery": 3},    # size harus > 0
    {"size": -5, "type": "laporan", "course_mastery": 3},
    {"size": 10, "type": "laporan", "course_mastery": 0},   # mastery 1-5
    {"size": 10, "type": "laporan", "course_mastery": 6},
    {"size": 10, "type": "laporan"},                        # field wajib hilang
])
def test_input_tidak_valid_ditolak(client, features):
    res = client.post("/ml/predict-duration",
                      json={"task_id": "T001", "user_id": "U123", "features": features})
    assert res.status_code == 422


def test_latency_di_bawah_100ms(client):
    client.post("/ml/predict-duration", json=body())  # pemanasan
    waktu = []
    for _ in range(20):
        t0 = time.perf_counter()
        res = client.post("/ml/predict-duration", json=body())
        waktu.append((time.perf_counter() - t0) * 1000)
        assert res.status_code == 200
    assert max(waktu) < 100, f"Latency maksimum {max(waktu):.1f} ms"

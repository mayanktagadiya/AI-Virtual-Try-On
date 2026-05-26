import io
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app
from app.providers.base import TryOnResult
from app.providers.stub import StubProvider

client = TestClient(app)


def _jpeg_bytes(w: int = 100, h: int = 100) -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", (w, h), color=(200, 150, 100)).save(buf, format="JPEG")
    return buf.getvalue()


@pytest.fixture(autouse=True)
def use_stub_provider(monkeypatch):
    """Redirect all tryon calls to StubProvider so tests never hit HuggingFace."""
    monkeypatch.setattr("app.api.v1.tryon.get_provider", lambda: StubProvider())


# ── Happy path — garment_id ──────────────────────────────────────────────────

def test_tryon_with_garment_id_returns_200():
    resp = client.post(
        "/api/v1/tryon",
        data={"height_cm": "175", "weight_kg": "70", "body_type": "average",
              "gender": "male", "garment_id": "tshirt-001"},
        files={"person_image": ("photo.jpg", _jpeg_bytes(), "image/jpeg")},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert "image_base64" in body
    assert "fit_prediction" in body
    assert body["fit_prediction"]["chest_fit"] in ("tight", "standard", "loose")


def test_tryon_response_schema():
    resp = client.post(
        "/api/v1/tryon",
        data={"height_cm": "175", "weight_kg": "70", "body_type": "average",
              "gender": "male", "garment_id": "tshirt-001"},
        files={"person_image": ("photo.jpg", _jpeg_bytes(), "image/jpeg")},
    )
    body = resp.json()
    assert "provider" in body
    assert "mime_type" in body
    fp = body["fit_prediction"]
    assert set(fp.keys()) >= {"chest_fit", "length", "sleeve", "summary"}


# ── Happy path — garment_image ───────────────────────────────────────────────

def test_tryon_with_uploaded_garment_image():
    resp = client.post(
        "/api/v1/tryon",
        data={"height_cm": "170", "weight_kg": "65", "body_type": "slim", "gender": "female"},
        files={
            "person_image": ("person.jpg", _jpeg_bytes(), "image/jpeg"),
            "garment_image": ("garment.jpg", _jpeg_bytes(), "image/jpeg"),
        },
    )
    assert resp.status_code == 200


# ── Validation errors ────────────────────────────────────────────────────────

def test_tryon_missing_garment_returns_422():
    resp = client.post(
        "/api/v1/tryon",
        data={"height_cm": "175", "weight_kg": "70", "body_type": "average", "gender": "male"},
        files={"person_image": ("photo.jpg", _jpeg_bytes(), "image/jpeg")},
    )
    assert resp.status_code == 422


def test_tryon_invalid_garment_id_returns_404():
    resp = client.post(
        "/api/v1/tryon",
        data={"height_cm": "175", "weight_kg": "70", "body_type": "average",
              "gender": "male", "garment_id": "does-not-exist"},
        files={"person_image": ("photo.jpg", _jpeg_bytes(), "image/jpeg")},
    )
    assert resp.status_code == 404


def test_tryon_missing_person_image_returns_422():
    resp = client.post(
        "/api/v1/tryon",
        data={"height_cm": "175", "weight_kg": "70", "body_type": "average",
              "gender": "male", "garment_id": "tshirt-001"},
    )
    assert resp.status_code == 422


# ── Provider error handling ──────────────────────────────────────────────────

def test_tryon_provider_error_returns_502():
    with patch("app.api.v1.tryon.get_provider") as mock_get:
        failing = AsyncMock()
        failing.name = "stub"
        failing.generate = AsyncMock(side_effect=RuntimeError("provider down"))
        mock_get.return_value = failing

        resp = client.post(
            "/api/v1/tryon",
            data={"height_cm": "175", "weight_kg": "70", "body_type": "average",
                  "gender": "male", "garment_id": "tshirt-001"},
            files={"person_image": ("photo.jpg", _jpeg_bytes(), "image/jpeg")},
        )
    assert resp.status_code == 502
    assert "AI provider error" in resp.json()["detail"]


# ── All catalog items ────────────────────────────────────────────────────────

def test_all_catalog_garment_ids_accepted():
    catalog_resp = client.get("/api/v1/catalog")
    ids = [item["id"] for item in catalog_resp.json()]
    for gid in ids:
        resp = client.post(
            "/api/v1/tryon",
            data={"height_cm": "175", "weight_kg": "70", "body_type": "average",
                  "gender": "male", "garment_id": gid},
            files={"person_image": ("photo.jpg", _jpeg_bytes(), "image/jpeg")},
        )
        assert resp.status_code == 200, f"Failed for garment_id={gid}"

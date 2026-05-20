import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_returns_ok() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data


def test_catalog_returns_list() -> None:
    response = client.get("/api/v1/catalog")
    assert response.status_code == 200
    items = response.json()
    assert isinstance(items, list)
    assert len(items) == 8
    first = items[0]
    assert "id" in first
    assert "garment_measurements" in first

import json
from pathlib import Path

from fastapi import APIRouter

from app.schemas.catalog import CatalogItem

router = APIRouter()

_CATALOG_PATH = Path(__file__).parent.parent.parent.parent / "data" / "catalog.json"


def _load_catalog() -> list[CatalogItem]:
    raw = json.loads(_CATALOG_PATH.read_text())
    return [CatalogItem(**item) for item in raw]


@router.get("/catalog", response_model=list[CatalogItem])
async def get_catalog() -> list[CatalogItem]:
    return _load_catalog()

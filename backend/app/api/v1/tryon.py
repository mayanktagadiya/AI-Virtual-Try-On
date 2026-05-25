import base64
import json
from pathlib import Path

from fastapi import APIRouter, Form, HTTPException, UploadFile
from loguru import logger

from app.config import get_settings
from app.fit_prediction import FitPredictionInput, predict_fit
from app.fit_prediction.gemini import gemini_predict_fit
from app.providers.base import TryOnRequest
from app.providers.registry import get_provider
from app.schemas.catalog import CatalogItem
from app.schemas.tryon import FitPredictionOut, TryOnResponse

router = APIRouter()

_MAX_FILE_BYTES = 10 * 1024 * 1024  # 10 MB
_CATALOG_PATH = Path(__file__).parent.parent.parent.parent / "data" / "catalog.json"
_STATIC_DIR = Path(__file__).parent.parent.parent.parent / "static"


def _load_catalog() -> list[CatalogItem]:
    return [CatalogItem(**item) for item in json.loads(_CATALOG_PATH.read_text())]


def _get_catalog_item(garment_id: str) -> CatalogItem:
    items = {item.id: item for item in _load_catalog()}
    item = items.get(garment_id)
    if not item:
        raise HTTPException(status_code=404, detail=f"Garment '{garment_id}' not in catalog")
    return item


def _load_catalog_image_bytes(garment_id: str) -> bytes:
    path = _STATIC_DIR / "catalog" / f"{garment_id}.png"
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"Catalog image not found: {garment_id}")
    return path.read_bytes()


@router.post("/tryon", response_model=TryOnResponse)
async def run_tryon(
    person_image: UploadFile,
    height_cm: float = Form(...),
    weight_kg: float = Form(...),
    body_type: str = Form(...),
    gender: str = Form(...),
    garment_image: UploadFile | None = None,
    garment_id: str | None = Form(None),
) -> TryOnResponse:
    # Validate: must supply exactly one garment source
    if garment_id is None and garment_image is None:
        raise HTTPException(
            status_code=422,
            detail="Provide either garment_id (catalog) or garment_image (file upload)",
        )

    person_bytes = await person_image.read()
    if len(person_bytes) > _MAX_FILE_BYTES:
        raise HTTPException(status_code=413, detail="Person image too large (max 10 MB)")

    # Resolve garment bytes + measurements
    if garment_id is not None:
        catalog_item = _get_catalog_item(garment_id)
        garment_bytes = _load_catalog_image_bytes(garment_id)
        gm = catalog_item.garment_measurements
        fit_input = FitPredictionInput(
            height_cm=height_cm,
            weight_kg=weight_kg,
            body_type=body_type,
            garment_chest_cm=gm.chest_cm,
            garment_length_cm=gm.length_cm,
            garment_sleeve_cm=gm.sleeve_cm,
        )
    else:
        assert garment_image is not None
        garment_bytes = await garment_image.read()
        if len(garment_bytes) > _MAX_FILE_BYTES:
            raise HTTPException(status_code=413, detail="Garment image too large (max 10 MB)")
        fit_input = FitPredictionInput(
            height_cm=height_cm,
            weight_kg=weight_kg,
            body_type=body_type,
        )

    provider = get_provider()
    logger.info(
        "TryOn — provider={} garment={} h={} w={} body={}",
        provider.name,
        garment_id or "uploaded",
        height_cm,
        weight_kg,
        body_type,
    )

    try:
        result = await provider.generate(
            TryOnRequest(
                person_image_bytes=person_bytes,
                garment_image_bytes=garment_bytes,
            )
        )
    except Exception as exc:
        logger.error("Provider {} failed: {}", provider.name, exc)
        raise HTTPException(status_code=502, detail=f"AI provider error: {exc}") from exc

    settings = get_settings()
    use_gemini = (
        settings.gemini_api_key
        and result.provider not in ("stub", "mock")
    )
    if use_gemini:
        fit = await gemini_predict_fit(
            fit_input,
            result.image_bytes,
            result.mime_type,
            settings.gemini_api_key,  # type: ignore[arg-type]
        )
    else:
        fit = predict_fit(fit_input)

    return TryOnResponse(
        image_base64=base64.b64encode(result.image_bytes).decode(),
        mime_type=result.mime_type,
        fit_prediction=FitPredictionOut(
            chest_fit=fit.chest_fit,
            length=fit.length,
            sleeve=fit.sleeve,
            summary=fit.summary,
        ),
        provider=result.provider,
        latency_ms=result.latency_ms,
    )

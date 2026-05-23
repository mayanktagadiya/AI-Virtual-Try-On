import base64

from fastapi import APIRouter, Form, HTTPException, UploadFile
from loguru import logger

from app.fit_prediction import FitPredictionInput, predict_fit
from app.providers.base import TryOnRequest
from app.providers.registry import get_provider
from app.schemas.tryon import FitPredictionOut, TryOnResponse

router = APIRouter()

_MAX_FILE_BYTES = 10 * 1024 * 1024  # 10 MB


@router.post("/tryon", response_model=TryOnResponse)
async def run_tryon(
    person_image: UploadFile,
    garment_image: UploadFile,
    height_cm: float = Form(...),
    weight_kg: float = Form(...),
    body_type: str = Form(...),
    gender: str = Form(...),
    garment_id: str | None = Form(None),
) -> TryOnResponse:
    person_bytes = await person_image.read()
    garment_bytes = await garment_image.read()

    if len(person_bytes) > _MAX_FILE_BYTES or len(garment_bytes) > _MAX_FILE_BYTES:
        raise HTTPException(status_code=413, detail="Image too large (max 10 MB)")

    logger.info(
        "TryOn request — provider={} height={} weight={} body_type={}",
        get_provider().name,
        height_cm,
        weight_kg,
        body_type,
    )

    provider = get_provider()
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

    fit_input = FitPredictionInput(
        height_cm=height_cm,
        weight_kg=weight_kg,
        body_type=body_type,
    )
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

from pydantic import BaseModel, Field


class FitPredictionOut(BaseModel):
    chest_fit: str = Field(description="tight | standard | loose")
    length: str = Field(description="short | standard | long")
    sleeve: str = Field(description="short | standard | long")
    summary: str


class TryOnResponse(BaseModel):
    image_base64: str
    mime_type: str
    fit_prediction: FitPredictionOut
    provider: str
    latency_ms: int = 0

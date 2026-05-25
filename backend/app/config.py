import os
from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "AI Virtual Try-On API"
    version: str = "0.1.0"
    debug: bool = Field(default=False)

    tryon_provider: str = Field(default="stub", alias="TRYON_PROVIDER")

    hf_token: str | None = Field(default=None, alias="HF_TOKEN")

    gemini_api_key: str | None = Field(default=None, alias="GEMINI_API_KEY")

    frontend_origin: str = Field(
        default="http://localhost:5173", alias="FRONTEND_ORIGIN"
    )

    model_config = {"env_file": ".env", "populate_by_name": True}


@lru_cache
def get_settings() -> Settings:
    return Settings()

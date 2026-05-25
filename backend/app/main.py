from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from loguru import logger

from app.api.v1 import catalog, health, tryon
from app.config import get_settings

_STATIC_DIR = Path(__file__).parent.parent / "static"


def create_app() -> FastAPI:
    settings = get_settings()

    @asynccontextmanager
    async def lifespan(_: FastAPI) -> AsyncGenerator[None, None]:
        logger.info(
            "Starting {} v{} — provider={}",
            settings.app_name,
            settings.version,
            settings.tryon_provider,
        )
        yield

    app = FastAPI(
        title=settings.app_name,
        version=settings.version,
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.frontend_origin],
        allow_origin_regex=r"https://.*\.vercel\.app",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Serve catalog images at /static/catalog/<filename>
    _STATIC_DIR.mkdir(exist_ok=True)
    app.mount("/static", StaticFiles(directory=str(_STATIC_DIR)), name="static")

    app.include_router(health.router)
    app.include_router(catalog.router, prefix="/api/v1")
    app.include_router(tryon.router, prefix="/api/v1")

    return app


app = create_app()

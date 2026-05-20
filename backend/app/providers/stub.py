import base64
import time

from loguru import logger

from app.providers.base import TryOnProvider, TryOnRequest, TryOnResult

# 1x1 transparent PNG — placeholder until a real provider is wired
_PLACEHOLDER_PNG = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk"
    "YPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
)


class StubProvider(TryOnProvider):
    """No-op provider used for wiring + testing. Returns a 1×1 placeholder."""

    @property
    def name(self) -> str:
        return "stub"

    async def generate(self, request: TryOnRequest) -> TryOnResult:
        start = time.monotonic()
        logger.debug("StubProvider.generate called — returning placeholder image")
        latency_ms = int((time.monotonic() - start) * 1000)
        return TryOnResult(
            image_bytes=_PLACEHOLDER_PNG,
            mime_type="image/png",
            provider=self.name,
            latency_ms=latency_ms,
        )

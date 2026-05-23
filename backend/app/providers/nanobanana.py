from app.providers.base import TryOnProvider, TryOnRequest, TryOnResult


class NanoBananaProvider(TryOnProvider):
    """Gemini image generation provider — implemented Day 5."""

    @property
    def name(self) -> str:
        return "nanobanana"

    async def generate(self, request: TryOnRequest) -> TryOnResult:
        raise NotImplementedError("NanoBananaProvider is implemented on Day 5")

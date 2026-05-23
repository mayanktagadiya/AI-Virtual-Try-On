from app.providers.base import TryOnProvider, TryOnRequest, TryOnResult


class ReplicateProvider(TryOnProvider):
    """Replicate IDM-VTON provider — stub, implemented Day 6+."""

    @property
    def name(self) -> str:
        return "replicate"

    async def generate(self, request: TryOnRequest) -> TryOnResult:
        raise NotImplementedError("ReplicateProvider is not yet implemented")

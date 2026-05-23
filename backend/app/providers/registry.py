from app.config import get_settings
from app.providers.base import TryOnProvider
from app.providers.stub import StubProvider


def get_provider() -> TryOnProvider:
    """Return the active provider based on TRYON_PROVIDER env var."""
    name = get_settings().tryon_provider.lower()

    if name == "stub":
        return StubProvider()

    if name == "huggingface":
        from app.providers.huggingface import HuggingFaceProvider
        return HuggingFaceProvider()

    if name == "nanobanana":
        from app.providers.nanobanana import NanoBananaProvider  # Day 5
        return NanoBananaProvider()

    if name == "replicate":
        from app.providers.replicate import ReplicateProvider  # Day 6 stub
        return ReplicateProvider()

    raise ValueError(
        f"Unknown provider '{name}'. "
        "Valid options: stub, huggingface, nanobanana, replicate"
    )

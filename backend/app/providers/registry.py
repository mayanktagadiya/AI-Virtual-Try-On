from app.config import get_settings
from app.providers.base import TryOnProvider
from app.providers.stub import StubProvider


def get_provider() -> TryOnProvider:
    """Return the active provider based on TRYON_PROVIDER env var."""
    name = get_settings().tryon_provider.lower()
    if name == "stub":
        return StubProvider()
    raise ValueError(
        f"Unknown provider '{name}'. "
        "Valid options: stub, huggingface, nanobanana, replicate"
    )

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class TryOnRequest:
    person_image_bytes: bytes
    garment_image_bytes: bytes
    person_mime: str = "image/jpeg"
    garment_mime: str = "image/jpeg"


@dataclass
class TryOnResult:
    image_bytes: bytes
    mime_type: str = "image/jpeg"
    provider: str = "unknown"
    latency_ms: int = 0


class TryOnProvider(ABC):
    """Abstract base for all try-on inference providers.

    Concrete implementations: StubProvider, HuggingFaceProvider,
    NanoBananaProvider, ReplicateProvider.
    """

    @abstractmethod
    async def generate(self, request: TryOnRequest) -> TryOnResult:
        """Run try-on inference and return the result image."""
        ...

    @property
    @abstractmethod
    def name(self) -> str:
        """Human-readable provider identifier."""
        ...

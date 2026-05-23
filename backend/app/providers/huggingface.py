import asyncio
import base64
import os
import tempfile
import time
from pathlib import Path

from gradio_client import Client, handle_file
from loguru import logger

from app.providers.base import TryOnProvider, TryOnRequest, TryOnResult


class HuggingFaceProvider(TryOnProvider):
    """Calls yisol/IDM-VTON on HuggingFace Spaces via gradio_client.

    First call initialises the Gradio client (~5-10s). Subsequent calls reuse
    it. Inference takes 30-60s depending on queue depth.
    """

    def __init__(self, space: str = "yisol/IDM-VTON") -> None:
        self._space = space
        self._client: Client | None = None

    @property
    def name(self) -> str:
        return "huggingface"

    def _get_client(self) -> Client:
        if self._client is None:
            logger.info("Connecting to HuggingFace Space: {}", self._space)
            self._client = Client(self._space)
        return self._client

    def _predict(self, person_path: str, garment_path: str) -> str:
        client = self._get_client()
        raw = client.predict(
            dict={
                "background": handle_file(person_path),
                "layers": [],
                "composite": None,
            },
            garm_img=handle_file(garment_path),
            garment_des="casual t-shirt",
            is_checked=True,
            is_checked_crop=False,
            denoise_steps=30,
            seed=42,
            api_name="/tryon",
        )
        # raw is (result_image_path, masked_image_path)
        return str(raw[0])

    async def generate(self, request: TryOnRequest) -> TryOnResult:
        start = time.monotonic()

        person_tmp = tempfile.NamedTemporaryFile(suffix=".jpg", delete=False)
        garment_tmp = tempfile.NamedTemporaryFile(suffix=".jpg", delete=False)
        try:
            person_tmp.write(request.person_image_bytes)
            person_tmp.flush()
            garment_tmp.write(request.garment_image_bytes)
            garment_tmp.flush()
            person_tmp.close()
            garment_tmp.close()

            logger.info("HuggingFaceProvider: submitting inference request…")
            result_path = await asyncio.wait_for(
                asyncio.to_thread(self._predict, person_tmp.name, garment_tmp.name),
                timeout=180.0,
            )

            image_bytes = Path(result_path).read_bytes()
            suffix = Path(result_path).suffix.lower()
            mime = "image/jpeg" if suffix in (".jpg", ".jpeg") else "image/png"

        except asyncio.TimeoutError as e:
            raise RuntimeError("HuggingFace inference timed out after 180s") from e
        finally:
            os.unlink(person_tmp.name)
            os.unlink(garment_tmp.name)

        latency_ms = int((time.monotonic() - start) * 1000)
        logger.info("HuggingFaceProvider: done in {}ms", latency_ms)

        return TryOnResult(
            image_bytes=image_bytes,
            mime_type=mime,
            provider=self.name,
            latency_ms=latency_ms,
        )

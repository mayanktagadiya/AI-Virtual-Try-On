import json
import re

from loguru import logger

from .predictor import FitPrediction, FitPredictionInput, predict_fit

_VALID_CHEST = {"tight", "standard", "loose"}
_VALID_LENGTH = {"short", "standard", "long"}
_VALID_SLEEVE = {"short", "standard", "long"}

_PROMPT_TEMPLATE = """\
You are a fashion fit expert. Analyse this AI-generated virtual try-on image and the
measurements below to predict how the garment fits.

Person measurements:
- Height: {height_cm} cm
- Weight: {weight_kg} kg
- Body type: {body_type}

Garment measurements:
- Chest: {garment_chest_cm} cm
- Length: {garment_length_cm} cm
- Sleeve: {garment_sleeve_cm} cm

Reply ONLY with a JSON object (no markdown, no extra text):
{{
  "chest_fit": "tight" | "standard" | "loose",
  "length": "short" | "standard" | "long",
  "sleeve": "short" | "standard" | "long",
  "summary": "<one or two sentences of personalized fit advice>"
}}
"""


async def gemini_predict_fit(
    inp: FitPredictionInput,
    result_image_bytes: bytes,
    result_mime: str,
    api_key: str,
) -> FitPrediction:
    """Call Gemini Flash vision to analyse the try-on image and return fit prediction.

    Falls back to rule-based prediction on any error.
    """
    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)
        prompt = _PROMPT_TEMPLATE.format(
            height_cm=inp.height_cm,
            weight_kg=inp.weight_kg,
            body_type=inp.body_type,
            garment_chest_cm=inp.garment_chest_cm,
            garment_length_cm=inp.garment_length_cm,
            garment_sleeve_cm=inp.garment_sleeve_cm,
        )

        response = await client.aio.models.generate_content(
            model="gemini-2.0-flash",
            contents=[
                types.Part.from_bytes(data=result_image_bytes, mime_type=result_mime),
                prompt,
            ],
        )

        text = response.text.strip()
        # Strip ```json ... ``` if model wraps it anyway
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)

        data = json.loads(text)
        chest_fit = data.get("chest_fit", "standard")
        length = data.get("length", "standard")
        sleeve = data.get("sleeve", "standard")
        summary = data.get("summary", "")

        if chest_fit not in _VALID_CHEST:
            chest_fit = "standard"
        if length not in _VALID_LENGTH:
            length = "standard"
        if sleeve not in _VALID_SLEEVE:
            sleeve = "standard"

        logger.info("Gemini fit analysis: chest={} length={} sleeve={}", chest_fit, length, sleeve)
        return FitPrediction(chest_fit=chest_fit, length=length, sleeve=sleeve, summary=summary)

    except Exception as exc:
        logger.warning("Gemini fit analysis failed ({}), falling back to rule-based", exc)
        return predict_fit(inp)

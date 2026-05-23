from dataclasses import dataclass


@dataclass
class FitPredictionInput:
    height_cm: float
    weight_kg: float
    body_type: str
    garment_chest_cm: float = 98.0
    garment_length_cm: float = 70.0
    garment_sleeve_cm: float = 21.0


@dataclass
class FitPrediction:
    chest_fit: str  # tight | standard | loose
    length: str     # short | standard | long
    sleeve: str     # short | standard | long
    summary: str


# Estimated chest circumference multipliers per body type.
# Derived from standard body measurement charts; intentionally simple for MVP.
_CHEST_MULTIPLIERS: dict[str, float] = {
    "slim": 0.50,
    "athletic": 0.54,
    "average": 0.53,
    "heavier": 0.58,
}


def predict_fit(inp: FitPredictionInput) -> FitPrediction:
    multiplier = _CHEST_MULTIPLIERS.get(inp.body_type, 0.53)
    estimated_chest_cm = inp.height_cm * multiplier

    chest_diff = inp.garment_chest_cm - estimated_chest_cm
    if chest_diff < -4:
        chest_fit = "tight"
    elif chest_diff > 8:
        chest_fit = "loose"
    else:
        chest_fit = "standard"

    if inp.height_cm > 185:
        length = "short"
    elif inp.height_cm < 165:
        length = "long"
    else:
        length = "standard"

    if inp.height_cm > 183:
        sleeve = "short"
    elif inp.height_cm < 163:
        sleeve = "long"
    else:
        sleeve = "standard"

    parts: list[str] = []
    parts.append(
        "snug through the chest"
        if chest_fit == "tight"
        else "relaxed through the chest"
        if chest_fit == "loose"
        else "comfortable through the chest"
    )
    if length != "standard":
        parts.append(f"runs {length} in length")
    if sleeve != "standard":
        parts.append(f"{sleeve} sleeves")

    summary = (
        f"This garment should fit {', '.join(parts)} "
        f"for your measurements ({inp.height_cm:.0f} cm, {inp.weight_kg:.0f} kg, {inp.body_type})."
    )

    return FitPrediction(chest_fit=chest_fit, length=length, sleeve=sleeve, summary=summary)

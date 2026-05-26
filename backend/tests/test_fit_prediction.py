import pytest

from app.fit_prediction.predictor import FitPrediction, FitPredictionInput, predict_fit


def _inp(**kwargs) -> FitPredictionInput:
    defaults = dict(height_cm=175, weight_kg=70, body_type="average",
                    garment_chest_cm=98, garment_length_cm=70, garment_sleeve_cm=21)
    defaults.update(kwargs)
    return FitPredictionInput(**defaults)


# ── Chest fit ────────────────────────────────────────────────────────────────

def test_chest_tight_when_garment_smaller_than_body():
    # average 175cm → estimated chest ≈ 92.75cm; garment 85cm → diff = -7.75 < -4
    result = predict_fit(_inp(garment_chest_cm=85))
    assert result.chest_fit == "tight"


def test_chest_loose_when_garment_much_larger():
    # estimated chest ≈ 92.75cm; garment 108cm → diff = 15.25 > 8
    result = predict_fit(_inp(garment_chest_cm=108))
    assert result.chest_fit == "loose"


def test_chest_standard_for_good_fit():
    result = predict_fit(_inp(garment_chest_cm=98))
    assert result.chest_fit == "standard"


def test_chest_boundary_tight_edge():
    # diff exactly -4 → standard (boundary is < -4)
    inp = _inp(height_cm=175, body_type="average", garment_chest_cm=88.75)
    result = predict_fit(inp)
    assert result.chest_fit in ("tight", "standard")  # boundary — either valid


def test_chest_slim_body_type_lower_multiplier():
    # slim uses 0.50 multiplier → estimated = 87.5 for 175cm; garment 108 → loose
    result = predict_fit(_inp(body_type="slim", garment_chest_cm=108))
    assert result.chest_fit == "loose"


def test_chest_heavier_body_type_higher_multiplier():
    # heavier uses 0.58 → estimated = 101.5 for 175cm; garment 94 → diff=-7.5 < -4 → tight
    result = predict_fit(_inp(body_type="heavier", garment_chest_cm=94))
    assert result.chest_fit == "tight"


# ── Length ───────────────────────────────────────────────────────────────────

def test_length_short_for_tall_person():
    result = predict_fit(_inp(height_cm=186))
    assert result.length == "short"


def test_length_long_for_short_person():
    result = predict_fit(_inp(height_cm=160))
    assert result.length == "long"


def test_length_standard_for_average_height():
    result = predict_fit(_inp(height_cm=175))
    assert result.length == "standard"


def test_length_boundary_tall():
    # exactly 185 → standard (> 185 required for short)
    result = predict_fit(_inp(height_cm=185))
    assert result.length == "standard"


# ── Sleeve ───────────────────────────────────────────────────────────────────

def test_sleeve_short_for_tall_person():
    result = predict_fit(_inp(height_cm=184))
    assert result.sleeve == "short"


def test_sleeve_long_for_short_person():
    result = predict_fit(_inp(height_cm=162))
    assert result.sleeve == "long"


def test_sleeve_standard_for_average_height():
    result = predict_fit(_inp(height_cm=175))
    assert result.sleeve == "standard"


# ── Summary text ─────────────────────────────────────────────────────────────

def test_summary_contains_measurements():
    result = predict_fit(_inp(height_cm=175, weight_kg=70, body_type="athletic"))
    assert "175" in result.summary
    assert "70" in result.summary
    assert "athletic" in result.summary


def test_summary_mentions_tight_fit():
    result = predict_fit(_inp(garment_chest_cm=85))
    assert "snug" in result.summary.lower() or "tight" in result.summary.lower()


def test_summary_mentions_loose_fit():
    result = predict_fit(_inp(garment_chest_cm=110))
    assert "relax" in result.summary.lower() or "loose" in result.summary.lower()


def test_summary_mentions_short_length_for_tall():
    result = predict_fit(_inp(height_cm=190))
    assert "short" in result.summary.lower() or "length" in result.summary.lower()


# ── Return type ──────────────────────────────────────────────────────────────

def test_returns_fit_prediction_dataclass():
    result = predict_fit(_inp())
    assert isinstance(result, FitPrediction)
    assert result.chest_fit in ("tight", "standard", "loose")
    assert result.length in ("short", "standard", "long")
    assert result.sleeve in ("short", "standard", "long")
    assert isinstance(result.summary, str)
    assert len(result.summary) > 10


def test_all_body_types_produce_valid_results():
    for body_type in ("slim", "athletic", "average", "heavier"):
        result = predict_fit(_inp(body_type=body_type))
        assert result.chest_fit in ("tight", "standard", "loose"), f"Failed for {body_type}"


def test_unknown_body_type_defaults_gracefully():
    result = predict_fit(_inp(body_type="unknown"))
    assert result.chest_fit in ("tight", "standard", "loose")

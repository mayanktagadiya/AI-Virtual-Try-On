"""Run once from the backend/ directory: uv run python scripts/generate_placeholders.py"""
from pathlib import Path

from PIL import Image, ImageDraw

ITEMS = [
    ("tshirt-001", "Classic White",     (242, 242, 242), (40,  40,  40)),
    ("tshirt-002", "Navy Blue",         (31,  54,  89),  (255, 255, 255)),
    ("tshirt-003", "Graphite",          (72,  72,  72),  (255, 255, 255)),
    ("tshirt-004", "Forest Green",      (34,  85,  50),  (255, 255, 255)),
    ("tshirt-005", "Heather Grey",      (160, 160, 160), (255, 255, 255)),
    ("tshirt-006", "Burgundy",          (120, 0,   32),  (255, 255, 255)),
    ("tshirt-007", "Black",             (18,  18,  18),  (255, 255, 255)),
    ("tshirt-008", "Sky Blue",          (90,  175, 215), (255, 255, 255)),
]

OUT = Path(__file__).parent.parent / "static" / "catalog"
OUT.mkdir(parents=True, exist_ok=True)

W, H = 400, 480

def draw_tshirt(item_id: str, label: str, bg: tuple, fg: tuple) -> None:
    img = Image.new("RGB", (W, H), color=(245, 245, 245))
    d = ImageDraw.Draw(img)

    # ── t-shirt body ────────────────────────────────────────────────────────
    body = [(80, 160), (320, 160), (320, 420), (80, 420)]
    d.polygon(body, fill=bg)

    # ── sleeves ─────────────────────────────────────────────────────────────
    left_sleeve  = [(20, 110), (100, 110), (100, 200), (20, 180)]
    right_sleeve = [(300, 110), (380, 110), (380, 180), (300, 200)]
    d.polygon(left_sleeve,  fill=bg)
    d.polygon(right_sleeve, fill=bg)

    # ── shoulders (connect sleeves to body) ─────────────────────────────────
    d.polygon([(80, 160), (100, 110), (100, 200)], fill=bg)
    d.polygon([(320, 160), (300, 110), (300, 200)], fill=bg)

    # ── collar ──────────────────────────────────────────────────────────────
    d.ellipse([(155, 110), (245, 175)], fill=(245, 245, 245))

    # ── label ───────────────────────────────────────────────────────────────
    d.text((W // 2, 450), label, fill=(100, 100, 100), anchor="mm")

    img.save(OUT / f"{item_id}.png", "PNG")
    print(f"  ok  {item_id}.png")


if __name__ == "__main__":
    print("Generating catalog placeholder images…")
    for args in ITEMS:
        draw_tshirt(*args)
    print(f"Done — {len(ITEMS)} images saved to {OUT}")

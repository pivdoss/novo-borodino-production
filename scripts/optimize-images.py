from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "public" / "images"
FILES = [
    ROOT / "hero-novoe-borodino.png",
    ROOT / "concept-scheme.png",
    ROOT / "location-map-yandex.png",
    *sorted((ROOT / "territory").glob("territory-slide-*.png")),
    *sorted((ROOT / "actual-gallery").glob("actual-*.jpg")),
    ROOT / "actual-gallery" / "actual-05.webp",
    *sorted((ROOT / "renders").glob("*.png")),
]

for source in FILES:
    if not source.exists():
        continue
    target = source.with_suffix(".webp")
    with Image.open(source) as image:
        image = image.convert("RGB")
        if max(image.size) > 2200:
            scale = 2200 / max(image.size)
            image = image.resize((round(image.width * scale), round(image.height * scale)), Image.Resampling.LANCZOS)
        image.save(target, "WEBP", quality=84, method=6)
        print(f"{source.name}: {image.width}x{image.height} -> {target.name} ({target.stat().st_size // 1024} KB)")

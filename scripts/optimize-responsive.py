"""Generate reproducible small image alternatives; originals remain untouched."""
from pathlib import Path
from PIL import Image, ImageOps
import json

root = Path(__file__).resolve().parent.parent
images = root / 'public' / 'images'
output = images / 'responsive'
output.mkdir(exist_ok=True)
files = [images / 'hero-novoe-borodino.webp', images / 'concept-scheme.webp']
for folder in ['territory', 'actual-gallery', 'renders']:
    files += sorted((images / folder).glob('*.webp'))
manifest = {}
for file in files:
    with Image.open(file) as source:
        original = ImageOps.exif_transpose(source).convert('RGB')
        key = file.relative_to(images).with_suffix('').as_posix()
        width, height = original.size
        entry = {'width': width, 'height': height}
        if key != 'concept-scheme':
            target = 'hero-800' if key == 'hero-novoe-borodino' else key.replace('/', '-') + '-800'
            destination = output / (target + '.webp')
            small = original.copy()
            small.thumbnail((800, 1200), Image.Resampling.LANCZOS)
            small.save(destination, 'WEBP', quality=64 if key == 'hero-novoe-borodino' else 79, method=6)
            entry.update({'small': '/images/responsive/' + destination.name, 'smallWidth': small.width})
        manifest[key] = entry
(root / 'src' / 'data' / 'image-manifest.js').write_text('export default ' + json.dumps(manifest, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
print(f'{len(manifest)} images measured; responsive variants: {sum(p.stat().st_size for p in output.glob("*.webp")) / 1024:.0f} KiB')

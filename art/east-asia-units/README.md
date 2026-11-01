# Korean and Japanese units

The eight `game/assets/eastasia-*.png` files are the exact user-supplied RGBA PNGs. No generated replacement, resizing, recoloring or background flattening is applied. `manifest.json` records their supplied names, dimensions, SHA-256 and opaque bounds.

Run `python3 tools/east-asia/measure_unit_art.py` (Pillow) to verify the source hashes and rebuild the offline bounds. `east-asia-units.js` maps those bounds into the original hit/ground lookup. Muzzles are measured in source pixels. Infantry source art faces right; Korean K1 faces right and the other three tanks face left. Facing follows the shared original aim/move hooks. Bodies render through the original rifle/tank code, including 1.4 armor scaling and recoil, not a second custom sprite implementation.

Only Korea/Japan type 0, 1 and 14 use these bodies. Other bodies remain geometric. Shared original effect textures are explicitly loaded and packaged. Japanese conventional tanks bypass Stetopia energy-art and energy-audio routing while retaining standard tank clocks and shared impact layers.

# Korean and Japanese units

The thirteen `game/assets/eastasia-*.png` files are the exact user-supplied RGBA PNGs. No generated replacement, resizing, recoloring or background flattening is applied. `manifest.json` records their supplied names, dimensions, SHA-256 and opaque bounds.

Run `python3 tools/east-asia/measure_unit_art.py` (Pillow) to verify the source hashes and rebuild the offline bounds. `east-asia-units.js` maps those bounds into the original hit/ground lookup. Muzzles are measured in source pixels. Infantry source art faces right; Korean K1 faces right and the other three tanks face left. Facing follows the shared original aim/move hooks. Bodies render through the original rifle/tank code, including 1.4 armor scaling and recoil, not a second custom sprite implementation.

Korea/Japan type 0, 1 and 14, plus Korean type 8, 9 and 10 use these bodies. Other bodies remain geometric. Shared original effect textures are explicitly loaded and packaged. Japanese conventional tanks bypass Stetopia energy-art and energy-audio routing while retaining standard tank clocks and shared impact layers.

## v1.2.1 hull calibration

The four tank PNGs are replaced with the revised user attachments. `hullScanTop` selects an offline alpha scan below the main gun; `hullBounds` measures the actual front and rear of the hull, excluding the barrel and empty canvas. The final hull width is the actual `hexPoints` corner-to-corner width (85⅓ world pixels) plus 8, centered on the tile, so each end extends four pixels past its corner. The original 1.4 armor scale is applied exactly once. The original aspect ratio is retained; opaque tracks share the native y=11 world ground.

`baekTankDrawBox` is shared by image drawing and muzzle calculation. Recoil and mirroring remain the original engine operations. Hit centers exclude the barrel horizontally, and smoke feet use the actual opaque track bottom. No runtime pixel scans are added. `qa/east-asia-unit-art.cjs` measures the real Canvas transforms for every tank/tier/facing and renders `tank-fit.png` over actual hex geometry.

## v1.2.2 Korean support infantry

See [One-click main update and release instructions](../../docs/releases/v1.2.2.md). Grenadiers and antitank squads have separate idle/fire PNGs. The machinegun crew shares one left-facing image for both states. Native infantry hooks own facing, bursts, grenade trajectories, antitank muzzle smoke and audio. Hit/ground lookups use the same offline alpha bounds and mirrored draw boxes as the bodies. No PNG is embedded or re-encoded.

## v1.2.5 Japanese infantry

The manifest now records eighteen original image files (four WebP and fourteen PNG). Japanese type 8/9/10 use the supplied grenade/antitank/machinegun squads. Separate idle/fire dimensions preserve aspect ratio; the left-facing machinegun uses baseFacing -1. Japanese rifle images are replaced byte-for-byte. All seven attachments are copied directly, without Base64 or image re-encoding.

## v1.2.7 Chinese infantry

Chinese type 0/8/9/10 use the seven exact transparent WebP attachments supplied by the user: rifle idle/fire (`1000068832.webp`, `1000068848.webp`), grenadier idle/fire (`1000068840.webp`, `1000068846.webp`), heavy machinegun crew (`1000068845.webp`), and antitank idle/fire (`1000068844.webp`, `1000068847.webp`). Files are copied byte-for-byte with no re-encoding. The manifest records the attachment names and SHA-256 hashes. Profiles preserve the source aspect ratio and right-facing baseline, with firing muzzle coordinates measured on the supplied art. The original renderer owns rifle flashes, grenade/rocket smoke, machinegun bursts and audio.

## v1.2.8 North Korean infantry

Faction 3 uses the seven exact uploaded WebP files `1000068855.webp` through `1000068861.webp`, recorded with SHA-256 and offline alpha bounds in the manifest. Rifle, grenadier and antitank have separate idle/fire poses; the heavy machinegun crew shares one file. All source images face left (`baseFacing: -1`); measured firing muzzle pixels use that same unmirrored source coordinate system. The original infantry renderer and audio/effect hooks own aim, mirrored drawing, rifle flashes, grenade arcs, rocket smoke and machinegun bursts. Type IDs 0/8/9/10 and existing save data remain stable.

## v1.2.9 Korean support infantry replacement

Korean type 8/9/10 now use five byte-exact uploaded WebP files: grenadier idle/fire (`1000068873.webp`, `1000068872.webp`), antitank idle/fire (`1000068871.webp`, `1000068870.webp`), and machinegun (`1000068874.webp`). Superseded Korean support PNGs are removed. Rifle art remains unchanged. The offline manifest and firing muzzle calibration match the replacement images; native facing, recoil, effect, audio, hit and ground paths remain in use.

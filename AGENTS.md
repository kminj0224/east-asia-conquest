# East Asia Conquest

- Standalone derivative of kminj0224/terha-conquest at 4c968ba6d5d8a0397038de58612548341df48f8d (v1.11.94).
- Game engine and UI live under game/assets. Keep bootstrap.js last and east-asia.js immediately before it.
- Preserve the independent Android application ID com.eastasia.conquest, launcher name 동아시아 콘퀘스트, save namespace eastasia-* and stable unit IDs.
- Map land budget is exactly 3672. Coordinates and city lists are in data/. Regenerate with python3 tools/east-asia/generate_map.py and node tools/east-asia/render_assets.cjs (requires shapely and @napi-rs/canvas).
- Forest=2, mountain=3, river=4; rivers remain land and are impassable to naval units. River crossing uses infantry cost 2 / armor cost 3 except city crossings; aircraft/helicopters ignore terrain.
- All countries begin neutral. No country-exclusive special unit may spawn, be produced, or enter AI procurement.
- Use original terrain/ocean materials and UI. Units and cities use the actual pre-image Terha soldiers/vehicles/buildings, never letters inside symbols.
- Follow art/README.md for the natural map. Neutral pigment atlas, smoothed SDF coast, original foam shader, connected-scenery, semantic ownership runs, 48 JPEG94 regions and 80MiB visible-region LRU are mandatory. Never draw a permanent hex grid or geography-name labels.
- Exact pxy uses column parity: x=(col+2/3)*64, y=(row+.5+.5*(col&1))*55.43. Never use row-offset pointy hexes.
- All 3672 land cells remain registered to the original hexPoints geometry. Run tools/east-asia/export_geography.cjs, tools/bake-aligned-map.cjs and tools/build-map-lods.cjs after map generation.
- Focus crop is 116–146E / 21–46N. Six selectable nations; city separation is at least two hex steps. Manchurian plains must not be a random forest carpet.
- Run python3 tools/prepare_operation_music.py, npm test, python3 qa/verify-native.py, python3 build.py and python3 qa/east-asia-apk.py before release.
- Do not commit deliverables/, android/build/, node_modules/, .python-deps/ or QA screenshots.

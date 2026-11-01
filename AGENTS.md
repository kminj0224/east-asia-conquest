# East Asia Conquest

- Standalone derivative of kminj0224/terha-conquest at 4c968ba6d5d8a0397038de58612548341df48f8d (v1.11.94).
- Game engine and UI live under game/assets. Keep bootstrap.js last and east-asia.js immediately before it.
- Preserve the independent Android application ID com.eastasia.conquest, launcher name 동아시아 콘퀘스트, save namespace eastasia-* and stable unit IDs.
- Map land budget is exactly 3672. Coordinates and city lists are in data/. Regenerate with python3 tools/east-asia/generate_map.py and node tools/east-asia/render_assets.cjs (requires shapely and @napi-rs/canvas).
- Forest=2, mountain=3, river=4; rivers remain land and are impassable to naval units. River crossing uses infantry cost 2 / armor cost 3 except city crossings; aircraft/helicopters ignore terrain.
- All countries begin neutral. No country-exclusive special unit may spawn, be produced, or enter AI procurement.
- Use original terrain/ocean materials and UI. Units and cities use geometric markers.
- Run python3 tools/prepare_operation_music.py, npm test, python3 qa/verify-native.py, python3 build.py and python3 qa/east-asia-apk.py before release.
- Do not commit deliverables/, android/build/, node_modules/, .python-deps/ or QA screenshots.

# Modern illustrated cities, direction 1

Five shared city bodies (levels 1–5) and six capital bodies use three original transparent PNG atlases generated with the built-in image tool. The original PNG files are copied unchanged into game/assets; no PNG is Base64-encoded, embedded in JavaScript, resized, recolored or re-encoded.

The capital bodies are dense level-five modern high-rise clusters plus a landmark: Seoul / Gwanghwamun, Beijing / Forbidden City, Tokyo / Tokyo Tower, Pyongyang / Juche Tower, Taipei / Taipei 101, Vladivostok / Golden Bridge. Vladivostok is the existing scenario capital. Capital artwork is fixed independently of mechanical city level. Founding origin chooses its landmark, current ownership chooses the original game ownership indicators.

`manifest.json` records full-file SHA-256, dimensions, atlas selection regions, alpha>=32 bounds and world draw widths. `tools/east-asia/verify_city_art.py` checks both original bytes and the generated metadata. Canvas uses source rectangles directly; there is no pixel readback or dynamic atlas processing in the game.

All bodies share a ground anchor at y=10. Common-city widths are 54/62/72/84/96 world pixels, capitals 104. Aspect ratio is preserved. Existing city names, durability, queues, facilities, city selection, damage flames, upgrade costs and save data are unchanged. Roof stars use the actual illustrated body bounds. If an atlas is not loaded the original geometric city remains the fallback.

The generation prompts use the approved direction-1 preview as the style reference: detailed hand-painted semi-realistic 2D architecture, warm gray concrete, muted teal glass, olive trees, isometric 3/4 camera and upper-left light. The common-city sheet progresses from low-rise town to dense modern skyline. The two capital sheets explicitly require L5 high-rise buildings to dominate every cluster and put one symbolic landmark in the foreground. Refinement requests restore complete roof tips and isolate the capital clusters on transparent backgrounds. The final chosen common-city sheet is the initial generation, and the capital sheets are the refined generations.

Runtime hooks live in east-asia-cities.js and are installed by east-asia.js immediately before bootstrap. Terrain renderer hashes are unchanged. `qa/east-asia-city-art.cjs` exercises 60 country/level/capital combinations, native damage/facility/fallback paths and produces inspection images through the real game renderer.

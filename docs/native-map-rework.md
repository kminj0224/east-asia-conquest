# v1.1.0 native map rework

The v1.0.0 custom row-offset hex painter is removed. Its geometry did not match the engine's column-offset hex grid, its colored base bypassed neutral pigment ownership composition, and its full world redraw bypassed the established viewport cache.

This edition uses the original Terha map production path documented in art/README.md: signed-distance coast, terrain-materials pigment atlas, connected-scenery mountain/forest compositions, original river sampler and land-water-materials shader, per-object anchor ownership RLE, 48 1254px JPEG94 regions, derived mid/overview LODs, original natural-detail.js and static-ground.js.

The focus crop removes most Russia and inland western China. Korean land increases from 50 to 151 cells, Japanese land from 171 to 587 cells. Taiwan receives 87 cells to fit all 22 administrative centres with a minimum two-step separation. Total land remains 3672. All selectable countries are the six originally requested countries; optional Mongolia/Vietnam are outside this crop.

The default map has no hex outlines, no tile fills and no mountain/river text stamps. Selection and movement overlays retain the original engine's exact hexPoints geometry. Ownership colors use the original color composite, including scenery overhang ownership, with muted green/red/gray/yellow/blue/teal national pigments.

Units use rifleSprite (captured before the image modules), which draws the original soldiers, vehicle hulls/wheels/turrets/barrels, guns, planes and ships. Cities use cityArtSprite/cityArtBuildingLayout captured before image city assets. Image-based unit/city loaders remain disabled. World terrain and UI loaders remain enabled.

Runtime stationary terrain is cached by camera/ownership/detail revision. Only visible natural-detail regions decode; LRU remains 80 MiB. No pixel scanning occurs during drawing. Geographic layout, action hex alignment, ownership changes, cache reuse, city spacing, soldiers/vehicle drawing and frame timing are checked before release.

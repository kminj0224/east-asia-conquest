#!/usr/bin/env python3
"""Offline opaque bounds for the eight original user PNGs; no runtime readback."""
import json,pathlib,hashlib
from PIL import Image
root=pathlib.Path(__file__).resolve().parents[2]
manifest=json.loads((root/'art/east-asia-units/manifest.json').read_text())
for row in manifest.values():
 p=root/'game/assets'/row['file'];im=Image.open(p)
 assert hashlib.sha256(p.read_bytes()).hexdigest()==row['sha256']
 assert im.size==(row['width'],row['height'])
 alpha=im.getchannel('A').point(lambda v:255 if v>=32 else 0)
 row['opaqueBounds']=alpha.getbbox()
 if 'hullScanTop' in row:
  top=row['hullScanTop'];b=alpha.crop((0,top,im.width,im.height)).getbbox()
  measured=[b[0],b[1]+top,b[2],b[3]+top]
  assert row['hullBounds']==measured
  row['hullBounds']=measured
(root/'game/assets/east-asia-unit-bounds.js').write_text('// Offline alpha>=32 bounds measured from the original uploaded PNGs.\nconst EAST_ASIA_UNIT_BOUNDS='+json.dumps(manifest,separators=(',',':'))+';\n')

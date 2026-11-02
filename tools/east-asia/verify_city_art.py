#!/usr/bin/env python3
"""Verify original generated city PNG bytes and offline atlas regions, without editing pixels."""
import hashlib,json,pathlib
from PIL import Image
root=pathlib.Path(__file__).resolve().parents[2]
m=json.loads((root/'art/east-asia-cities/manifest.json').read_text())
for row in m['files'].values():
 p=root/'game/assets'/row['file'];im=Image.open(p)
 assert hashlib.sha256(p.read_bytes()).hexdigest()==row['sha256'],p
 assert im.size==(row['width'],row['height']) and im.mode=='RGBA'
 assert im.getchannel('A').getextrema()[0]==0,'true transparent background'
for key,row in m['sprites'].items():
 im=Image.open(root/'game/assets'/m['files'][row['atlas']]['file'])
 l,t,r,b=row['region'];alpha=im.getchannel('A').crop((l,t,r,b))
 bounds=alpha.point(lambda v:255 if v>=32 else 0).getbbox();x0,y0,x1,y1=bounds
 assert row['crop']==[l+x0,t+y0,x1-x0,y1-y0],key
 assert row['crop'][2]>0 and row['crop'][3]>0
 assert 0<=l<r<=im.width and 0<=t<b<=im.height
expected="'use strict';\n// Offline atlas regions; original generated PNG bytes are stored as files.\nconst EAST_ASIA_CITY_DATA="+json.dumps(m,ensure_ascii=False,separators=(',',':'))+';\n'
assert (root/'game/assets/east-asia-city-data.js').read_text()==expected
print('PASS original transparent city PNG hashes, eleven offline regions and exact runtime metadata')

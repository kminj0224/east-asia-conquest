import pathlib,zipfile,struct,hashlib
root=pathlib.Path(__file__).resolve().parents[1]
p=root/'deliverables/East-Asia-Conquest-v1.2.13.apk'
with zipfile.ZipFile(p) as z:
 assert z.testzip() is None
 b=z.read('AndroidManifest.xml');strings=[];off=8
 while off<len(b):
  k,h,s=struct.unpack_from('<HHI',b,off)
  if k==1:
   count,styles,flags,start,style_start=struct.unpack_from('<IIIII',b,off+8)
   for i in range(count):
    p0=off+start+struct.unpack_from('<I',b,off+h+4*i)[0];n=struct.unpack_from('<H',b,p0)[0];strings.append(b[p0+2:p0+2+2*n].decode('utf-16le'))
  elif k==0x102:
   start,asize,count=struct.unpack_from('<HHH',b,off+24)
   for j in range(count):
    pos=off+16+start+j*asize;name=struct.unpack_from('<I',b,pos+4)[0]
    if strings[name]=='versionCode':assert struct.unpack_from('<I',b,pos+16)[0]==18
  off+=s
 assert __import__('json').loads((root/'package.json').read_text())['version']=='1.2.13'
 for s in ['com.eastasia.conquest','com.terha.conquest.MainActivity','동아시아 콘퀘스트','1.2.13']:assert s in strings,s
 assert 'com.terha.conquest' not in strings
 for name in ['eastasia-gardara-flag.jpg','gardara-rifle-idle.png','gardara-rifle-fire.png','gardara-grenadier-idle.png','gardara-grenadier-fire.png','gardara-antitank-idle.png','gardara-antitank-fire.png','gardara-machinegun.png','gardara-tank.png','gardara-elite.png','gardara-artillery.png','gardara-artillery-fire.png','index.html','east-asia-diplomacy.js','eastasia-goryeo-flag.png','east-asia-artillery.js','east-asia-forces.js','east-asia.js','east-asia-units.js','east-asia-unit-bounds.js','east-asia-city-data.js','east-asia-cities.js','tank-art.js','mapdata.js','world-natural.png','natural-detail-5-3.jpg','natural-ownership-data.js','world-clean.png','flag-0.png','flag-4.png']:
  assert z.read('assets/'+name)==(root/'game/assets'/name).read_bytes(),name
 for name in ['eastasia-kr-tank.png','eastasia-kr-elite.png','eastasia-kr-rifle-idle.png','eastasia-kr-rifle-fire.png','eastasia-jp-tank.png','eastasia-jp-elite.png','eastasia-jp-rifle-idle.png','eastasia-jp-rifle-fire.png','battlefield-effects.webp','combat-projectiles.webp','smoke-flow.webp','dirt-sequence.webp','explosion-sequence.webp']:
  assert z.read('assets/'+name)==(root/'game/assets'/name).read_bytes(),name
 for row in __import__('json').loads((root/'art/east-asia-units/manifest.json').read_text()).values():
  assert z.read('assets/'+row['file'])==(root/'game/assets'/row['file']).read_bytes(),row['file']
 for row in __import__('json').loads((root/'art/east-asia-cities/manifest.json').read_text())['files'].values():
  assert z.read('assets/'+row['file'])==(root/'game/assets'/row['file']).read_bytes(),row['file']

 row=__import__('json').loads((root/'art/east-asia-unification.json').read_text())
 assert hashlib.sha256(z.read('assets/'+row['file'])).hexdigest()==row['sha256']
 assert 'assets/dante-city-atlas.webp' not in z.namelist()
 assert z.read('classes.dex')==zipfile.ZipFile(root/'android/native-shell.zip').read('classes.dex')
 print('PASS independent app identity, original native DEX, exact geography/terrain/script assets, all manifest PNG/WebP assets and original combat textures; unused national/city atlases excluded')
(root/'deliverables/SHA256SUMS.txt').write_text(hashlib.sha256(p.read_bytes()).hexdigest()+'  '+p.name+'\n')

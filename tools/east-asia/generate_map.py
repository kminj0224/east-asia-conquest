"""Reproducible East Asia hex scenario; Natural Earth coastline, original land budget."""
import json,math,pathlib,collections
from shapely.geometry import shape,Point,box,LineString
from shapely.prepared import prep
ROOT=pathlib.Path(__file__).resolve().parents[2]; A=ROOT/'game/assets'
NAMES=['South Korea','China','Japan','North Korea','Taiwan','Russia','Mongolia','Vietnam']
COLORS=['#26944c','#d63232','#92989e','#e8c83e','#286cda','#53aabf','#b88d58','#9b6bac']
B=(105.,20.,147.,54.); W,H=86,80; TARGET=3672
features=json.loads((ROOT/'data/countries.geojson').read_text())['features']
geos=[next(shape(f['geometry']) for f in features if f['properties']['name']==n) for n in NAMES]; prepared=[prep(g) for g in geos]
def loc(i):
 x,y=i%W,i//W
 return (B[0]+(x+.5*(y%2))/(W-1)*(B[2]-B[0]),B[3]-y/(H-1)*(B[3]-B[1]))
def closest(lon,lat,used=set(),owner=None):
 pool=[i for i in range(W*H) if i not in used and (owner is None or tiles[i][0] in [-1,owner])]
 return min(pool,key=lambda i:((loc(i)[0]-lon)*.78)**2+(loc(i)[1]-lat)**2)
tiles=[]
for i in range(W*H):
 p=Point(*loc(i)); f=next((f for f,g in enumerate(prepared) if g.contains(p)),-1)
 lon,lat=loc(i); seed=(i*1103515245+12345)&0x7fffffff
 mountain=(f in [0,3] and lon>127 and seed%4!=0) or (f==2 and seed%3!=0) or (f==4 and lon>121) or (f in [5,6] and seed%4==0) or (f==1 and (lon<112 or 113<lon<117 and lat>35 or lat>40 and lon>126) and seed%3!=0)
 terrain=0 if f<0 else 3 if mountain else 2 if seed%5<2 and lat>24 else 1
 tiles.append([f,terrain])
# Islands are strategic hexes at their own geographic coordinates, never city labels on water.
pins={}; used=set(); countries={}; raw=json.loads((ROOT/'data/cities.json').read_text())
for f,rows in enumerate(raw):
 countries[str(f)]=[]
 for n,(name,lon,lat) in enumerate(rows):
  if not B[0]<=lon<=B[2] or not B[1]<=lat<=B[3]:continue
  i=closest(lon,lat,used,f);used.add(i);pins[i]=f;tiles[i]=[f,1]
  countries[str(f)].append(dict(tile=i,name=name,level=5 if n==0 else 3 if n<6 else 2,capital=n==0,lon=lon,lat=lat,airport=n==0))
# Named geography replaces the coarse biome seed; rivers use the same paths for art and rules.
features=json.loads((ROOT/'data/terrain-features.json').read_text())
river_source=json.loads((ROOT/'data/rivers.geojson').read_text())['features'] if (ROOT/'data/rivers.geojson').exists() else []
river_names={'한강':['Han','Namhan'],'낙동강':['Nakdong'],'압록강':['Yalu'],'두만강':['Tumen'],'황허':['Huang'],'창장':['Chang Jiang','Yangtze'],'주강':['Xi','Pearl'],'쑹화강':['Songhua',"Di’er Songhua"],'랴오허':['Liao'],'아무르강':['Amur','Heilong Jiang'],'우수리강':['Ussuri'],'도네강':['Tone'],'이시카리강':['Ishikari'],'훙강':['Hong']}
for river in features['rivers']:
 guide=LineString(river['points']);paths=[]
 for item in river_source:
  if item['properties'].get('name') not in river_names.get(river['name'],[]):continue
  geom=shape(item['geometry']).intersection(box(*B))
  if geom.is_empty or geom.distance(guide)>.8:continue
  pieces=[geom] if geom.geom_type=='LineString' else list(geom.geoms) if hasattr(geom,'geoms') else []
  for piece in pieces:
   if piece.geom_type=='LineString' and piece.length>.05:paths.append([list(c) for c in piece.simplify(.025).coords])
 river['paths']=paths or [river['points']]
river_shapes=[(r,LineString(path)) for r in features['rivers'] for path in r['paths']]
mountain_shapes=[(m,Point(*m['point']) if 'point' in m else LineString(m['points'])) for m in features['mountains']]
for i,(f,t) in enumerate(tiles):
 if f<0:continue
 lon,lat=loc(i);p=Point(lon,lat)
 # Woodlands: Korea/Japan's hills, NE China, Russian taiga; open steppe / plains remain open.
 forest=(f in [0,2,3] and i%5<3) or (f==5 and i%5<4) or (f==1 and ((lat>43 and lon>120) or (lat<28 and lon<118)) and i%4<3) or (f==7 and i%3!=0)
 tiles[i][1]=2 if forest else 1
 for m,geom in mountain_shapes:
  if 'point' not in m and geom.distance(p)<=m.get('width',.3):
   if i not in used:tiles[i][1]=3
 for river,line in river_shapes:
  if line.distance(p)<.24:tiles[i][1]=4;break
for feature in features['mountains']:
 if 'point' in feature:
  lon,lat=feature['point'];candidates=[i for i,t in enumerate(tiles) if t[0]>=0 and i not in used]
  i=min(candidates,key=lambda i:((loc(i)[0]-lon)*.78)**2+(loc(i)[1]-lat)**2)
  tiles[i][1]=3;feature['tile']=i;used.add(i)
# Force a connected chain of river cells even at this strategy-map scale.
for river,line in river_shapes:
 for n in range(max(2,int(line.length/.1))):
  p=line.interpolate(n/max(1,int(line.length/.1)-1),normalized=True)
  yy=round((B[3]-p.y)/(B[3]-B[1])*(H-1));xx=round((p.x-B[0])/(B[2]-B[0])*(W-1)-.5*(yy%2));i=max(0,min(W*H-1,yy*W+xx))
  if tiles[i][0]>=0:tiles[i][1]=4
# Named peaks have precedence over a neighboring river cell.
for m in features['mountains']:
 if 'tile' in m:tiles[m['tile']][1]=3
lake_water=set()
for lake in features.get('lakes',[]):
 lon,lat=lake['point']
 ids=[i for i in range(W*H) if ((loc(i)[0]-lon)/lake['rx'])**2+((loc(i)[1]-lat)/lake['ry'])**2<=1]
 if not ids:ids=[closest(lon,lat)]
 for i in ids:
  if i not in used:tiles[i]=[-1,0];lake_water.add(i)
# Match the source's 3,561 core + 111 extension land cells exactly. Coast-only correction.
count=sum(f>=0 for f,t in tiles); candidates=[]
for i,(f,t) in enumerate(tiles):
 if i in used or i in lake_water:continue
 p=Point(*loc(i))
 if f>=0:candidates.append((geos[f].boundary.distance(p),i,f))
 else:
  d,k=min((g.distance(p),f) for f,g in enumerate(geos));candidates.append((d,i,k))
if count>TARGET:
 for d,i,f in sorted(candidates):
  if tiles[i][0]>=0:tiles[i]=[-1,0];count-=1
  if count==TARGET:break
else:
 for d,i,f in sorted(candidates):
  if tiles[i][0]<0:tiles[i]=[f,1];count+=1
  if count==TARGET:break
m=dict(w=W,h=H,tiles=tiles,countryCities=countries,extraTiles=[],geographySchema=1,eastAsiaSchema=1,features=features,bounds=B,sourceLandTiles=TARGET)
(A/'mapdata.js').write_text('const MAP='+json.dumps(m,ensure_ascii=False,separators=(',',':'))+';\n')
# Runtime shell adds surrounding ocean. Ground-support arrays are derived from the same geometry.
(A/'city-ground.js').write_text("'use strict';\nconst CITY_GROUND_CENTER=tiles.map(t=>t.owner>=0?1:0),CITY_GROUND_SUPPORT=tiles.map(t=>t.owner>=0?100:0);\n")
(A/'east-asia-map.json').write_text(json.dumps(m,ensure_ascii=False,separators=(',',':')))
report=dict(width=W,height=H,landTiles=count,sourceLandTiles=TARGET,countries={NAMES[f]:dict(land=sum(t[0]==f for t in tiles),cities=len(countries[str(f)])) for f in range(8)},cities=sum(map(len,countries.values())),bounds=B,coastline='Natural Earth / datasets geo-countries',islands=['제주','울릉도','독도','쓰시마','사도','펑후·마궁','진먼','마쭈·난간'])
report['namedMountains']=len(features['mountains']);report['namedRivers']=len(features['rivers']);report['terrainTiles']=dict(collections.Counter(t for f,t in tiles if f>=0));
(ROOT/'docs/map-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False,indent=2))

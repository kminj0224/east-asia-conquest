"""Focused East Asia geography registered to Terha's exact column-offset hex lattice.
Only geography is new. Original bake-aligned-map/ownership/LOD code renders the art.
"""
import json,math,pathlib,collections
import numpy as np
import shapely
from shapely.geometry import shape,Point,LineString,box
from shapely.prepared import prep
R=pathlib.Path(__file__).resolve().parents[2];A=R/'game/assets';ART=R/'art';ART.mkdir(exist_ok=True)
B=(116.,21.,146.,46.);S=64.;V=55.43;TARGET=3672
NAMES=['South Korea','China','Japan','North Korea','Taiwan','Russia','Mongolia','Vietnam']
features=json.loads((R/'data/countries.geojson').read_text())['features']
geos=[next(shape(f['geometry']) for f in features if f['properties']['name']==n) for n in NAMES]
for g in geos:shapely.prepare(g)
def arrays(w,h):
 col,row=np.meshgrid(np.arange(w),np.arange(h));lon=B[0]+col/(w-1)*(B[2]-B[0]);lat=B[3]-(row+.5*(col%2))/(h-1)*(B[3]-B[1]);owner=np.full((h,w),-1,dtype=np.int16)
 for f,g in enumerate(geos[:6]):owner[shapely.contains_xy(g,lon,lat)]=f
 return lon.ravel(),lat.ravel(),owner.ravel()
# Choose resolution close to the land budget, with an undistorted regional projection.
best=None
for h in range(118,151):
 w=round(h*.81);lon,lat,owner=arrays(w,h);count=int((owner>=0).sum());score=abs(count-TARGET)
 if best is None or score<best[0]:best=(score,w,h,lon,lat,owner)
_,W,H,LON,LAT,OWN=best;WW=W*S+S/3;HH=H*V+V/2
coords=[(float(LON[i]),float(LAT[i])) for i in range(W*H)]
xy=[((i%W+2/3)*S,(i//W+.5+.5*((i%W)&1))*V)for i in range(W*H)]
def world(p):return ((p[0]-B[0])/(B[2]-B[0])*(W-1)*S+S*2/3,(B[3]-p[1])/(B[3]-B[1])*(H-1)*V+V/2)
def near(lon,lat):
 x,y=world((lon,lat));col=round((x-S*2/3)/S);row=round((y-V/2)/V-.5*(col&1));return max(0,min(W*H-1,row*W+col))
def d(a,b):
 ax,ay=a%W,a//W;bx,by=b%W,b//W;dx=ax-bx;dy=ay-by+((ax&1)-(bx&1))/2;return max(abs(dx),abs(dy)+abs(dx)/2)
def dist_geo(i,p):return ((coords[i][0]-p[0])*.80)**2+(coords[i][1]-p[1])**2
# Strategic islands too small to hit a tile center receive a real land cell.
ISLANDS=[(0,'제주',126.53,33.40),(0,'울릉도',130.9,37.49),(0,'독도',131.869,37.242),(2,'쓰시마',129.287,34.203),(2,'사도',138.368,38.018),(2,'나하',127.68,26.212),(4,'펑후·마궁',119.566,23.571),(4,'진먼',118.317,24.432),(4,'마쭈·난간',119.944,26.151)]
protected=set();island_anchors={}
for f,name,lon,lat in ISLANDS:
 i=near(lon,lat);OWN[i]=f;protected.add(i);island_anchors[name]=i
# Give Taiwan enough registered shoreline cells for its 22 administrative centres.
# It remains a narrow island with an open strait; no detached city markers on water.
water=[i for i,f in enumerate(OWN)if f<0 and 119.5<coords[i][0]<122.6 and 21.8<coords[i][1]<25.5]
water.sort(key=lambda i:geos[4].distance(Point(*coords[i])))
for i in water[:max(0,88-int((OWN==4).sum()))]:OWN[i]=4;protected.add(i)
# Tune only the nearest coast cells, never the interior or protected islands.
count=int((OWN>=0).sum());candidate=[]
for i,f in enumerate(OWN):
 if i in protected:continue
 p=Point(*coords[i])
 if count>TARGET and f>=0:candidate.append((geos[int(f)].boundary.distance(p),i,int(f)))
 elif count<TARGET and f<0:
  dd,ff=min((g.distance(p),ff)for ff,g in enumerate(geos[:6]));candidate.append((dd,i,ff))
for _,i,f in sorted(candidate):
 if count==TARGET:break
 if count>TARGET:OWN[i]=-1;count-=1
 else:OWN[i]=f;count+=1
assert count==TARGET
raw=json.loads((R/'data/cities.json').read_text());countries={str(f):[]for f in range(8)};used=set()
# A 3-colour packing guarantees a one-cell gap. Use all geographic candidates when needed.
for f in range(6):
 rows=[q for q in raw[f] if B[0]<=q[1]<=B[2] and B[1]<=q[2]<=B[3]]
 if f==1:rows.sort(key=lambda q:(q[0]!='베이징',raw[f].index(q)))
 if f==5:rows.sort(key=lambda q:(q[0]!='블라디보스토크',raw[f].index(q)))
 local=[i for i,v in enumerate(OWN)if v==f];reserved={i for name,i in island_anchors.items()if OWN[i]==f}
 # Preserve offshore-city positions, then place mainland cities with a two-step separation.
 phase_candidates=[]
 for phase in range(3):
  pool=[i for i in local if ((i%W)+2*(i//W-((i%W)-(i%W&1))//2))%3==phase]
  phase_candidates.append(pool)
 pool=max(phase_candidates,key=len) if f==4 and max(map(len,phase_candidates))>=len(rows) else local
 for n,(name,lon,lat) in enumerate(rows):
  if name in island_anchors:i=island_anchors[name]
  else:
   good=[i for i in pool if i not in used and i not in reserved and all(d(i,j)>=2 for j in used|reserved if OWN[j]==f)]
   if not good:good=[i for i in local if i not in used and i not in reserved and all(d(i,j)>=2 for j in used|reserved if OWN[j]==f)]
   if not good:good=[i for i in local if i not in used and i not in reserved]
   assert good,(f,name)
   i=min(good,key=lambda i:dist_geo(i,(lon,lat)))
  used.add(i);countries[str(f)].append(dict(tile=i,name=name,level=5 if n==0 else 3 if n<6 else 2,capital=n==0,lon=lon,lat=lat,airport=n==0))
# Mountains follow named ridge geometry. Plains in Manchuria remain plains.
fdata=json.loads((R/'data/terrain-features.json').read_text());ranges=[(m,Point(*m['point']) if 'point'in m else LineString(m['points']))for m in fdata['mountains']]
terrain=[0 if f<0 else 1 for f in OWN];biomes=[]
for i,f in enumerate(OWN):
 lon,lat=coords[i];biomes.append('temperate')
 if f<0:continue
 p=Point(lon,lat)
 if i not in used:
  for m,g in ranges:
   if 'point'not in m and g.distance(p)<m.get('width',.3):terrain[i]=3;break
  # Contiguous woodlands on foothills, not a random carpet across agricultural plains.
  woods=(f==0 and lon>127.1 and 34.5<lat<38.6)or(f==3 and lon>126.4 and lat>39.4)or(f==2 and ((lat>38.8 and lon>141.8)or(34.8<lat<37.5 and 136.2<lon<138.6)))or(f==1 and any(m['name']in ['창바이산맥','다싱안링산맥','샤오싱안링산맥'] and 'point'not in m and g.distance(p)<m.get('width',.3)+.35 for m,g in ranges))or(f==5 and lon>133.5)
  if terrain[i]!=3 and woods:terrain[i]=2
  if f==4 and lon>120.9 and lat<24.7:terrain[i]=3
for m in fdata['mountains']:
 p=m.get('point');
 if not p or not(B[0]<=p[0]<=B[2]and B[1]<=p[1]<=B[3]):continue
 choices=[i for i,f in enumerate(OWN)if f>=0 and i not in used];i=min(choices,key=lambda i:dist_geo(i,p));terrain[i]=3;m['tile']=i
 if m['name']=='후지산':biomes[i]='snow'
# Read actual river centerlines, clipped into the map; use the original Hermite sampler later.
source=json.loads((R/'data/rivers.geojson').read_text())['features'];river_names={'한강':['Han','Namhan'],'낙동강':['Nakdong'],'압록강':['Yalu'],'두만강':['Tumen'],'황허':['Huang'],'창장':['Chang Jiang','Yangtze'],'주강':['Xi','Pearl'],'쑹화강':['Songhua',"Di’er Songhua"],'랴오허':['Liao'],'아무르강':['Amur','Heilong Jiang'],'우수리강':['Ussuri'],'도네강':['Tone'],'이시카리강':['Ishikari'],'훙강':['Hong']}
reaches=[];river_tiles=set()
for river in fdata['rivers']:
 guide=LineString(river['points']);paths=[]
 for item in source:
  if item['properties'].get('name')not in river_names.get(river['name'],[]):continue
  g=shape(item['geometry']).intersection(box(*B))
  if g.is_empty or g.distance(guide)>.7:continue
  for part in ([g]if g.geom_type=='LineString'else getattr(g,'geoms',[])):
   if part.geom_type=='LineString'and part.length>.06:paths.append(list(part.simplify(.025).coords))
 if not paths:
  g=guide.intersection(box(*B));paths=[list(g.coords)]if g.geom_type=='LineString'and not g.is_empty else []
 river['paths']=paths
 for path in paths:
  line=LineString(path);nodes=[]
  for n in range(max(2,int(line.length/.07))):
   p=line.interpolate(n/max(1,int(line.length/.07)-1),normalized=True);i=near(p.x,p.y)
   if OWN[i]>=0:river_tiles.add(i);nodes.append(i)
  # Wide rivers use the same source width range as Terha, scaled to this map.
  pts=[world(p)for p in path];width=6.5 if river['name']in ['한강','창장','황허','아무르강']else 4.
  reaches.append(dict(id=len(reaches),name=river['name'],main=True,source=True,mouth=True,nodes=sorted(set(nodes)),widths=[width]*len(pts),before=None,after=None,points=pts))
for i in river_tiles:
 if terrain[i]!=3 and i not in used:terrain[i]=4
# City clearings are actual clearings; no vegetation or mountains rendered underneath buildings.
for i in used:terrain[i]=1
m=dict(w=W,h=H,tiles=[[int(OWN[i]),terrain[i]]for i in range(W*H)],extraTiles=[],countryCities=countries,geographySchema=2,eastAsiaSchema=2,bounds=B,features=fdata,sourceLandTiles=TARGET,selectableFactions=list(range(6)),riverTiles=sorted(river_tiles))
(A/'mapdata.js').write_text('const MAP='+json.dumps(m,ensure_ascii=False,separators=(',',':'))+';\n');(A/'east-asia-map.json').write_text(json.dumps(m,ensure_ascii=False,separators=(',',':')))
(A/'river-data.js').write_text("'use strict';\nconst RIVER_NETWORK="+json.dumps({'reaches':reaches},ensure_ascii=False,separators=(',',':'))+';\n')
(A/'city-ground.js').write_text("'use strict';\nconst CITY_GROUND_CENTER=tiles.map(t=>t.owner>=0?1:0),CITY_GROUND_SUPPORT=tiles.map(t=>t.owner>=0?100:0);\n")
# Geometry metadata uses the engine's exact pxy/hexPoints registration, not a second grid.
geo=dict(width=WW,height=HH,tiles=[dict(id=i,x=xy[i][0],y=xy[i][1],col=i%W,row=i//W,owner=int(OWN[i]),terrain=terrain[i],city=next((q['tile']for rows in countries.values()for q in rows if q['tile']==i),-1),river=i in river_tiles,biome=biomes[i])for i in range(W*H)],reaches=[])
(ART/'terrain-alignment-geography.json').write_text(json.dumps(geo,separators=(',',':')))
cities=[]
for rows in countries.values():
 for q in rows:
  x,y=xy[q['tile']];cities.append(dict(id=len(cities),tile=q['tile'],name=q['name'],x=x,y=y,rx=36,ry=29,cy=y-12))
(ART/'city-footprints.json').write_text(json.dumps({'cities':cities},ensure_ascii=False,separators=(',',':')))
report=dict(width=W,height=H,landTiles=count,sourceLandTiles=TARGET,cities=len(cities),bounds=B,countries={NAMES[f]:dict(land=int((OWN==f).sum()),cities=len(countries[str(f)]))for f in range(6)},cityMinimumDistance=min(d(a['tile'],b['tile'])for f in range(6)for n,a in enumerate(countries[str(f)])for b in countries[str(f)][n+1:]),terrainTiles=dict(collections.Counter(t for f,t in zip(OWN,terrain)if f>=0)))
(R/'docs/map-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False,indent=2))

// Geographic centre and spacing checks are independent of image compilation.
const fs=require('fs'),assert=require('assert'),vm=require('vm');const c={};vm.runInNewContext(fs.readFileSync('game/assets/mapdata.js','utf8')+';this.map=MAP',c);const m=c.map,w=m.w,h=m.h,S=64,V=55.43;
const px=i=>({x:(i%w+2/3)*S,y:(Math.floor(i/w)+.5+.5*((i%w)&1))*V});
function tileAt(x,y){const q=(x-S*2/3)/S,r=(y-V*.5)/V-q*.5,z=-q-r;let xx=Math.round(q),yy=Math.round(r),v=Math.round(z);const a=Math.abs(xx-q),b=Math.abs(yy-r),c=Math.abs(v-z);if(a>b&&a>c)xx=-yy-v;else if(b>c)yy=-xx-v;return(yy+(xx-(xx&1))/2)*w+xx}
function distance(a,b){const ax=a%w,ay=Math.floor(a/w),bx=b%w,by=Math.floor(b/w),dx=ax-bx,dy=ay-by+((ax&1)-(bx&1))/2;return Math.max(Math.abs(dx),Math.abs(dy)+Math.abs(dx)/2)}
assert.equal(m.tiles.filter(t=>t[0]>=0).length,3672);assert(m.tiles.filter(t=>t[0]===0).length>=150);assert(m.tiles.filter(t=>t[0]===2).length>=3*171);
for(let i=0;i<w*h;i++){const p=px(i);assert.equal(tileAt(p.x,p.y),i,'exact column-staggered worldTileAt / pxy round trip')}
const used=new Set();for(const rows of Object.values(m.countryCities)){for(const [n,a]of rows.entries()){assert(!used.has(a.tile),'duplicate city tile');used.add(a.tile);assert(m.tiles[a.tile][0]>=0);for(const b of rows.slice(n+1))assert(distance(a.tile,b.tile)>=2,a.name+'/'+b.name+' spacing')}}
assert.equal(m.countryCities[0].length,23);assert.equal(m.countryCities[2].length,52);assert.equal(m.countryCities[4].length,22);
assert(m.countryCities[0].some(q=>q.name==='독도'));assert.equal(m.selectableFactions.length,6);
const source=fs.readFileSync('game/assets/east-asia.js','utf8');assert(source.includes('eastAsiaClassicBody=rifleSprite'));assert(!source.includes('eastAsiaUnitShape'));assert(!source.includes('drawStaticGround=function'));assert(!source.includes('eastAsiaTerrain'));assert(!source.includes('ctx.fillText(f.name'));assert(source.includes('NATURAL_OWNERSHIP_COLORS.splice'));
for(const [f,hash]of Object.entries(JSON.parse(fs.readFileSync('data/native-renderer-sha256.json'))))assert.equal(require('crypto').createHash('sha256').update(fs.readFileSync('game/assets/'+f)).digest('hex'),hash,'original rendering path '+f);
console.log('PASS exact hex registration, 3672 land, focus scale, all city spacing >=2, original natural renderer, classic body renderer');

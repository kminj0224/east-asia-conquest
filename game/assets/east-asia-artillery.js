'use strict';
// Byte-exact uploaded bodies. Measure tracks offline, never during a frame.
const EAST_ASIA_SP={
 0:{source:'kr-sp',muzzle:[115,57]},
 1:{source:'cn-sp',muzzle:[112,64]},
 2:{source:'jp-sp',muzzle:[99,56]}
};
for(const a of Object.values(EAST_ASIA_SP))a.art=loadBaekArt(EAST_ASIA_UNIT_BOUNDS[a.source+'-idle'].file,EAST_ASIA_UNIT_BOUNDS[a.source+'-fire'].file);
function eastAsiaSP(u){return u.type===2?EAST_ASIA_SP[u.f]:null}
const eastAsiaPreviousArtilleryProfile=baekArtilleryProfile;
baekArtilleryProfile=function(u,firing=false){
 const a=eastAsiaSP(u);if(!a)return eastAsiaPreviousArtilleryProfile(u,firing);
 const b=EAST_ASIA_UNIT_BOUNDS[a.source+(firing?'-fire':'-idle')];
 return{art:a.art,w:b.width,h:b.height,mx:a.muzzle[0],my:a.muzzle[1],baseFacing:-1,flashAngle:.45};
};
const eastAsiaPreviousArtilleryBox=baekArtilleryBox;
baekArtilleryBox=function(u,firing=false){
 const a=eastAsiaSP(u);if(!a)return eastAsiaPreviousArtilleryBox(u,firing);
 const b=EAST_ASIA_UNIT_BOUNDS[a.source+(firing?'-fire':'-idle')],track=b.hullBounds;
 const scale=64/(track[2]-track[0]);
 // Each pose has the SAME track width, center and bottom in world coordinates.
 return{x:-(track[0]+track[2])/2*scale,y:14-track[3]*scale,w:b.width*scale,h:b.height*scale,bottom:14,crop:[0,0,b.width,b.height]};
};
for(const f of [0,1,2]){
 const hits=[],feet=[],a=EAST_ASIA_SP[f],idle=EAST_ASIA_UNIT_BOUNDS[a.source+'-idle'];
 for(const firing of [false,true])for(let direction=0;direction<16;direction++){
  const u={f,type:2},b=EAST_ASIA_UNIT_BOUNDS[a.source+(firing?'-fire':'-idle')],box=baekArtilleryBox(u,firing),scale=unitBodyVisualScale(u);
  const roof=idle.opaqueBounds[1]+b.hullBounds[3]-idle.hullBounds[3];
  hits.push([0,11+(box.y+(roof+b.hullBounds[3])/2/b.height*box.h-14)*scale]);
  feet.push(11);
 }
 HIT_CENTER_DATA[f+':2']=Array.from({length:4},()=>hits);
 IMPACT_GROUND_DATA[f+':2']=Array.from({length:4},()=>feet);
}
Object.assign(window.Terha,{eastAsiaSP,baekArtilleryProfile,baekArtilleryBox});

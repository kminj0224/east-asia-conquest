'use strict';
// User-supplied national bodies; the original rifle/tank renderer owns motion,
// recoil, mirrored flashes, projectiles, impact layers and clocked PCM audio.
const eastAsiaRifleArt={
 0:loadBaekArt('eastasia-kr-rifle-idle.png','eastasia-kr-rifle-fire.png'),
 2:loadBaekArt('eastasia-jp-rifle-idle.png','eastasia-jp-rifle-fire.png')
};
const EAST_ASIA_RIFLES={
 0:{art:eastAsiaRifleArt[0],baseFacing:1,width:64,height:48,highResolution:true,muzzles:rightInfantryMuzzles([[559,294],[1041,188],[1438,294]],1448,1086)},
 2:{art:eastAsiaRifleArt[2],baseFacing:1,width:48*1491/1024,idleWidth:64,height:48,highResolution:true,muzzles:rightInfantryMuzzles([[546,277],[1017,157],[1476,279]],1491,1024,48*1491/1024,48)}
};
infantryArtProfile=function(u){return u.type===0?EAST_ASIA_RIFLES[u.f]||null:null};
const eastAsiaTankArt={
 '0:1':loadBaekArt('eastasia-kr-tank.png'),
 '0:14':loadBaekArt('eastasia-kr-elite.png'),
 '2:1':loadBaekArt('eastasia-jp-tank.png'),
 '2:14':loadBaekArt('eastasia-jp-elite.png')
};
const EAST_ASIA_TANKS={
 '0:1':{w:2078,h:732,mx:2060,my:226,baseFacing:1},
 '0:14':{w:1942,h:724,mx:5,my:289,baseFacing:-1},
 '2:1':{w:2094,h:751,mx:18,my:253,baseFacing:-1},
 '2:14':{w:2172,h:724,mx:10,my:259,baseFacing:-1}
};
function eastAsiaUnitHasArt(u){return !!(u.type===0&&EAST_ASIA_RIFLES[u.f]||EAST_ASIA_TANKS[u.f+':'+u.type])}
isBaekTank=function(u){return !!EAST_ASIA_TANKS[u.f+':'+u.type]};
// Japan is a conventional cannon tank, not Stetopia's fictional energy tank.
isStetopiaTank=function(){return false};
baekTankProfile=function(u){const key=u.f+':'+u.type,a=EAST_ASIA_TANKS[key],art=eastAsiaTankArt[key];return{...a,art,image:art.idle,flip:baekTankFacing(u)!==a.baseFacing}};
const eastAsiaWeaponSound=combatWeaponProfile,eastAsiaImpactSound=combatImpactProfile;
combatWeaponProfile=function(u){return eastAsiaWeaponSound(u.f===2&&[1,13,14].includes(u.type)?{...u,f:0}:u)};
combatImpactProfile=function(u){return eastAsiaImpactSound(u.f===2&&[1,13,14].includes(u.type)?{...u,f:0}:u)};
Object.assign(window.Terha,{infantryArtProfile,isBaekTank,isStetopiaTank,baekTankProfile,combatWeaponProfile,combatImpactProfile});
// Compile the original hit/ground lookup layout from offline opaque bounds.
// Every formation tier shares the same anchored art, as in Terha.
for(const f of [0,2])for(const type of [0,1,14]){
 const key=f+':'+type,hits=[],feet=[];
 for(const firing of [false,true])for(let direction=0;direction<16;direction++){
  const facing=Math.cos(direction*Math.PI/8)<0?-1:1;
  const name=(f===0?'kr':'jp')+'-'+(type===0?'rifle-'+(firing?'fire':'idle'):type===1?'tank':'elite');
  const source=EAST_ASIA_UNIT_BOUNDS[name],b=source.opaqueBounds;
  let w,h,scale,flip,bottom=14;
  if(type===0){const p=EAST_ASIA_RIFLES[f];w=!firing&&p.idleWidth||p.width;h=p.height;scale=1;flip=facing!==1}
  else{w=64;h=w*source.height/source.width;scale=HEAVY_UNIT_VISUAL_SCALE;flip=facing!==EAST_ASIA_TANKS[key].baseFacing}
  const x=((b[0]+b[2])/2/source.width-.5)*w*(flip?-1:1)*scale;
  const y=-3+bottom+(-h+(b[1]+b[3])/2/source.height*h)*scale;
  hits.push([x,y]);feet.push(-3+bottom+(-h+b[3]/source.height*h)*scale);
 }
 HIT_CENTER_DATA[key]=Array.from({length:4},()=>hits);
 IMPACT_GROUND_DATA[key]=Array.from({length:4},()=>feet);
}

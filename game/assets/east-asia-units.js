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
const eastAsiaSupportArt={
 8:loadBaekArt('eastasia-kr-grenadier-idle.png','eastasia-kr-grenadier-fire.png'),
 9:loadBaekArt('eastasia-kr-antitank-idle.png','eastasia-kr-antitank-fire.png'),
 10:loadBaekArt('eastasia-kr-machinegun.png')
};
const EAST_ASIA_SUPPORT={
 8:{art:eastAsiaSupportArt[8],source:'kr-grenadier',baseFacing:1,width:64,height:48,highResolution:true,muzzles:rightInfantryMuzzles([[507,193],[1026,57],[1399,186]],1448,1086),projectile:'baekGrenade',flashAngle:.4},
 9:{art:eastAsiaSupportArt[9],source:'kr-antitank',baseFacing:1,width:64,height:48,highResolution:true,muzzles:rightInfantryMuzzles([[506,281],[1004,153],[1422,281]],1448,1086),projectile:'baekRocket'},
 10:{art:eastAsiaSupportArt[10],source:'kr-machinegun',baseFacing:-1,width:64,height:48,highResolution:true,muzzles:baekMuzzles([[20,398]]),burst:true}
};
infantryArtProfile=function(u){return u.type===0?EAST_ASIA_RIFLES[u.f]||null:u.f===0?EAST_ASIA_SUPPORT[u.type]||null:null};
const eastAsiaTankArt={
 '0:1':loadBaekArt('eastasia-kr-tank.png'),
 '0:14':loadBaekArt('eastasia-kr-elite.png'),
 '2:1':loadBaekArt('eastasia-jp-tank.png'),
 '2:14':loadBaekArt('eastasia-jp-elite.png')
};
// Actual hex corner-to-corner width plus four world pixels at each hull end.
// Divide out the native 1.4 armor scale, so it is applied exactly once.
const EAST_ASIA_HULL_WIDTH=S*4/3+8;
const EAST_ASIA_TANKS={
 '0:1':{source:'kr-tank',mx:2151,my:224,baseFacing:1},
 '0:14':{source:'kr-elite',mx:8,my:282,baseFacing:-1},
 '2:1':{source:'jp-tank',mx:17,my:128,baseFacing:-1},
 '2:14':{source:'jp-elite',mx:14,my:326,baseFacing:-1}
};
for(const a of Object.values(EAST_ASIA_TANKS)){
 const source=EAST_ASIA_UNIT_BOUNDS[a.source],hull=source.hullBounds;
 a.w=source.width;a.h=source.height;
 a.drawWidth=EAST_ASIA_HULL_WIDTH/HEAVY_UNIT_VISUAL_SCALE*a.w/(hull[2]-hull[0]);
 a.drawX=-(hull[0]+hull[2])/2/a.w*a.drawWidth;
 a.yOffset=(a.h-source.opaqueBounds[3])/a.w*a.drawWidth;
 a.shadowWidth=EAST_ASIA_HULL_WIDTH*.45;
}
function eastAsiaUnitHasArt(u){return !!(infantryArtProfile(u)||EAST_ASIA_TANKS[u.f+':'+u.type])}
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
for(const f of [0,2])for(const type of (f===0?[0,1,8,9,10,14]:[0,1,14])){
 const key=f+':'+type,hits=[],feet=[];
 for(const firing of [false,true])for(let direction=0;direction<16;direction++){
  const facing=Math.cos(direction*Math.PI/8)<0?-1:1;
  const profile=infantryArtProfile({f,type});
  const name=profile&&type!==0?profile.source+(type===10?'':'-'+(firing?'fire':'idle')):(f===0?'kr':'jp')+'-'+(type===0?'rifle-'+(firing?'fire':'idle'):type===1?'tank':'elite');
  const source=EAST_ASIA_UNIT_BOUNDS[name],opaque=source.opaqueBounds;
  let b=opaque,w,h,scale,flip,box;
  if(profile){const p=profile;w=!firing&&p.idleWidth||p.width;h=p.height;scale=1;flip=facing!==(p.baseFacing??-1);box={x:-w/2,y:infantryArtBottom(p,firing)-h}}
  else{
   const a=EAST_ASIA_TANKS[key];box=baekTankDrawBox(a);w=box.w;h=box.h;
   scale=HEAVY_UNIT_VISUAL_SCALE;flip=facing!==a.baseFacing;
   // Center impacts over the hull rather than the protruding barrel.
   b=[source.hullBounds[0],opaque[1],source.hullBounds[2],opaque[3]];
  }
  const x=(box.x+(b[0]+b[2])/2/source.width*w)*(flip?-1:1)*scale;
  const y=-3+14+(box.y-14+(b[1]+b[3])/2/source.height*h)*scale;
  hits.push([x,y]);feet.push(-3+14+(box.y-14+opaque[3]/source.height*h)*scale);
 }
 HIT_CENTER_DATA[key]=Array.from({length:4},()=>hits);
 IMPACT_GROUND_DATA[key]=Array.from({length:4},()=>feet);
}

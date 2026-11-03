'use strict';
// User-supplied national bodies; the original rifle/tank renderer owns motion,
// recoil, mirrored flashes, projectiles, impact layers and clocked PCM audio.
const eastAsiaRifleArt={
 0:loadBaekArt('eastasia-kr-rifle-idle.png','eastasia-kr-rifle-fire.png'),
 1:loadBaekArt('eastasia-cn-rifle-idle.webp','eastasia-cn-rifle-fire.webp'),
 2:loadBaekArt('eastasia-jp-rifle-idle.png','eastasia-jp-rifle-fire.png')
};
const EAST_ASIA_CN_MUZZLE_PIXELS={0:[[592,315],[1065,164],[1446,315]],8:[[588,276],[989,96],[1408,275]],9:[[628,326],[1051,149],[1435,328]],10:[[1431,441]]};
function chineseInfantryProfile(type,art,source){
 const fire=EAST_ASIA_UNIT_BOUNDS[source+(type===10?'':'-fire')],idle=EAST_ASIA_UNIT_BOUNDS[source+(type===10?'':'-idle')];
 const width=48*fire.width/fire.height;
 return{art,source,baseFacing:1,width,idleWidth:48*idle.width/idle.height,height:48,highResolution:true,muzzles:rightInfantryMuzzles(EAST_ASIA_CN_MUZZLE_PIXELS[type],fire.width,fire.height,width,48),...(type===8?{projectile:'baekGrenade',flashAngle:.4}:type===9?{projectile:'baekRocket'}:type===10?{burst:true}:{})};
}
const EAST_ASIA_RIFLES={
 1:chineseInfantryProfile(0,eastAsiaRifleArt[1],'cn-rifle'),
 0:{art:eastAsiaRifleArt[0],baseFacing:1,width:64,height:48,highResolution:true,muzzles:rightInfantryMuzzles([[559,294],[1041,188],[1438,294]],1448,1086)},
 2:{art:eastAsiaRifleArt[2],baseFacing:1,width:48*1491/1024,idleWidth:64,height:48,highResolution:true,muzzles:rightInfantryMuzzles([[546,277],[1017,157],[1476,279]],1491,1024,48*1491/1024,48)}
};
const eastAsiaSupportArt={
 8:loadBaekArt('eastasia-kr-grenadier-idle.webp','eastasia-kr-grenadier-fire.webp'),
 9:loadBaekArt('eastasia-kr-antitank-idle.webp','eastasia-kr-antitank-fire.webp'),
 10:loadBaekArt('eastasia-kr-machinegun.webp')
};
const EAST_ASIA_SUPPORT={
 8:{art:eastAsiaSupportArt[8],source:'kr-grenadier',baseFacing:1,width:64,height:48,highResolution:true,muzzles:rightInfantryMuzzles([[519,235],[1041,107],[1388,236]],1448,1086),projectile:'baekGrenade',flashAngle:.4},
 9:{art:eastAsiaSupportArt[9],source:'kr-antitank',baseFacing:1,width:64,height:48,highResolution:true,muzzles:rightInfantryMuzzles([[502,290],[998,161],[1404,292]],1448,1086),projectile:'baekRocket'},
 10:{art:eastAsiaSupportArt[10],source:'kr-machinegun',baseFacing:-1,width:64,height:48,highResolution:true,muzzles:[[32,400]].map(([x,y])=>({x:(x/1448-.5)*64,y:14-48+y/1086*48})),burst:true}
};
const eastAsiaJapaneseSupportArt={
 8:loadBaekArt('eastasia-jp-grenadier-idle.webp','eastasia-jp-grenadier-fire.webp'),
 9:loadBaekArt('eastasia-jp-antitank-idle.webp','eastasia-jp-antitank-fire.webp'),
 10:loadBaekArt('eastasia-jp-machinegun.png')
};
const EAST_ASIA_JAPANESE_SUPPORT={
 8:{art:eastAsiaJapaneseSupportArt[8],source:'jp-grenadier',baseFacing:1,width:48*1446/1086,idleWidth:64,height:48,highResolution:true,muzzles:rightInfantryMuzzles([[543,238],[1019,102],[1408,251]],1446,1086,48*1446/1086,48),projectile:'baekGrenade',flashAngle:.4},
 9:{art:eastAsiaJapaneseSupportArt[9],source:'jp-antitank',baseFacing:1,width:48*1446/1086,idleWidth:64,height:48,highResolution:true,muzzles:rightInfantryMuzzles([[538,278],[1001,164],[1427,285]],1446,1086,48*1446/1086,48),projectile:'baekRocket'},
 10:{art:eastAsiaJapaneseSupportArt[10],source:'jp-machinegun',baseFacing:-1,width:48*1446/1086,height:48,highResolution:true,muzzles:[[26,405]].map(([x,y])=>({x:(x/1446-.5)*48*1446/1086,y:14-48+y/1086*48})),burst:true}
};
const eastAsiaChineseSupportArt={
 8:loadBaekArt('eastasia-cn-grenadier-idle.webp','eastasia-cn-grenadier-fire.webp'),
 9:loadBaekArt('eastasia-cn-antitank-idle.webp','eastasia-cn-antitank-fire.webp'),
 10:loadBaekArt('eastasia-cn-machinegun.webp')
};
const EAST_ASIA_CHINESE_SUPPORT={};
for(const [type,name] of [[8,'grenadier'],[9,'antitank'],[10,'machinegun']])EAST_ASIA_CHINESE_SUPPORT[type]=chineseInfantryProfile(type,eastAsiaChineseSupportArt[type],'cn-'+name);
// North Korean source art faces left. Preserve source bytes and native mirroring.
const EAST_ASIA_NK_MUZZLE_PIXELS={0:[[21,346],[430,222],[836,378]],8:[[42,106],[467,52],[926,106]],9:[[28,315],[424,202],[905,315]],10:[[24,405]]};
const EAST_ASIA_NORTH_KOREAN_INFANTRY={};
for(const [type,name] of [[0,'rifle'],[8,'grenadier'],[9,'antitank'],[10,'machinegun']]){
 const source='nk-'+name,fire=EAST_ASIA_UNIT_BOUNDS[source+(type===10?'':'-fire')],idle=EAST_ASIA_UNIT_BOUNDS[source+(type===10?'':'-idle')];
 const width=48*fire.width/fire.height;
 EAST_ASIA_NORTH_KOREAN_INFANTRY[type]={art:loadBaekArt(idle.file,fire.file),source,baseFacing:-1,width,idleWidth:48*idle.width/idle.height,height:48,highResolution:true,muzzles:EAST_ASIA_NK_MUZZLE_PIXELS[type].map(([x,y])=>({x:(x/fire.width-.5)*width,y:14-48+y/fire.height*48})),...(type===8?{projectile:'baekGrenade',flashAngle:.65}:type===9?{projectile:'baekRocket'}:type===10?{burst:true}:{})};
}
infantryArtProfile=function(u){return u.f===3?EAST_ASIA_NORTH_KOREAN_INFANTRY[u.type]||null:u.type===0?EAST_ASIA_RIFLES[u.f]||null:(u.f===0?EAST_ASIA_SUPPORT:u.f===1?EAST_ASIA_CHINESE_SUPPORT:u.f===2?EAST_ASIA_JAPANESE_SUPPORT:{})[u.type]||null};
const eastAsiaTankArt={
 '0:1':loadBaekArt('eastasia-kr-tank.png'),
 '0:14':loadBaekArt('eastasia-kr-elite.png'),
 '2:1':loadBaekArt('eastasia-jp-tank.png'),
 '2:14':loadBaekArt('eastasia-jp-elite.png'),
 '1:1':loadBaekArt('eastasia-cn-tank.webp'),
 '1:14':loadBaekArt('eastasia-cn-elite.webp'),
 '3:1':loadBaekArt('eastasia-nk-tank.webp'),
 '3:14':loadBaekArt('eastasia-nk-elite.webp')
};
// Actual hex corner-to-corner width plus four world pixels at each hull end.
// Divide out the native 1.4 armor scale, so it is applied exactly once.
const EAST_ASIA_HULL_WIDTH=S*4/3+8;
const EAST_ASIA_TANKS={
 '0:1':{source:'kr-tank',mx:2151,my:224,baseFacing:1},
 '0:14':{source:'kr-elite',mx:8,my:282,baseFacing:-1},
 '2:1':{source:'jp-tank',mx:17,my:128,baseFacing:-1},
 '2:14':{source:'jp-elite',mx:14,my:326,baseFacing:-1},
 '1:1':{source:'cn-tank',mx:25,my:281,baseFacing:-1},
 '1:14':{source:'cn-elite',mx:15,my:293,baseFacing:-1},
 '3:1':{source:'nk-tank',mx:36,my:275,baseFacing:-1},
 '3:14':{source:'nk-elite',mx:19,my:287,baseFacing:-1}
};
for(const [key,a] of Object.entries(EAST_ASIA_TANKS)){
 const [f,type]=key.split(':').map(Number);
 const source=EAST_ASIA_UNIT_BOUNDS[a.source],hull=source.hullBounds;
 a.w=source.width;a.h=source.height;
 a.drawWidth=EAST_ASIA_HULL_WIDTH/HEAVY_UNIT_VISUAL_SCALE*a.w/(hull[2]-hull[0]);
 a.drawX=-(hull[0]+hull[2])/2/a.w*a.drawWidth;
 a.yOffset=(a.h-source.opaqueBounds[3])/a.w*a.drawWidth;
 a.shadowWidth=EAST_ASIA_HULL_WIDTH*tankVisualMultiplier({f,type})*.45;
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
for(const f of [0,1,2,3])for(const type of [0,1,8,9,10,14]){
 const key=f+':'+type,hits=[],feet=[];
 for(const firing of [false,true])for(let direction=0;direction<16;direction++){
  const facing=Math.cos(direction*Math.PI/8)<0?-1:1;
  const profile=infantryArtProfile({f,type});
  const name=profile?(profile.source?profile.source+(type===10?'':'-'+(firing?'fire':'idle')):(f===0?'kr':'jp')+'-rifle-'+(firing?'fire':'idle')):EAST_ASIA_TANKS[key].source;
  const source=EAST_ASIA_UNIT_BOUNDS[name],opaque=source.opaqueBounds;
  let b=opaque,w,h,scale,flip,box;
  if(profile){const p=profile;w=!firing&&p.idleWidth||p.width;h=p.height;scale=1;flip=facing!==(p.baseFacing??-1);box={x:-w/2,y:infantryArtBottom(p,firing)-h}}
  else{
   const a=EAST_ASIA_TANKS[key];box=baekTankDrawBox(a);w=box.w;h=box.h;
   scale=unitBodyVisualScale({f,type});flip=facing!==a.baseFacing;
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
// The classic (non-PNG) tank bodies use the same fixed ground pivot at y=11.
// Bring their premeasured impact-ground tables along with the enlarged bodies.
for(let f=0;f<factions.length;f++)for(const type of [1,13,14]){
 if(EAST_ASIA_TANKS[f+':'+type])continue;
 const key=f+':'+type,m=tankVisualMultiplier({f,type});
 if(IMPACT_GROUND_DATA[key])IMPACT_GROUND_DATA[key]=IMPACT_GROUND_DATA[key].map(tier=>tier.map(y=>11+(y-11)*m));
 if(HIT_CENTER_DATA[key])HIT_CENTER_DATA[key]=HIT_CENTER_DATA[key].map(tier=>tier.map(([x,y])=>[x*m,11+(y-11)*m]));
}

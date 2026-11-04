'use strict';
// Scenario data and geometric markers over the unmodified shared conquest rules.
const EAST_ASIA_SCHEMA=2;
const eastAsiaBonuses=['보병 방어 +15%','기갑 공격 +20%','기갑 방어 +15%','도시 수입 +15%','이동 거리 +1','해군 공격 +15%','포병 공격 +15%','균형 전력'];
factions.forEach((f,i)=>{f.bonus=eastAsiaBonuses[i];delete f.initialBranches;delete f.initialDefenses});
initialDiplomacy=eastAsiaInitialDiplomacy;
diplomacy=initialDiplomacy();
// Keep stable engine type IDs while making all country-exclusive types unavailable everywhere.
for(const t of TYPES)if(t.special!==undefined)t.special=-99;
// Retire the light-tank slot without shifting every saved unit type ID.
Object.assign(TYPES[13],{special:-99,retired:true,name:"",text:""});
ARMOR.splice(0,ARMOR.length,...ARMOR.filter(k=>k!==13));
const eastAsiaCanProduce=canProduce;
canProduce=function(q,k,level=1){return TYPES[k]?.special===undefined&&eastAsiaCanProduce(q,k,level)};
const eastAsiaMakeUnit=makeUnit;
makeUnit=function(f,type,tile,level=1){return eastAsiaMakeUnit(f,type===13?1:TYPES[type]?.special!==undefined?0:type,tile,level)};
// Remove only the original world's scenario placements. Normal turn, logistics and combat stay shared.
for(const name of ['adjustCityRoster','adjustCityPlacement','applyBaekCityNames','renameCities','reinforceDante','addBaekWesternFleet','seedDanteExpansion','seedRannaGuerrillas','seedFrontlineReinforcements','seedStetopiaSouthCoast','halveSouthernDanteFleet','applyMariaSea','applyHansaIsland','applyHansaBridgeTerrain','relocateHansaDeckShips']){
 if(typeof window[name]==='function')window[name]=()=>false;
}
createHansaBridges=()=>[];isHansaSupplyCity=()=>false;hansaBridgeConnected=()=>true;
// The unmodified Terha natural map renderer owns terrain, ownership and screen caches.
addAmbientScene=()=>{};
installEastAsiaCityArt();
// rifleSprite is the exact pre-image renderer: soldiers, barrels, wheels, wings and hulls.
const eastAsiaClassicBody=rifleSprite;
const eastAsiaIllustratedBody=sprite;
const eastAsiaNativeHitCenter=unitHitCenter;
sprite=function(u,p,now){
 const previous=unitNameBeingDrawn;unitNameBeingDrawn=u;
 try{return (eastAsiaUnitHasArt(u)?eastAsiaIllustratedBody:eastAsiaClassicBody)(u,p,now)}finally{unitNameBeingDrawn=previous}
};
unitHitCenter=(u,now=performance.now())=>{if(eastAsiaUnitHasArt(u)){const hit=eastAsiaNativeHitCenter(u,now);if(isBaekTank(u))hit.x+=baekTankRecoil(u,now)*unitBodyVisualScale(u);return hit;}const p=unitVisualPosition(u,now);return{x:p.x,y:p.y+11-23*tankVisualMultiplier(u)}};
// Independent save identity, with original slots / snapshots and restoration rules.
const eastAsiaSetup=setup;
setup=function(...args){const result=eastAsiaSetup(...args);for(const q of cities){const seed=MAP.countryCities[q.origin].find(v=>v.tile===q.tile);if(seed)q.name=seed.name}eastAsiaRetireLightTanks();units=units.filter(u=>TYPES[u.type].special===undefined);for(const f of [6,7])defeatedNotices.add(f);diplomacy=initialDiplomacy();buildRegions();eastAsiaStartingForces();save();updateHUD();return result};
// Every flag is an actual national flag in all retained menus and scene markers.
for(let f=0;f<factions.length;f++){const im=new Image();im.src='flag-'+f+'.png';flagImages[f]=im}
Object.assign(window.Terha,{setup,initialDiplomacy,canProduce,makeUnit,unitHitCenter,eastAsiaSchema:EAST_ASIA_SCHEMA});
// Muted national pigments use the same source color composite as Terha.
const eastAsiaPigments=['#739b7b','#aa7871','#999f9f','#b6a66e','#7b9eb2','#7ca5a5','#aa967a','#a58eae'];
eastAsiaPigments.forEach((color,f)=>{factions[f].color=color;factions[f].dark='#455653';factions[f].accent='#d5ded0'});
NATURAL_OWNERSHIP_COLORS.splice(0,NATURAL_OWNERSHIP_COLORS.length,...eastAsiaPigments);
['서울','베이징','도쿄','평양','타이베이','블라디보스토크','울란바토르','하노이'].forEach((capital,f)=>factions[f].capital=capital);
// River cells are land with a crossing cost, not navigable ocean. Bridges at city cells
// retain normal city movement; mountain cells keep the original mountain cost.
const eastAsiaMoveCost=moveCost;
moveCost=function(u,i){const value=eastAsiaMoveCost(u,i);if(value>=999||isAircraft(u)||isHelicopter(u)||isNaval(u))return value;return tiles[i]?.terrain===4&&tiles[i].city<0?Math.max(value,TYPES[u.type].branch==='armor'?3:2):value};
for(const t of tiles)t.river=t.terrain===4;
// Geographic names stay in scenario data; terrain has no text stamps.
function eastAsiaGeoPoint([lon,lat]){const b=MAP.bounds;return{x:(lon-b[0])/(b[2]-b[0])*(W-1)*S+S*2/3,y:(b[3]-lat)/(b[3]-b[1])*(H-1)*V+V/2}}
Object.assign(window.Terha,{moveCost,eastAsiaGeoPoint});
RANNA_RIVER_TILES.clear();for(const i of MAP.riverTiles)RANNA_RIVER_TILES.add(i);

// Saved campaigns keep their current armies; only the removed type is migrated.
const eastAsiaMigrateArmy=migrateArmy;
migrateArmy=function(s){for(const q of s.cities)if(q.queue?.type===13)q.queue.type=1;const result=eastAsiaMigrateArmy(s);eastAsiaRetireLightTanks();return result};
Object.assign(window.Terha,{migrateArmy});

installEastAsiaDiplomacy();

// Conquest variants share geography, stable country/type IDs and the save archive.
const EAST_ASIA_VERSIONS={normal:'노멀',menremoi:'멘레모이 혁명','blue-plum-2':'푸른 오얏꽃2'};
const EAST_ASIA_GARDARA_COLOR='#80a9bb'; // Most frequent blue pixel in Terha's original flag.
const eastAsiaOriginalSelectable=[...MAP.selectableFactions];
const eastAsiaOriginalNorth={...factions[3]};
const eastAsiaNorthFlag=flagImages[3],eastAsiaGardaraFlag=new Image();
eastAsiaGardaraFlag.src='eastasia-gardara-flag.jpg';
function eastAsiaVersionLabel(id){return EAST_ASIA_VERSIONS[id]||EAST_ASIA_VERSIONS.normal}
function eastAsiaSavedNation(s){
 const version=s.eastAsiaVersion||'normal';
 if(version==='menremoi'&&s.player===3)return '가르다라';
 if(s.player===0)return version==='blue-plum-2'?'대한조선국':s.eastAsiaDiplomacyState?.unified?'고려연방':eastAsiaBaseKoreanName;
 return s.player===3?eastAsiaOriginalNorth.name:factions[s.player].name;
}
function eastAsiaSelectVersion(id){
 eastAsiaVersion=Object.hasOwn(EAST_ASIA_VERSIONS,id)?id:'normal';
 Object.assign(factions[3],eastAsiaOriginalNorth);
 flagImages[3]=eastAsiaNorthFlag;
 if(eastAsiaVersion==='menremoi'){
  Object.assign(factions[3],{name:'가르다라',desc:'가르다라',color:EAST_ASIA_GARDARA_COLOR});
  flagImages[3]=eastAsiaGardaraFlag;
 }
 NATURAL_OWNERSHIP_COLORS[3]=factions[3].color;
 MAP.selectableFactions=eastAsiaOriginalSelectable.filter(f=>eastAsiaVersion!=='blue-plum-2'||f!==3);
 if(!MAP.selectableFactions.includes(player))player=0;
 eastAsiaApplyIdentity();territoryDirty=true;
}
function showEastAsiaVersions(){
 if(busy)return;
 setAppScreen('versions');
 $('modal').innerHTML='<div class="box"><div class="eyebrow">EAST ASIA CONQUEST</div><h1 class="menuTitle">정복</h1><div class="modeButtons">'+Object.entries(EAST_ASIA_VERSIONS).map(([id,label])=>'<button id="version-'+id+'">'+label+'</button>').join('')+'</div><button id="versionsBack">'+tr('뒤로','BACK')+'</button></div>';
 for(const id of Object.keys(EAST_ASIA_VERSIONS))$('version-'+id).onclick=()=>{started=false;eastAsiaDiplomacyState=eastAsiaFreshDiplomacyState();eastAsiaSelectVersion(id);showStart()};
 $('versionsBack').onclick=showBattlefield;
}
const eastAsiaVersionStart=showStart;
showStart=function(...args){eastAsiaSelectVersion(eastAsiaVersion);const result=eastAsiaVersionStart(...args);$('countryBack').onclick=showEastAsiaVersions;return result};
const eastAsiaVersionSetup=setup;
setup=function(...args){
 eastAsiaSelectVersion(eastAsiaVersion);
 const result=eastAsiaVersionSetup(...args);
 if(eastAsiaVersion==='blue-plum-2'){
  for(const q of cities)if(q.f===3){q.f=0;q.eastAsiaFoundingOrigin=3;q.origin=0;q.capital=false;}
  for(const u of units)if(u.f===3)u.f=0;
  defeatedNotices.add(3);diplomacy=eastAsiaInitialDiplomacy();buildRegions();faceInitialArmy();
 }
 focusCapital();updateHUD();save();return result;
};
const eastAsiaVersionSnapshot=snapshot;
snapshot=function(){return{...eastAsiaVersionSnapshot(),eastAsiaVersion}};
const eastAsiaVersionLoad=load;
load=async function(slot=0){
 const s=readSave(slot);if(!s)return false;
 const previous=eastAsiaVersion;
 eastAsiaSelectVersion(s.eastAsiaVersion||'normal');
 const ok=await eastAsiaVersionLoad(slot);
 if(!ok)eastAsiaSelectVersion(previous);
 return ok;
};
const eastAsiaVersionMigration=migrateArmy;
migrateArmy=function(s){eastAsiaSelectVersion(s.eastAsiaVersion||'normal');return eastAsiaVersionMigration(s)};
// Reuse Terha's original Gardara profiles on the replacement country ID.
const eastAsiaVersionInfantry=infantryArtProfile;
infantryArtProfile=function(u){return eastAsiaVersion==='menremoi'&&u.f===3?GARDARA_INFANTRY_PROFILES[u.type]||null:eastAsiaVersionInfantry(u)};
const eastAsiaVersionTankCheck=isBaekTank,eastAsiaVersionTankProfile=baekTankProfile;
isBaekTank=function(u){return eastAsiaVersion==='menremoi'&&u.f===3&&[1,14].includes(u.type)||eastAsiaVersionTankCheck(u)};
baekTankProfile=function(u){
 if(eastAsiaVersion!=='menremoi'||u.f!==3||![1,14].includes(u.type))return eastAsiaVersionTankProfile(u);
 return gardaraTankProfileForEastAsia(u);
};
function gardaraTankProfileForEastAsia(u){
 const art=u.type===14?gardaraEliteArt:gardaraTankArt,image=art.idle,w=image.naturalWidth||1448,h=image.naturalHeight||1086;
 return{art,image,w,h,mx:w*.99,my:h*(u.type===14?.42:.49),flip:baekTankFacing(u)!==1};
}
const eastAsiaVersionSPCheck=isBaekArtillery,eastAsiaVersionSPProfile=baekArtilleryProfile;
isBaekArtillery=function(u){return eastAsiaVersion==='menremoi'&&u.f===3&&u.type===2||eastAsiaVersionSPCheck(u)};
baekArtilleryProfile=function(u,firing=false){
 if(eastAsiaVersion!=='menremoi'||u.f!==3||u.type!==2)return eastAsiaVersionSPProfile(u,firing);
 const art=gardaraArtilleryArt,image=art[firing?'fire':'idle'],w=image.naturalWidth||1672,h=image.naturalHeight||941;
 return{art,w,h,mx:firing?72:27,my:firing?57:365,baseFacing:-1,flashAngle:.44};
};
const eastAsiaVersionHasArt=eastAsiaUnitHasArt;
eastAsiaUnitHasArt=function(u){return eastAsiaVersion==='menremoi'&&u.f===3&&u.type===2||eastAsiaVersionHasArt(u)};
Object.assign(window.Terha,{setup,snapshot,load,migrateArmy,showStart,showEastAsiaVersions,eastAsiaSelectVersion,infantryArtProfile,isBaekTank,baekTankProfile,isBaekArtillery,baekArtilleryProfile,eastAsiaUnitHasArt});

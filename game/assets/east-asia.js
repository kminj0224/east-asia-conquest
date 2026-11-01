'use strict';
// Scenario data and geometric markers over the unmodified shared conquest rules.
const EAST_ASIA_SCHEMA=2;
const eastAsiaBonuses=['보병 방어 +15%','기갑 공격 +20%','기갑 방어 +15%','도시 수입 +15%','이동 거리 +1','해군 공격 +15%','포병 공격 +15%','균형 전력'];
factions.forEach((f,i)=>{f.bonus=eastAsiaBonuses[i];delete f.initialBranches;delete f.initialDefenses});
initialDiplomacy=()=>factions.map((_,a)=>factions.map((_,b)=>a===b?'self':'neutral'));
diplomacy=initialDiplomacy();
// Keep stable engine type IDs while making all country-exclusive types unavailable everywhere.
for(const t of TYPES)if(t.special!==undefined)t.special=-99;
const eastAsiaCanProduce=canProduce;
canProduce=function(q,k,level=1){return TYPES[k]?.special===undefined&&eastAsiaCanProduce(q,k,level)};
const eastAsiaMakeUnit=makeUnit;
makeUnit=function(f,type,tile,level=1){return eastAsiaMakeUnit(f,TYPES[type]?.special!==undefined?0:type,tile,level)};
// Remove only the original world's scenario placements. Normal turn, logistics and combat stay shared.
for(const name of ['adjustCityRoster','adjustCityPlacement','applyBaekCityNames','renameCities','reinforceDante','addBaekWesternFleet','seedDanteExpansion','seedRannaGuerrillas','seedFrontlineReinforcements','seedStetopiaSouthCoast','halveSouthernDanteFleet','applyMariaSea','applyHansaIsland','applyHansaBridgeTerrain','relocateHansaDeckShips']){
 if(typeof window[name]==='function')window[name]=()=>false;
}
createHansaBridges=()=>[];isHansaSupplyCity=()=>false;hansaBridgeConnected=()=>true;
// The unmodified Terha natural map renderer owns terrain, ownership and screen caches.
addAmbientScene=()=>{};
photoCityProfile=()=>null;
cityBuildingLayout=cityArtBuildingLayout;
citySprite=cityArtSprite;
// rifleSprite is the exact pre-image renderer: soldiers, barrels, wheels, wings and hulls.
const eastAsiaClassicBody=rifleSprite;
sprite=function(u,p,now){
 const previous=unitNameBeingDrawn;unitNameBeingDrawn=u;
 try{return eastAsiaClassicBody(u,p,now)}finally{unitNameBeingDrawn=previous}
};
unitHitCenter=(u,now=performance.now())=>{const p=unitVisualPosition(u,now);return{x:p.x,y:p.y-12}};
// Independent save identity, with original slots / snapshots and restoration rules.
const eastAsiaSetup=setup;
setup=function(...args){const result=eastAsiaSetup(...args);for(const q of cities){const seed=MAP.countryCities[q.origin].find(v=>v.tile===q.tile);if(seed)q.name=seed.name}units=units.filter(u=>TYPES[u.type].special===undefined);for(const f of [6,7])defeatedNotices.add(f);diplomacy=initialDiplomacy();buildRegions();save();updateHUD();return result};
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

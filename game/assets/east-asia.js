'use strict';
// Scenario data and geometric markers over the unmodified shared conquest rules.
const EAST_ASIA_SCHEMA=1;
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
// No apparitions, fantasy creatures or original-world river/bridge decorations.
addAmbientScene=()=>{};drawCountryNames=drawCountryNames;
photoCityProfile=()=>null;photoCityBox=()=>({x:-23,y:-30,w:46,h:38,bottom:8});
cityBuildingLayout=q=>({top:-30,starY:-36,nameY:23,bottom:8});
function eastAsiaUnitShape(u,p,now){
 p=unitVisualPosition(u,now);const t=TYPES[u.type],f=factions[u.f];
 ctx.save();ctx.translate(p.x,p.y-12);ctx.fillStyle=f.color;ctx.strokeStyle='#e7e9dc';ctx.lineWidth=1.5;
 ctx.beginPath();if(t.branch==='air'||t.branch==='helicopter'){ctx.moveTo(0,-18);ctx.lineTo(20,15);ctx.lineTo(-20,15);ctx.closePath()}
 else if(t.branch==='armor'){ctx.rect(-23,-14,46,28)}else if(t.branch==='artillery'){ctx.moveTo(0,-18);ctx.lineTo(20,0);ctx.lineTo(0,18);ctx.lineTo(-20,0);ctx.closePath()}
 else if(t.branch==='navy'){ctx.moveTo(-25,-12);ctx.lineTo(25,-12);ctx.lineTo(17,14);ctx.lineTo(-17,14);ctx.closePath()}
 else ctx.arc(0,0,17,0,Math.PI*2);ctx.fill();ctx.stroke();
 ctx.font='bold 12px Terha,sans-serif';ctx.textAlign='center';ctx.fillStyle='#0c1821';ctx.fillText(t.name==='소총수'?'보':t.name.slice(0,1),0,5);
 rect(-22,23,44,4,'#15262b');rect(-22,23,44*Math.max(0,u.hp)/unitMaxHp(u),4,u.f===player?'#b1dfa3':f.color);ctx.restore();
}
sprite=eastAsiaUnitShape;
citySprite=function(q,p){const f=factions[q.f];ctx.save();ctx.translate(p.x,p.y);rect(-23,-29,46,37,'#10232b');rect(-20,-26,40,31,f.color);ctx.strokeStyle='#e5dac0';ctx.lineWidth=2;ctx.strokeRect(-23,-29,46,37);ctx.fillStyle='#101e25';ctx.font='bold 17px Terha,sans-serif';ctx.textAlign='center';ctx.fillText(q.capital?'★':String(q.level),0,-5);ctx.restore()};
unitHitCenter=(u,now=performance.now())=>{const p=unitVisualPosition(u,now);return{x:p.x,y:p.y-12}};
// The exact original painted sea is shared; geography/terrain atlas is generated offline.
drawStaticGround=function(){refreshTerritory();drawOceanBackground(ctx);ctx.drawImage(worldImg,0,0,WW,HH);if(territoryCanvas){ctx.save();ctx.globalAlpha=.22;ctx.drawImage(territoryCanvas,0,0,WW,HH);ctx.restore()}if(eastAsiaTerrain.ready)ctx.drawImage(eastAsiaTerrain.image,0,0,WW,HH)};
const eastAsiaTerrain={image:new Image(),ready:false};eastAsiaTerrain.image.onload=()=>eastAsiaTerrain.ready=true;eastAsiaTerrain.image.src='east-asia-terrain.png';
drawCoastArtwork=()=>{};drawNaturalDetails=()=>{};naturalDetailsReady=()=>true;
// Independent save identity, with original slots / snapshots and restoration rules.
const eastAsiaSetup=setup;
setup=function(...args){const result=eastAsiaSetup(...args);for(const q of cities){const seed=MAP.countryCities[q.origin].find(v=>v.tile===q.tile);if(seed)q.name=seed.name}units=units.filter(u=>TYPES[u.type].special===undefined);diplomacy=initialDiplomacy();buildRegions();save();updateHUD();return result};
// Every flag is an actual national flag in all retained menus and scene markers.
for(let f=0;f<factions.length;f++){const im=new Image();im.src='flag-'+f+'.png';flagImages[f]=im}
Object.assign(window.Terha,{setup,initialDiplomacy,canProduce,makeUnit,unitHitCenter,eastAsiaSchema:EAST_ASIA_SCHEMA});
// Geography and flags must not inherit old faction palette mutations.
['#26944c','#d63232','#92989e','#e8c83e','#286cda','#53aabf','#b88d58','#9b6bac'].forEach((color,f)=>factions[f].color=color);
['서울','베이징','도쿄','평양','타이베이','블라디보스토크','울란바토르','하노이'].forEach((capital,f)=>factions[f].capital=capital);
campaignGroundReady=()=>worldImg.complete&&eastAsiaTerrain.ready;
// River cells are land with a crossing cost, not navigable ocean. Bridges at city cells
// retain normal city movement; mountain cells keep the original mountain cost.
const eastAsiaMoveCost=moveCost;
moveCost=function(u,i){const value=eastAsiaMoveCost(u,i);if(value>=999||isAircraft(u)||isHelicopter(u)||isNaval(u))return value;return tiles[i]?.terrain===4&&tiles[i].city<0?Math.max(value,TYPES[u.type].branch==='armor'?3:2):value};
for(const t of tiles)t.river=t.terrain===4;
const eastAsiaNames=drawCountryNames;
drawCountryNames=function(){eastAsiaNames();if(cam.z<.85)return;ctx.save();ctx.font='11px Terha,sans-serif';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#0e2530dd';ctx.fillStyle='#e9e0bd';for(const f of MAP.features?.mountains||[]){const p=f.point||f.points[Math.floor(f.points.length/2)],q=eastAsiaGeoPoint(p);if(Math.abs(q.x-cam.x)>screenW/2/cam.z||Math.abs(q.y-cam.y)>screenH/2/cam.z)continue;ctx.strokeText(f.name,q.x,q.y-27);ctx.fillText(f.name,q.x,q.y-27)}for(const f of MAP.features?.rivers||[]){const p=f.points[Math.floor(f.points.length/2)],q=eastAsiaGeoPoint(p);if(Math.abs(q.x-cam.x)>screenW/2/cam.z||Math.abs(q.y-cam.y)>screenH/2/cam.z)continue;ctx.fillStyle='#a9d9e8';ctx.strokeText(f.name,q.x,q.y+17);ctx.fillText(f.name,q.x,q.y+17)}ctx.restore()};
function eastAsiaGeoPoint([lon,lat]){const b=MAP.bounds;return{x:(lon-b[0])/(b[2]-b[0])*(W-1)*S+S/3,y:(b[3]-lat)/(b[3]-b[1])*(H-1)*V+V/2}}
Object.assign(window.Terha,{moveCost,eastAsiaGeoPoint});
RANNA_RIVER_TILES.clear();tiles.forEach((t,i)=>{if(t.terrain===4)RANNA_RIVER_TILES.add(i)});

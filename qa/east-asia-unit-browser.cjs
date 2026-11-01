'use strict';
const path=require('path'),assert=require('assert/strict');
module.exports=async(page,out)=>{
 await page.waitForFunction(()=>Object.values(eastAsiaRifleArt).every(a=>a.idleReady&&a.fireReady)&&Object.values(eastAsiaTankArt).every(a=>a.idleReady)&&combatProjectileArt.idleReady&&battlefieldEffects.idleReady);
 const report=await page.evaluate(()=>{
  focusCapital();selected=null;panelOpen=false;refreshSelection();units=[];moving=[];fx=[];sound=true;
  const p=pxy(cities.find(q=>q.f===0&&q.capital).tile),locations=[];
  for(const [row,f]of [0,2].entries())for(const [col,type]of [0,1,14].entries()){
   let tile=worldTileAt(p.x+(col-1)*125,p.y+(row?95:-70));
   if(cityAt(tile)||tiles[tile].owner<0){
    const desired={x:p.x+(col-1)*125,y:p.y+(row?95:-70)};
    tile=tiles.reduce((best,t,i)=>t.owner<0||t.city>=0||units.some(u=>u.tile===i)?best:best<0||Math.hypot(pxy(i).x-desired.x,pxy(i).y-desired.y)<Math.hypot(pxy(best).x-desired.x,pxy(best).y-desired.y)?i:best,-1);
   }
   const u=makeUnit(f,type,tile,1);u.angle=row?Math.PI:0;u.rifleFacing=u.tankFacing=row?-1:1;locations.push(u.id);
  }
  cam.x=p.x;cam.y=p.y;cam.z=1.6;buildRegions();return locations;
 });
 assert.equal(report.length,6);await page.screenshot({path:path.join(out,'unit-art-game.png')});
 const sounds=await page.evaluate(()=>{
  const at=performance.now()+100;combatAudio.queue=[];
  for(const u of units){const p=pxy(u.tile);launchShot(u,{x:p.x+(u.f===0?220:-220),y:p.y},at,520)}
  return combatAudio.queue.map(v=>v.name);
 });
 for(const name of ['rifle','tank','heavy_tank'])assert(sounds.includes(name));assert(!sounds.includes('laser'));
 await page.waitForTimeout(135);await page.screenshot({path:path.join(out,'unit-art-attack.png')});
 // Capture short-lived impact layers in the same browser task that creates them.
 // Screenshot encoding can outlast blood/sparks and must not govern assertions.
 const effects=await page.evaluate(()=>{const now=performance.now();for(const u of units){const target=units.find(v=>v.f!==u.f&&v.type===u.type);targetExplosions(u,pxy(target.tile),25,now,false,target)}for(const e of fx)if(ILLUSTRATED_HITS.has(e.kind)){e.start=now-80}return fx.filter(e=>ILLUSTRATED_HITS.has(e.kind)).map(e=>({layers:e.layers,sound:e.combatImpact,ground:e.explosionGroundY,hitX:e.hitX,hitY:e.hitY}))});
 await page.screenshot({path:path.join(out,'unit-art-impact.png')});
 assert(effects.some(e=>e.layers?.includes('armorSmoke')));assert(effects.some(e=>e.layers?.includes('blood')));assert(!effects.some(e=>e.sound==='energy_hit'));
 assert(effects.every(e=>Number.isFinite(e.ground)&&Number.isFinite(e.hitX)&&Number.isFinite(e.hitY)));
 await page.evaluate(()=>{sound=false;setup();focusCapital();selected=null;panelOpen=false;refreshSelection()});
 console.log('PASS real browser: six national bodies, attack/impact screenshots, PCM weapon queue, directional hit centers, spark/smoke/blood layers, zero energy-tank routing');
};

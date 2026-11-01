'use strict';
// Exercise the real loaded game, sprite transforms, muzzle FX and audio queue.
const fs=require('fs'),path=require('path');
const source=fs.readFileSync(path.join(__dirname,'east-asia.cjs'),'utf8');
const prefix=source.slice(0,source.indexOf('\n(async()=>{'));
new Function('require','__dirname',prefix+`
(async()=>{
 await settle();run('setup();started=true;setAppScreen("game");sound=true;cam.z=1;');await settle();
 for(const f of [0,2])for(const type of [0,1,14])for(const level of [1,2,3,4])for(const side of [-1,1]){
  run('units=[];moving=[];fx=[];fireMotions.clear();combatAudio.queue=[];globalThis.probe=makeUnit('+f+','+type+',cities.find(q=>q.f==='+f+').tile,'+level+');probe.angle='+side+'===1?0:Math.PI;probe.rifleFacing=probe.tankFacing='+side+';globalThis.probePoint=pxy(probe.tile)');
  assert(run('eastAsiaUnitHasArt(probe)'));
  // Capture transformed texture boxes and flash origins from the actual renderer.
  run('globalThis.textureCalls=[];globalThis.flashCalls=[];globalThis.oldArtDraw=ctx.drawImage;globalThis.oldFlashDraw=drawMuzzleIllustration;ctx.drawImage=function(im,...args){if(im.src?.startsWith("eastasia-"))textureCalls.push({src:im.src,args,m:ctx.getTransform()});return oldArtDraw(im,...args)};drawMuzzleIllustration=function(...args){const m=ctx.getTransform();flashCalls.push({x:m.e,y:m.f});return oldFlashDraw(...args)}');
  try{
   run('sprite(probe,probePoint,performance.now())');
   assert.equal(run('textureCalls.length'),1,'one native idle body');
   assert(run('textureCalls[0].src.includes('+(f===0?'"kr-"':'"jp-"')+')'));
   if(type===0)assert(run('textureCalls[0].src.endsWith("idle.png")'));
   if(type!==0){
    const fit=run('(()=>{const call=textureCalls[0],a=EAST_ASIA_TANKS[probe.f+":"+probe.type],source=EAST_ASIA_UNIT_BOUNDS[a.source],hull=source.hullBounds,[x,y,w,h]=call.args,m=call.m;const ends=[hull[0],hull[2]].map(px=>m.a*(x+px/source.width*w)+m.c*y+m.e).sort((a,b)=>a-b);return{left:probePoint.x-S*2/3-ends[0],right:ends[1]-(probePoint.x+S*2/3),foot:m.d*(y+source.opaqueBounds[3]/source.height*h)+m.f-probePoint.y,ratio:w/h,sourceRatio:source.width/source.height,hit:unitHitCenter(probe).x-probePoint.x}})()');
    assert(Math.abs(fit.left-4)<.01&&Math.abs(fit.right-4)<.01,'actual hull extends four pixels beyond both hex corners');
    assert(Math.abs(fit.foot-11)<.01,'opaque track bottom anchored to native ground');
    assert(Math.abs(fit.ratio-fit.sourceRatio)<.00001,'preserve supplied art aspect');
    assert(Math.abs(fit.hit)<.01,'hit centered on hull, excluding barrel');
   }
   run('textureCalls=[];beginAim(probe,{x:probePoint.x+'+side+'*200,y:probePoint.y},100);launchShot(probe,{x:probePoint.x+'+side+'*200,y:probePoint.y},performance.now()-20,520);sprite(probe,probePoint,performance.now())');
   assert.equal(run('textureCalls.length'),1,'one native attack body');
   assert.equal(run('flashCalls.length'),type===0?3:1,'one flash per actual barrel');
   if(type===0){
    assert(run('textureCalls[0].src.endsWith("fire.png")'));
    assert(run('flashCalls.every((p,i)=>{const m=infantryMuzzleWorld(probe,probePoint,infantryArtProfile(probe).muzzles[i]);return Math.hypot(p.x-m.x,p.y-m.y)<.01})'),'rifle flash registered to mirrored opening');
    assert.equal(run('combatAudio.queue.filter(v=>v.name==="rifle").length'),3);
    assert.equal(run('combatAudio.queue[1].start-combatAudio.queue[0].start'),90);
   }else{
    assert(run('Math.hypot(flashCalls[0].x-baekTankMuzzle(probe,probePoint,performance.now()).x,flashCalls[0].y-baekTankMuzzle(probe,probePoint,performance.now()).y)<.01'),'tank flash and shell origin match scaled recoiling barrel');
    assert.equal(run('combatAudio.queue[0].name'),type===14?'heavy_tank':'tank');
    assert.equal(run('combatImpactProfile(probe)'),'explosion_heavy');
    assert(!run('fx.some(e=>e.kind==="laser"||e.laserShell)'));
    assert(run('Math.abs(baekTankRecoil(probe,performance.now()))>0'));
    assert.equal(run('baekTankRecoil(probe,performance.now()+400)'),0);
   }
   assert.equal(run('probe.rifleFacing'),side);assert.equal(run('probe.tankFacing'),side);
   assert(run('Number.isFinite(unitHitCenter(probe).y)&&Math.abs(unitHitCenter(probe).y-probePoint.y)>1'));
   assert(run('unitExplosionGroundY(probe)>unitHitCenter(probe).y'));
  }finally{run('ctx.drawImage=oldArtDraw;drawMuzzleIllustration=oldFlashDraw')}
 }
 // Unselected countries/types keep geometry and never accidentally load old national bodies.
 for(let f=0;f<6;f++)for(let type=0;type<run('TYPES.length');type++)assert.equal(run('eastAsiaUnitHasArt({f:'+f+',type:'+type+'})'),([0,2].includes(f)&&[0,1,14].includes(type))||(f===0&&[8,9,10].includes(type)));
 assert(run('baekRifleArt.idleReady===false&&stetopiaTankArt[1].idleReady===false'));
 assert(run('battlefieldEffects.idleReady&&combatProjectileArt.idleReady&&smokeFramesArt.idleReady'));
 assert.equal(run('JSON.stringify(impactLayers({f:2,type:1},{type:1}))'),'["armorSmoke"]');
 assert.equal(run('JSON.stringify(impactLayers({f:0,type:0},{type:0}))'),'["blood"]');
 assert.equal(run('JSON.stringify(impactLayers({f:2,type:0},{type:1}))'),'["sparks"]');
 assert.equal(reads,0,'no runtime alpha or pixel scans');assert.deepEqual(errors,[]);
 // Draw a reproducible inspection sheet through native sprite and FX paths.
 run('setup();units=[];fx=[];moving=[];cam.z=.5;ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle="#6d8b80";ctx.fillRect(0,0,1280,800);for(const [row,f] of [0,2].entries())for(const [col,type] of [0,1,14].entries())for(const side of [-1,1]){const u=makeUnit(f,type,cities.find(q=>q.f===f).tile,1);u.tankFacing=u.rifleFacing=side;const p={x:150+col*410+(side===1?170:0),y:120+row*360};ctx.save();ctx.translate(p.x,p.y);ctx.scale(2.7,2.7);sprite(u,{x:0,y:0},performance.now());ctx.restore();fireMotions.set(u.id,{start:performance.now()-20,duration:450});ctx.save();ctx.translate(p.x,p.y+155);ctx.scale(2.7,2.7);sprite(u,{x:0,y:0},performance.now());ctx.restore()}');
 fs.writeFileSync(path.join(__dirname,'east-asia-previews/unit-art.png'),main.toBuffer('image/png'));
 main.width=1920;
 run('units=[];moving=[];fireMotions.clear();ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle="#6d8b80";ctx.fillRect(0,0,1920,800);globalThis.fitLabels=["한국 전차 · K1","한국 정예전차 · K2","일본 전차 · 90식","일본 정예전차 · 10식"];for(const [col,[f,type]]of [[0,1],[0,14],[2,1],[2,14]].entries()){ctx.fillStyle="#fff4d5";ctx.textAlign="center";ctx.font="bold 19px Terha,sans-serif";ctx.fillText(fitLabels[col],240+col*480,29);for(let row=0;row<4;row++){const side=row%2?-1:1,u=makeUnit(f,type,cities.find(q=>q.f===f).tile,1);u.tankFacing=side;u.angle=side===1?0:Math.PI;if(row>=2)fireMotions.set(u.id,{start:performance.now()-20,duration:450});ctx.save();ctx.translate(240+col*480,137+row*185);ctx.scale(2.3,2.3);poly(hexPoints({x:0,y:0}),"#446b5e");ctx.strokeStyle="#ead48d";ctx.lineWidth=.7;ctx.beginPath();hexPoints({x:0,y:0}).forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.stroke();sprite(u,{x:0,y:0},performance.now());ctx.restore()}}');
 fs.writeFileSync(path.join(__dirname,'east-asia-previews/tank-fit.png'),main.toBuffer('image/png'));
 console.log('PASS 96 country/type/tier/facing states: exact original PNGs, hull overhang +/-4px against real hex geometry, anchored opaque tracks, source aspect ratio, native idle/fire/recoil, mirrored barrel/flash alignment, rifle/tank PCM, conventional Japanese cannon impacts, fallback geometry and no runtime readback');process.exit(0);
})().catch(e=>{console.error(e);process.exit(1)});
`)(require,__dirname);

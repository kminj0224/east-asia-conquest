'use strict';
const fs=require('fs'),path=require('path');
const source=fs.readFileSync(path.join(__dirname,'east-asia.cjs'),'utf8');
new Function('require','__dirname',source.slice(0,source.indexOf('\n(async()=>{'))+`
(async()=>{
 await settle();run('setup();started=true;setAppScreen("game");sound=true;cam.z=1;');await settle();
 for(const type of [8,9,10])for(const level of [1,2,3,4])for(const side of [-1,1]){
  run('units=[];moving=[];fx=[];fireMotions.clear();combatAudio.queue=[];globalThis.probe=makeUnit(0,'+type+',cities.find(q=>q.f===0).tile,'+level+');probe.angle='+side+'===1?0:Math.PI;probe.rifleFacing='+side+';globalThis.point=pxy(probe.tile);globalThis.calls=[];globalThis.previousDraw=ctx.drawImage;ctx.drawImage=function(im,...args){if(im.src?.startsWith("eastasia-"))calls.push({src:im.src,args,m:ctx.getTransform()});return previousDraw(im,...args)}');
  try{
   run('sprite(probe,point,performance.now())');assert.equal(run('calls.length'),1);
   assert(run('calls[0].src.includes('+JSON.stringify(type===8?'grenadier':type===9?'antitank':'machinegun')+')'));
   assert(run('Math.abs(calls[0].args[2]/calls[0].args[3]-1448/1086)<1e-9'));
   run('calls=[];beginAim(probe,{x:point.x+'+side+'*200,y:point.y},100);launchShot(probe,{x:point.x+'+side+'*200,y:point.y},performance.now()-20,520);sprite(probe,point,performance.now())');
   assert.equal(run('calls.length'),1);assert(run('calls[0].src.endsWith('+(type===10?'"machinegun.png"':'"fire.png"')+')'));
   assert.equal(run('probe.rifleFacing'),side);
   assert(run('(()=>{const c=calls[0],m=c.m,[x,y,w,h]=c.args,p=infantryArtProfile(probe),points=probe.type===8?[[507,193],[1026,57],[1399,186]]:probe.type===9?[[506,281],[1004,153],[1422,281]]:[[20,398]];return points.every(([sx,sy],i)=>{const px=x+sx/1448*w,py=y+sy/1086*h,world=infantryMuzzleWorld(probe,point,p.muzzles[i]);return Math.hypot(world.x-(m.a*px+m.c*py+m.e),world.y-(m.b*px+m.d*py+m.f))<.01})})()'));
   assert(run('Number.isFinite(unitHitCenter(probe).x)&&unitExplosionGroundY(probe)>unitHitCenter(probe).y'));
   if(type===8)assert.equal(run('fx.filter(e=>e.kind==="baekGrenade").length'),3);
   if(type===9)assert.equal(run('fx.filter(e=>e.kind==="infantrySmoke").length'),3);
   if(type===10)assert(run('fireMotions.get(probe.id).burst'));
  }finally{run('ctx.drawImage=previousDraw')}
 }
 assert.equal(reads,0);assert.deepEqual(errors,[]);
 console.log('PASS Korean support infantry: 24 type/tier/facing states, exact PNGs, firing poses, mirrored muzzle origins, native grenade/smoke/burst paths, hit/ground bounds');process.exit(0);
})().catch(e=>{console.error(e);process.exit(1)});
`)(require,__dirname);

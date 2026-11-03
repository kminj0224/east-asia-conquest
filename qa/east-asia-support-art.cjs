'use strict';
const fs=require('fs'),path=require('path');
const source=fs.readFileSync(path.join(__dirname,'east-asia.cjs'),'utf8');
new Function('require','__dirname',source.slice(0,source.indexOf('\n(async()=>{'))+`
(async()=>{
 await settle();run('setup();started=true;setAppScreen("game");sound=true;cam.z=1;');await settle();
 for(const f of [1,3])for(const type of [0])for(const level of [1,2,3,4])for(const side of [-1,1]){
  run('units=[];moving=[];fx=[];fireMotions.clear();combatAudio.queue=[];globalThis.probe=makeUnit('+f+','+type+',cities.find(q=>q.f==='+f+').tile,'+level+');probe.angle='+side+'===1?0:Math.PI;probe.rifleFacing='+side+';globalThis.point=pxy(probe.tile);globalThis.calls=[];globalThis.previousDraw=ctx.drawImage;ctx.drawImage=function(im,...args){if(im.src?.startsWith("eastasia-"))calls.push({src:im.src,args,m:ctx.getTransform()});return previousDraw(im,...args)}');
  try{
   run('sprite(probe,point,performance.now())');assert.equal(run('calls.length'),1);
   assert(run('calls[0].src.includes('+JSON.stringify('rifle')+')'));
   assert(run('(()=>{const c=calls[0],im=infantryArtProfile(probe).art.idle;return Math.abs(c.args[2]/c.args[3]-im.naturalWidth/im.naturalHeight)<1e-9})()'));
   run('calls=[];beginAim(probe,{x:point.x+'+side+'*200,y:point.y},100);launchShot(probe,{x:point.x+'+side+'*200,y:point.y},performance.now()-20,520);sprite(probe,point,performance.now())');
   assert.equal(run('calls.length'),1);assert(run('calls[0].src.endsWith('+(type===10?(f===1||f===3?'"machinegun.webp"':'"machinegun.png"'):(f===0?'"fire.png"':'"fire.webp"'))+')'));
   assert.equal(run('probe.rifleFacing'),side);
   assert(run('(()=>{const c=calls[0],m=c.m,[x,y,w,h]=c.args,p=infantryArtProfile(probe),points=probe.f===3?({0:[[21,346],[430,222],[836,378]],8:[[42,106],[467,52],[926,106]],9:[[28,315],[424,202],[905,315]],10:[[24,405]]})[probe.type]:probe.f===1?EAST_ASIA_CN_MUZZLE_PIXELS[probe.type]:probe.f===2?(probe.type===8?[[543,238],[1019,102],[1408,251]]:probe.type===9?[[538,278],[1001,164],[1427,285]]:[[26,405]]):probe.type===8?[[507,193],[1026,57],[1399,186]]:probe.type===9?[[506,281],[1004,153],[1422,281]]:[[20,398]];return points.every(([sx,sy],i)=>{const px=x+sx/p.art.fire.naturalWidth*w,py=y+sy/p.art.fire.naturalHeight*h,world=infantryMuzzleWorld(probe,point,p.muzzles[i]);return Math.hypot(world.x-(m.a*px+m.c*py+m.e),world.y-(m.b*px+m.d*py+m.f))<.01})})()'));
   assert(run('Number.isFinite(unitHitCenter(probe).x)&&unitExplosionGroundY(probe)>unitHitCenter(probe).y'));
   if(type===0){assert.equal(run('combatAudio.queue.filter(v=>v.name==="rifle").length'),3);assert.equal(run('combatAudio.queue[1].start-combatAudio.queue[0].start'),90);}
   if(type===8)assert.equal(run('fx.filter(e=>e.kind==="baekGrenade").length'),3);
   if(type===9)assert.equal(run('fx.filter(e=>e.kind==="infantrySmoke").length'),3);
   if(type===10)assert(run('fireMotions.get(probe.id).burst'));
  }finally{run('ctx.drawImage=previousDraw')}
 }
 for(const f of [0,1,2,3])for(const type of [8,9,10])for(const level of [1,2,3,4])for(const side of [-1,1]){
  run('units=[];moving=[];fx=[];fireMotions.clear();combatAudio.queue=[];globalThis.probe=makeUnit('+f+','+type+',cities.find(q=>q.f==='+f+').tile,'+level+');probe.angle='+side+'===1?0:Math.PI;probe.rifleFacing='+side+';globalThis.point=pxy(probe.tile);globalThis.calls=[];globalThis.previousDraw=ctx.drawImage;ctx.drawImage=function(im,...args){if(im.src?.startsWith("eastasia-"))calls.push({src:im.src,args,m:ctx.getTransform()});return previousDraw(im,...args)}');
  try{
   run('sprite(probe,point,performance.now())');assert.equal(run('calls.length'),1);
   assert(run('calls[0].src.includes('+JSON.stringify(type===8?'grenadier':type===9?'antitank':'machinegun')+')'));
   assert(run('(()=>{const c=calls[0],im=infantryArtProfile(probe).art.idle;return Math.abs(c.args[2]/c.args[3]-im.naturalWidth/im.naturalHeight)<1e-9})()'));
   run('calls=[];beginAim(probe,{x:point.x+'+side+'*200,y:point.y},100);launchShot(probe,{x:point.x+'+side+'*200,y:point.y},performance.now()-20,520);sprite(probe,point,performance.now())');
   assert.equal(run('calls.length'),1);assert(run('calls[0].src.endsWith('+(type===10?(f===1||f===3?'"machinegun.webp"':'"machinegun.png"'):(f===0?'"fire.png"':'"fire.webp"'))+')'));
   assert.equal(run('probe.rifleFacing'),side);
   assert(run('(()=>{const c=calls[0],m=c.m,[x,y,w,h]=c.args,p=infantryArtProfile(probe),points=probe.f===3?({0:[[21,346],[430,222],[836,378]],8:[[42,106],[467,52],[926,106]],9:[[28,315],[424,202],[905,315]],10:[[24,405]]})[probe.type]:probe.f===1?EAST_ASIA_CN_MUZZLE_PIXELS[probe.type]:probe.f===2?(probe.type===8?[[543,238],[1019,102],[1408,251]]:probe.type===9?[[538,278],[1001,164],[1427,285]]:[[26,405]]):probe.type===8?[[507,193],[1026,57],[1399,186]]:probe.type===9?[[506,281],[1004,153],[1422,281]]:[[20,398]];return points.every(([sx,sy],i)=>{const px=x+sx/p.art.fire.naturalWidth*w,py=y+sy/p.art.fire.naturalHeight*h,world=infantryMuzzleWorld(probe,point,p.muzzles[i]);return Math.hypot(world.x-(m.a*px+m.c*py+m.e),world.y-(m.b*px+m.d*py+m.f))<.01})})()'));
   assert(run('Number.isFinite(unitHitCenter(probe).x)&&unitExplosionGroundY(probe)>unitHitCenter(probe).y'));
   if(type===8)assert.equal(run('fx.filter(e=>e.kind==="baekGrenade").length'),3);
   if(type===9)assert.equal(run('fx.filter(e=>e.kind==="infantrySmoke").length'),3);
   if(type===10)assert(run('fireMotions.get(probe.id).burst'));
  }finally{run('ctx.drawImage=previousDraw')}
 }
 run('units=[];moving=[];fireMotions.clear();ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle="#6d8b80";ctx.fillRect(0,0,1280,800);for(const [col,type] of [0,8,9,10].entries())for(const [row,side] of [-1,1].entries()){const u=makeUnit(3,type,cities.find(q=>q.f===3).tile,1);u.rifleFacing=side;for(const fire of [false,true]){if(fire)fireMotions.set(u.id,{start:performance.now()-20,duration:450});else fireMotions.delete(u.id);ctx.save();ctx.translate(160+col*320,100+row*390+(fire?170:0));ctx.scale(3.5,3.5);sprite(u,{x:0,y:0},performance.now());ctx.restore()}}');
 fs.writeFileSync(path.join(__dirname,'east-asia-previews/north-korean-infantry.png'),main.toBuffer('image/png'));
 assert.equal(reads,0);assert.deepEqual(errors,[]);
 console.log('PASS Korean/Chinese/Japanese/North Korean infantry: 112 type/tier/facing states, exact PNG/WebP files, firing poses, mirrored muzzle origins, native grenade/smoke/burst paths, hit/ground bounds');process.exit(0);
})().catch(e=>{console.error(e);process.exit(1)});
`)(require,__dirname);

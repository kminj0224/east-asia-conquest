'use strict';
const fs=require('fs'),path=require('path');
const source=fs.readFileSync(path.join(__dirname,'east-asia.cjs'),'utf8');
const prefix=source.slice(0,source.indexOf('\n(async()=>{'));
new Function('require','__dirname',prefix+`
(async()=>{
 await settle();run('setup();started=true;setAppScreen("game")');await settle();
 run('globalThis.originalVehicle=drawVehicle;globalThis.vehicleScales=[];drawVehicle=function(...args){const m=ctx.getTransform();vehicleScales.push(Math.hypot(m.a,m.b));return originalVehicle(...args)}');
 let states=0;
 for(let f=0;f<8;f++)for(const type of [1,14])for(const level of [1,2,3,4])for(const side of [-1,1]){
  const multiplier=f===0&&type===1?1.06:1.1;
  run('units=[];moving=[];fireMotions.clear();fx=[];vehicleScales=[];ctx.setTransform(1,0,0,1,0,0);globalThis.probe=makeUnit('+f+','+type+',cities.find(q=>q.f===0).tile,'+level+');probe.angle='+side+'===1?0:Math.PI;probe.tankFacing='+side);
  assert(Math.abs(run('unitBodyVisualScale(probe)')-1.4*multiplier)<1e-10,'one requested tank multiplier');
  run('sprite(probe,pxy(probe.tile),performance.now())');
  if(!run('eastAsiaUnitHasArt(probe)')){
   assert.equal(run('vehicleScales.length'),level,'all classic tank formation members painted');
   const expected=1.4*multiplier*(level===1?.9:.58);
   assert(run('vehicleScales.every(s=>Math.abs(s-'+expected+')<1e-6)'),'classic body transform has exact enlarged scale '+JSON.stringify({f,type,level,side,expected,actual:run('vehicleScales')}));
   assert(run('Math.abs(unitHitCenter(probe).y-pxy(probe.tile).y-(11-23*'+multiplier+'))<1e-8'),'classic impact center follows enlarged body');
  }
  const scaled=run('scaleUnitMuzzle(probe,{x:100,y:200},{x:130,y:170})');
  assert(Math.abs(scaled.x-(100+30*1.4*multiplier))<1e-8);
  assert(Math.abs(scaled.y-(211+(170-211)*1.4*multiplier))<1e-8);
  states++;
 }
 for(const type of [0,2,3,8,9,10,11,12,15,16,20,21,22,23,24,25,26,32])assert.equal(run('tankVisualMultiplier({f:0,type:'+type+'})'),1,'other branches unchanged');
 assert.equal(run('unitBodyVisualScale({f:0,type:12})'),1.4);
 assert.equal(run('unitBodyVisualScale({f:0,type:2})'),1.4);
 assert.equal(run('unitBodyVisualScale({f:0,type:21})'),1.3);
 assert.equal(reads,0);assert.deepEqual(errors,[]);
 console.log('PASS '+states+' national tank/type/tier/facing states: Korean regular 106%, all other regular/elite tanks 110%, classic body transforms, muzzle/impact alignment, other branches unchanged');process.exit(0);
})().catch(e=>{console.error(e);process.exit(1)});
`)(require,__dirname);

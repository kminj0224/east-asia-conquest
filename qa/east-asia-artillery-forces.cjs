'use strict';
const fs=require('fs'),path=require('path');
const source=fs.readFileSync(path.join(__dirname,'east-asia.cjs'),'utf8');
const prefix=source.slice(0,source.indexOf('\n(async()=>{'));
new Function('require','__dirname',prefix+`
(async()=>{
 await settle();run('setup();started=true;setAppScreen("game")');await settle();
 const expected=[{0:21,1:3,2:3,14:3},{0:20,1:5,2:5},{0:12,1:2,2:2},{0:30,1:10}];
 for(const difficulty of [0,1,2]){
  run('difficulty='+difficulty+';setup()');
  for(let f=0;f<4;f++){
   const army=run('units.filter(u=>u.f==='+f+'&&!isNaval(u))');
   assert.equal(army.length,[30,30,16,40][f]);
   const count=type=>army.filter(u=>u.type===type).length;
   assert.equal(army.filter(u=>[0,8,9,10].includes(u.type)).length,expected[f][0]);
   for(const type of [1,2,14])assert.equal(count(type),expected[f][type]||0);
   assert.equal(new Set(army.map(u=>u.tile)).size,army.length);
   assert(run('units.filter(u=>u.f==='+f+'&&!isNaval(u)).every(u=>tiles[u.tile].owner==='+f+'&&moveCost(u,u.tile)<999)'));
   assert(run('new Set(units.filter(u=>u.f==='+f+'&&!isNaval(u)).map(u=>tiles[u.tile].region)).size>=5'),'dispersed among regions');
  }
  assert.deepEqual(Array.from(run('units.filter(u=>u.f===0&&isNaval(u)).map(u=>u.type)')),[24]);
  assert(run('units.some(u=>u.f===3&&u.type===22)&&units.filter(u=>u.f===3&&isNaval(u)).every(u=>u.type===22)'));
  assert(run('units.filter(u=>u.f===1&&[1,2].includes(u.type)).every(u=>tiles.some((t,i)=>MAP.tiles[i][0]===3&&distance(u.tile,i)<=5))'));
  assert(!run('units.some(u=>u.type===13)'));
  assert(!run('ARMOR.includes(13)'));
  assert(run('cities.every(q=>!canProduce(q,13,1)&&!canProduce(q,13,4))'));
 }
 // Verify actual image transforms, not just box fields, for both poses and faces.
 run('globalThis.artilleryCalls=[];globalThis.artilleryNativeDraw=ctx.drawImage;ctx.drawImage=function(im,...args){if(im?.src?.includes("-sp-"))artilleryCalls.push({src:im.src,args,m:ctx.getTransform()});return artilleryNativeDraw(im,...args)}');
 let states=0;
 for(let f=0;f<3;f++)for(const level of [1,2,3,4])for(const side of [-1,1])for(const firing of [false,true]){
  run('units=[];fireMotions.clear();moving=[];fx=[];ctx.setTransform(1,0,0,1,0,0);globalThis.probe=makeUnit('+f+',2,cities.find(q=>q.f==='+f+').tile,'+level+');globalThis.point={x:200,y:200};probe.artilleryFacing='+side+';artilleryCalls=[];'+(firing?'launchShot(probe,{x:point.x+'+side+'*200,y:point.y},performance.now()-20,520);':'')+'sprite(probe,point,performance.now())');
  assert.equal(run('artilleryCalls.length'),1);
  assert(run('artilleryCalls[0].src.endsWith("sp-'+(firing?'fire':'idle')+'.webp")'));
  const foot=run('(()=>{const c=artilleryCalls[0],b=EAST_ASIA_UNIT_BOUNDS[eastAsiaSP(probe).source+"-'+(firing?'fire':'idle')+'"],sx=c.args[0],sy=c.args[1],sw=c.args[2],sh=c.args[3],x=c.args[4],y=c.args[5],w=c.args[6],h=c.args[7],track=b.hullBounds,px=x+((track[0]+track[2])/2-sx)/sw*w,py=y+(track[3]-sy)/sh*h;return{x:c.m.a*px+c.m.c*py+c.m.e,y:c.m.b*px+c.m.d*py+c.m.f,width:Math.abs(c.m.a*(track[2]-track[0])/sw*w)}})()');
  assert(Math.abs(foot.x-200)<.001);assert(Math.abs(foot.y-211)<.001);
  assert(Math.abs(foot.width-64*1.4)<.001);
  assert(Math.abs(run('unitExplosionGroundY(probe)')-run('pxy(probe.tile).y')-11)<.001);
  if(firing)assert(run('(()=>{const c=artilleryCalls[0],a=baekArtilleryProfile(probe,true),x=c.args[4]+a.mx/a.w*c.args[6],y=c.args[5]+a.my/a.h*c.args[7],m=baekArtilleryMuzzle(probe,point);return Math.hypot(m.x-(c.m.a*x+c.m.c*y+c.m.e),m.y-(c.m.b*x+c.m.d*y+c.m.f))<.001})()'),'muzzle follows sprite transform');
  states++;
 }
 for(const f of [0,2]){
  const p=run('infantryArtProfile({f:'+f+',type:10})');
  assert(Math.abs(p.height-48*.94)<1e-9);
  assert(Math.abs(p.width-(f===0?64:48*1446/1086)*.94)<1e-9);
  assert(run('(()=>{const p=infantryArtProfile({f:'+f+',type:10}),b=EAST_ASIA_UNIT_BOUNDS["'+(f===0?'kr':'jp')+'-machinegun"];return Math.abs(infantryArtBottom(p)-p.height+b.opaqueBounds[3]/b.height*p.height-(14-48*(1-b.opaqueBounds[3]/b.height)))<1e-9})()'));
 }
 // Loading old light tanks converts their IDs and retains damage/level/position.
 run('setup();globalThis.legacyUnit=units.find(u=>u.f===0&&u.type===1);legacyUnit.type=13;legacyUnit.hp=unitMaxHp(legacyUnit)*.4;globalThis.legacyId=legacyUnit.id;globalThis.legacyTile=legacyUnit.tile;globalThis.legacyCount=units.length;globalThis.legacySnapshot=snapshot();migrateArmy(legacySnapshot)');
 assert(run('units.length===legacyCount&&units.find(u=>u.id===legacyId).type===1&&units.find(u=>u.id===legacyId).tile===legacyTile'));
 assert(Math.abs(run('units.find(u=>u.id===legacyId).hp/unitMaxHp(units.find(u=>u.id===legacyId))')-.4)<1e-8);
 run('globalThis.oldQueueCity=cities.find(q=>q.f===0);oldQueueCity.level=5;oldQueueCity.queue={type:13,level:1};migrateArmy(snapshot())');
 assert(run('oldQueueCity.queue?.type===1'));
 assert(!run('units.some(u=>u.type===13)'));
 assert.equal(reads,0);assert.deepEqual(errors,[]);
 console.log('PASS exact starting armies/fleets across difficulties, border deployment, retired light-tank migration, '+states+' artillery pose/face/tier track and muzzle transforms, 94% HMGs and fixed feet');process.exit(0);
})().catch(e=>{console.error(e);process.exit(1)});
`)(require,__dirname);

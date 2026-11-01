'use strict';
const fs=require('fs'),path=require('path');
const source=fs.readFileSync(path.join(__dirname,'east-asia.cjs'),'utf8');
const prefix=source.slice(0,source.indexOf('\n(async()=>{')).replace('navigator:{}','navigator:{userAgent:"Android"}').replace('c.addEventListener=()=>{}','c.eventHandlers=new Map();c.addEventListener=(type,handler)=>{const handlers=c.eventHandlers.get(type)||[];handlers.push(handler);c.eventHandlers.set(type,handlers)}');
new Function('require','__dirname',prefix+`
(async()=>{
 await settle();run('setup();started=true;setAppScreen("game")');await settle();
 assert.equal(run('tiles.length'),run('W*H'),'only the original rectangle has tiles');
 assert.equal(run('oceanTileIndex.size'),0);
 for(const expression of ['index(-1,20)','index(W,20)','index(20,-1)','index(20,H)'])assert.equal(run(expression),-1);
 for(const expression of ['neighbors(index(0,20)).every(i=>tiles[i].x<2)','neighbors(index(W-1,20)).every(i=>tiles[i].x>W-3)','distance(index(0,20),index(W-1,20))>W/2','nearWorldPoint({x:1,y:2},{x:WW,y:2}).x===1'])assert(run(expression),expression);
 const saved=run('JSON.stringify(snapshot())');
 run('globalThis.oldSave=JSON.parse('+JSON.stringify(saved)+');oldSave.owners.length=(W+32)*(H+24);oldSave.units.push({...oldSave.units[0],id:999999,tile:W*H+10});oldSave.cam={x:-9999,y:99999,z:.01};localStorage.setItem(saveKey(),JSON.stringify(oldSave))');
 assert(run('load()'),'previous expanded-ocean saves remain loadable');assert(run('units.every(u=>u.tile<W*H)'));
 for(const [width,height] of [[1536,672],[390,844],[800,1280],[2560,1080]]){
  for(const x of [-1e6,run("WW/2"),1e6])for(const y of [-1e6,run("HH/2"),1e6])for(const z of [.001,.2,1.2,2.7]){
   run('screenW='+width+';screenH='+height+';cam={x:'+x+',y:'+y+',z:'+z+'};constrainMapCamera()');
   assert(run('cam.x-screenW/(2*cam.z)>=-1e-8&&cam.x+screenW/(2*cam.z)<=WW+1e-8&&cam.y-screenH/(2*cam.z)>=-1e-8&&cam.y+screenH/(2*cam.z)<=HH+1e-8'),'viewport never exposes outside map');
  }
 }
 run('screenW=1280;screenH=800;cam={x:-999,y:99999,z:.01};draw(performance.now())');
 assert(run('cam.x-screenW/(2*cam.z)>=-1e-8&&cam.y+screenH/(2*cam.z)<=HH+1e-8'),'render enforces limits');
 // Reproduce the actual Android 30 FPS skipped frame from the CI failure.
 run('Object.defineProperty(navigator,"userAgent",{value:"Android",configurable:true});c.setPointerCapture=()=>{};globalThis.emitPointer=(type,event)=>{for(const handler of c.eventHandlers.get(type)||[])handler(event)}');
 for(const sign of [-1,1]){
  run('emitPointer("pointerdown",{pointerId:91,clientX:100,clientY:100});emitPointer("pointermove",{pointerId:91,clientX:'+sign+'*100000,clientY:'+sign+'*100000})');
  assert(run('cam.x-screenW/(2*cam.z)>=-1e-8&&cam.x+screenW/(2*cam.z)<=WW+1e-8&&cam.y-screenH/(2*cam.z)>=-1e-8&&cam.y+screenH/(2*cam.z)<=HH+1e-8'),'drag clamps before any animation frame');
  run('emitPointer("pointerup",{pointerId:91});emitPointer("wheel",{deltaY:99999,preventDefault(){}})');
  assert(run('cam.z>=Math.max(screenW/WW,screenH/HH)'),'wheel clamps immediately');
 }
 run('emitPointer("pointerdown",{pointerId:91,clientX:100,clientY:100});emitPointer("pointerdown",{pointerId:92,clientX:300,clientY:100});emitPointer("pointermove",{pointerId:92,clientX:101,clientY:100})');
 assert(run('cam.z>=Math.max(screenW/WW,screenH/HH)'),'pinch clamps immediately');
 run('emitPointer("pointerup",{pointerId:92});emitPointer("pointerup",{pointerId:91});for(let n=0;n<40;n++)$("minus").onclick()');
 assert(run('cam.z>=Math.max(screenW/WW,screenH/HH)'),'minus clamps immediately');
 run('cam.x=-99999;cam.y=99999;lastWorldPaint=performance.now();draw(performance.now()+1)');
 assert(run('cam.x-screenW/(2*cam.z)>=-1e-8&&cam.y+screenH/(2*cam.z)<=HH+1e-8'),'camera valid even before throttled painting');
 assert.equal(reads,0);assert.deepEqual(errors,[]);
 console.log('PASS finite map, no ocean cells or seam neighbors, 432 camera cases, old-save migration and render constraints');process.exit(0);
})().catch(e=>{console.error(e);process.exit(1)});
`)(require,__dirname);

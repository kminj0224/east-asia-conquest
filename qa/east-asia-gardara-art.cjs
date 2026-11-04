'use strict';
const fs=require('fs'),path=require('path');
const source=fs.readFileSync(path.join(__dirname,'east-asia.cjs'),'utf8');
const prefix=source.slice(0,source.indexOf('\n(async()=>{'));
new Function('require','__dirname',prefix+`
(async()=>{
 await settle();run('eastAsiaSelectVersion("menremoi");player=3;setup();started=true;setAppScreen("game");cam.z=1;sound=false');await settle();
 const expected={0:['gardara-rifle-idle.png','gardara-rifle-fire.png'],8:['gardara-grenadier-idle.png','gardara-grenadier-fire.png'],9:['gardara-antitank-idle.png','gardara-antitank-fire.png'],10:['gardara-machinegun.png','gardara-machinegun.png'],1:['gardara-tank.png','gardara-tank.png'],14:['gardara-elite.png','gardara-elite.png'],2:['gardara-artillery.png','gardara-artillery-fire.png'],3:['baek-ml-idle.png','baek-ml-idle.png'],11:['baek-motorized-right.png','baek-motorized-right.png'],12:['baek-armored-car.webp','baek-armored-car.webp'],15:['baek-mortar-idle.png','baek-mortar-idle.png'],16:['baek-towed-idle.png','baek-towed-idle.png']};
 run('globalThis.gardaraPainted=[];globalThis.gardaraOriginalDrawImage=ctx.drawImage;ctx.drawImage=function(im,...args){gardaraPainted.push({src:im.src,args});return gardaraOriginalDrawImage(im,...args)}');
 try{
 for(const [type,files]of Object.entries(expected))for(const side of [-1,1])for(const firing of [false,true]){
  run('units=[];moving=[];fx=[];fireMotions.clear();globalThis.probe=makeUnit(3,'+type+',cities.find(q=>q.f===3).tile,1);probe.rifleFacing=probe.tankFacing='+side+';probe.angle='+side+'===1?0:Math.PI;gardaraPainted=[]');
  if(firing)run('beginAim(probe,{x:pxy(probe.tile).x+'+side+'*200,y:pxy(probe.tile).y},100);launchShot(probe,{x:pxy(probe.tile).x+'+side+'*200,y:pxy(probe.tile).y},performance.now()-20,520)');
  run('sprite(probe,pxy(probe.tile),performance.now())');
  const calls=JSON.parse(run('JSON.stringify(gardaraPainted)'));
  assert(calls.some(c=>c.src===files[firing?1:0]),'actual '+(firing?'firing':'idle')+' draw for type '+type+' side '+side+': '+JSON.stringify(calls));
  assert(!calls.some(c=>c.src?.startsWith('eastasia-nk-')),'no North Korean image');
 }
 assert(run('armoredCarArt[3]===armoredCarArt[GARDARA]'));
 run('fireMotions.clear();units=[];ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle="#6d8b80";ctx.fillRect(0,0,1280,800)');
 for(const [i,type]of Object.keys(expected).entries()){
  run('globalThis.previewUnit=makeUnit(3,'+type+',cities.find(q=>q.f===3).tile,1);previewUnit.rifleFacing=previewUnit.tankFacing=1;globalThis.previewPoint=pxy(previewUnit.tile);ctx.save();ctx.translate('+(160+(i%4)*320)+','+(105+Math.floor(i/4)*260)+');ctx.scale(2.3,2.3);ctx.translate(-previewPoint.x,-previewPoint.y);sprite(previewUnit,previewPoint,performance.now());ctx.restore()');
 }
 fs.mkdirSync(path.join(__dirname,'east-asia-previews'),{recursive:true});fs.writeFileSync(path.join(__dirname,'east-asia-previews/gardara-actual-sprites.png'),main.toBuffer('image/png'));

 }finally{run('ctx.drawImage=gardaraOriginalDrawImage')}
 run('eastAsiaSelectVersion("normal")');assert(run('armoredCarArt[3]===eastAsiaOriginalNorthArmoredArt'));
 console.log('PASS 48 actual Gardara idle/firing/left/right sprite draws, including rifle infantry, original shared vehicle image references and restored normal armored cars');
})().catch(e=>{console.error(e);process.exit(1)});
`)(require,__dirname);

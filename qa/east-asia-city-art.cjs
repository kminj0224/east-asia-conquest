'use strict';
// Exercise the loaded renderer, rather than a standalone imitation of its art.
const fs=require('fs'),path=require('path');
const source=fs.readFileSync(path.join(__dirname,'east-asia.cjs'),'utf8');
new Function('require','__dirname',source.slice(0,source.indexOf('\n(async()=>{'))+`
(async()=>{
 await settle();run('setup();started=true;setAppScreen("game");cam.z=1;sound=false;');await settle();
 const regularKeys=new Set(),capitalKeys=new Set();
 for(const f of [0,1,2,3,4,5])for(const level of [1,2,3,4,5])for(const capital of [false,true]){
  run('globalThis.cityProbe={...cities.find(q=>q.origin==='+f+'&&q.capital),origin:'+f+',f:'+f+',level:'+level+',capital:'+capital+',airport:false,aa:false,lab:false,harbor:false,launcher:false};cityProbe.hp=cityMaxHp(cityProbe);globalThis.cityPaints=[];globalThis.oldCityImage=ctx.drawImage;ctx.drawImage=function(im,...args){if(im.src?.startsWith("eastasia-city-"))cityPaints.push({src:im.src,args,m:ctx.getTransform()});return oldCityImage(im,...args)}');
  try{
   run('citySprite(cityProbe,{x:300,y:300});');assert.equal(run('cityPaints.length'),1,'exactly one illustrated city body');
   const a=run('eastAsiaCityProfile(cityProbe)'),box=run('eastAsiaCityBox(cityProbe)');
   (capital?capitalKeys:regularKeys).add(a.key);
   const paint=run('cityPaints[0]');assert.deepEqual(paint.args.slice(0,4),a.crop,'real draw uses recorded atlas crop');
   assert(Math.abs(box.w/box.h-a.crop[2]/a.crop[3])<1e-9,'no distorted architectural aspect');
   assert.equal(box.y+box.h,10,'all tiers share the same road ground anchor');
   assert.equal(run('cityBuildingLayout(cityProbe).starY'),box.y-3,'stars clear the actual roof');
   run('cityProbe.f=(cityProbe.f+1)%6;');assert.equal(run('eastAsiaCityProfile(cityProbe).key'),a.key,'capture preserves founding capital landmark');
   if(capital){assert(a.width>=96,'capitals retain L5 metropolis footprint at all levels');assert(a.landmark);}
  }finally{run('ctx.drawImage=oldCityImage')}
 }
 assert.equal(regularKeys.size,5,'five distinct common city bodies');assert.equal(capitalKeys.size,6,'six distinct capital bodies');
 assert.equal(run('eastAsiaCityProfile({origin:1,f:1,capital:true,level:1}).landmark'),'자금성');
 assert.equal(run('eastAsiaCityProfile({origin:5,f:5,capital:true,level:1}).city'),'블라디보스토크');
 const widths=[1,2,3,4,5].map(level=>run('eastAsiaCityBox({origin:0,capital:false,level:'+level+'}).w'));
 for(let i=1;i<widths.length;i++)assert(widths[i]>widths[i-1],'level upgrades visibly increase footprint');
 // Facility and damage paths are still native and use the exact same q state.
 run('globalThis.cityFacilityCalls=0;globalThis.cityFireCalls=0;globalThis.oldCityAirport=drawAirport;globalThis.oldCityFire=drawCityFire;drawAirport=function(){cityFacilityCalls++;return oldCityAirport()};drawCityFire=function(...args){cityFireCalls++;return oldCityFire(...args)};cityProbe.airport=true;cityProbe.aa=cityProbe.lab=cityProbe.harbor=cityProbe.launcher=true;cityProbe.hp=1;');
 try{run('citySprite(cityProbe,{x:300,y:300})');assert.equal(run('cityFacilityCalls'),1);assert.equal(run('cityFireCalls'),1);}finally{run('drawAirport=oldCityAirport;drawCityFire=oldCityFire')}
 run('globalThis.cityAtlas=eastAsiaCityAtlases.levels;globalThis.cityWasReady=cityAtlas.idleReady;cityAtlas.idleReady=false;');
 try{run('citySprite({...cityProbe,capital:false},{x:300,y:300})');}finally{run('cityAtlas.idleReady=cityWasReady')}
 // Reproducible comparison, rendered by the production city sprite at map scale x2.
 main.width=1800;main.height=1180;
 run('ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle="#6d8b80";ctx.fillRect(0,0,1800,1180);cam.z=1;globalThis.citySheet=(q,x,y,label)=>{ctx.save();ctx.translate(x,y);ctx.scale(2.5,2.5);citySprite({...q,airport:false,aa:false,lab:false,harbor:false,launcher:false,hp:cityMaxHp(q)},{x:0,y:0});ctx.restore();ctx.textAlign="center";ctx.font="bold 25px Terha,sans-serif";ctx.fillStyle="#fff3d4";ctx.fillText(label,x,y+66)};for(let level=1;level<=5;level++)citySheet({id:100+level,origin:0,f:0,level,capital:false},180+(level-1)*360,280,"L"+level);for(let f=0;f<6;f++){const q=cities.find(q=>q.origin===f&&q.capital);citySheet(q,300+(f%3)*600,650+Math.floor(f/3)*390,["Seoul / Gwanghwamun","Beijing / Forbidden City","Tokyo / Tokyo Tower","Pyongyang / Juche Tower","Taipei / Taipei 101","Vladivostok / Golden Bridge"][f])}');
 fs.mkdirSync(path.join(__dirname,'east-asia-previews'),{recursive:true});
 fs.writeFileSync(path.join(__dirname,'east-asia-previews/modern-cities.png'),main.toBuffer('image/png'));
 main.width=1280;main.height=800;
 run('player=0;setup();units=[];selected=null;panelOpen=false;focusCapital();draw(performance.now()+1000)');await settle();run('draw(performance.now()+1100)');
 fs.writeFileSync(path.join(__dirname,'east-asia-previews/modern-seoul-map.png'),main.toBuffer('image/png'));
 assert.equal(reads,0,'no runtime pixel readback');assert.deepEqual(errors,[]);
 console.log('PASS 60 founding-country/level/capital states, 11 distinct bodies, capture-stable landmarks, exact atlas transforms, road anchors, roof stars, native facilities/fire and image-load fallback');process.exit(0);
})().catch(e=>{console.error(e);process.exit(1)});
`)(require,__dirname);

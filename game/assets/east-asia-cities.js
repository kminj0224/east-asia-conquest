'use strict';
// Three original transparent atlases, eleven offline sprite regions. No runtime
// pixel scans or image conversion. Founding origin owns architecture; q.f owns flags.
const eastAsiaCityAtlases=Object.fromEntries(Object.entries(EAST_ASIA_CITY_DATA.files).map(([key,row])=>[key,loadBaekArt(row.file)]));
function eastAsiaCityProfile(q){
 const level=Math.max(1,Math.min(5,Math.trunc(Number(q.level))||1));
 const origin=q.eastAsiaFoundingOrigin??q.origin;
 const key=q.capital&&EAST_ASIA_CITY_DATA.sprites['capital-'+origin]?'capital-'+origin:'level-'+level;
 const row=EAST_ASIA_CITY_DATA.sprites[key];
 return{...row,key,art:eastAsiaCityAtlases[row.atlas],width:row.drawWidth};
}
function eastAsiaCityBox(q){
 const a=eastAsiaCityProfile(q),h=a.width*a.crop[3]/a.crop[2];
 return{x:-a.width/2,y:10-h,w:a.width,h,bottom:10};
}
function eastAsiaCitySprite(q,p){
 const a=eastAsiaCityProfile(q);
 if(!a.art.idleReady)return cityArtSprite(q,p);
 const box=eastAsiaCityBox(q);
 ctx.save();ctx.translate(p.x,p.y);
 ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 ctx.drawImage(a.art.idle,...a.crop,box.x,box.y,box.w,box.h);
 // The existing foreground pass draws city names, queues and durability above
 // all bodies; stars and facilities keep their original zoom and state gates.
 if(q.airport)drawAirport();
 if(cam.z>.45){
  ctx.font='bold 11px Terha,sans-serif';ctx.textAlign='center';ctx.lineWidth=3;
  ctx.strokeStyle='#153039';ctx.strokeText('★'.repeat(q.level),0,box.y-3);
  ctx.fillStyle='#f6d483';ctx.fillText('★'.repeat(q.level),0,box.y-3);
 }
 if(q.aa){rect(-31,-13,9,6,'#687d75');line(-28,-14,-21,-22,'#dde3c2',2)}
 if(q.lab){rect(box.w/2+3,-27,12,20,'#92b6bb');circle(box.w/2+9,-28,7,'#cae0d8')}
 if(q.harbor)line(-30,12,24,12,'#a7b8b3',2);
 if(q.launcher){rect(box.w/2,-4,18,6,'#63736b');line(box.w/2+7,-5,box.w/2+16,-23,'#c9d3c1',4)}
 ctx.restore();drawCityFire(q,p,lastTime);
}
function installEastAsiaCityArt(){
 photoCityProfile=eastAsiaCityProfile;photoCityBox=eastAsiaCityBox;
 cityBuildingLayout=function(q){const box=eastAsiaCityBox(q);return{...cityArtBuildingLayout(q),top:box.y,starY:box.y-3}};
 citySprite=eastAsiaCitySprite;
 Object.assign(window.Terha,{photoCityProfile,photoCityBox,cityBuildingLayout,eastAsiaCityProfile,eastAsiaCityBox,eastAsiaCitySprite});
}

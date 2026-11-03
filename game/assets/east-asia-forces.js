'use strict';
// Land totals are separate from starting fleets. Stable type IDs stay reserved.
const EAST_ASIA_STARTING_ARMIES={
 0:{total:30,armor:[[14,3],[1,3],[2,3]]},
 1:{total:30,armor:[[1,5],[2,5]]},
 2:{total:16,armor:[[1,2],[2,2]]},
 3:{total:40,armor:[[1,10]]}
};
function eastAsiaRetireLightTanks(){
 for(const u of units)if(u.type===13){const ratio=u.hp/unitMaxHp(u);u.type=1;u.hp=unitMaxHp(u)*Math.max(0,Math.min(1,ratio))}
 for(const q of cities)if(q.queue?.type===13)q.queue.type=1;
}
function eastAsiaStartingForces(){
 eastAsiaRetireLightTanks();
 // Keep other countries' fleets; Korea has exactly one destroyer, NK only FACs.
 const destroyer=units.find(u=>u.f===0&&u.type===24);
 const removed=new Set(units.filter(u=>u.f===0&&isNaval(u)&&u!==destroyer||u.f===3&&isNaval(u)&&u.type!==22).map(u=>u.id));
 units=units.filter(u=>!removed.has(u.id)&&!removed.has(u.carriedBy)&&!(u.f<4&&!isNaval(u)));
 if(!destroyer){
  const ports=cities.filter(q=>q.f===0&&q.harbor),sea=tiles.findIndex((t,i)=>t.owner<0&&!unitAt(i)&&ports.some(q=>distance(q.tile,i)<=3));
  if(sea<0)throw Error('No Korean destroyer starting berth');
  makeUnit(0,24,sea,1);
 }
 const northKoreanLand=tiles.flatMap((t,i)=>MAP.tiles[i][0]===3?[i]:[]);
 const borderDistance=new Map();
 for(const [key,roster]of Object.entries(EAST_ASIA_STARTING_ARMIES)){
  const f=Number(key),home=cities.filter(q=>q.f===f),capital=home.find(q=>q.capital)||home[0],placed=[];
  const sites=tiles.flatMap((t,i)=>t.owner===f&&t.terrain!==3&&(t.terrain!==4||t.city>=0)&&!unitAt(i)?[i]:[]);
  const cityDistances=new Map(sites.map(i=>[i,Math.min(...home.map(q=>distance(i,q.tile)))]));
  const candidates=sites.filter(i=>cityDistances.get(i)<=3);
  if(f===1)for(const i of sites)borderDistance.set(i,Math.min(...northKoreanLand.map(j=>distance(i,j))));
  const front=f===1?sites.filter(i=>borderDistance.get(i)<=5):null;
  function place(type,atFront=false){
   const pool=atFront?front:candidates;
   let best=-1,bestScore=-Infinity;
   for(const i of pool){
    if(unitAt(i))continue;
    const gap=placed.length?Math.min(...placed.map(j=>distance(i,j))):0;
    const score=placed.length?gap*10-(atFront?borderDistance.get(i)*.3:cityDistances.get(i)*.2):-distance(i,atFront?front[0]:capital.tile);
    if(score>bestScore){best=i;bestScore=score}
   }
   if(best<0)throw Error('Insufficient starting sites for faction '+f);
   const u=makeUnit(f,type,best,1);u.initialEastAsiaArmy=true;placed.push(best);
  }
  for(const [type,count]of roster.armor)for(let n=0;n<count;n++)place(type,f===1);
  const infantry=[0,8,0,9,0,10];
  for(let n=placed.length;n<roster.total;n++)place(infantry[(n-roster.armor.reduce((sum,v)=>sum+v[1],0))%infantry.length]);
 }
 faceInitialArmy();
}
Object.assign(window.Terha,{eastAsiaStartingForces,eastAsiaRetireLightTanks});

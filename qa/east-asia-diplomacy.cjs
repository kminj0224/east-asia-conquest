'use strict';
const fs=require('fs'),path=require('path');
const source=fs.readFileSync(path.join(__dirname,'east-asia.cjs'),'utf8');
const prefix=source.slice(0,source.indexOf('\n(async()=>{'));
new Function('require','__dirname',prefix+`
(async()=>{
 await settle();run('player=0;setup();started=true;setAppScreen("game");menuMode=false');await settle();
 for(const [a,c,state]of [[0,2,'neutral'],[0,3,'war'],[0,1,'neutral'],[1,3,'ally'],[1,2,'neutral'],[2,3,'neutral']])assert.equal(run('diplomacy['+a+']['+c+']'),state);
 assert.equal(run('eastAsiaNorthCities().length'),14);
 // Japan invests in city upgrades without creating units, queues or free transports.
 run('money[2]=50000;food[2]=50000;oil[2]=50000;globalThis.jpLevels=cities.filter(q=>q.f===2).reduce((n,q)=>n+q.level,0);globalThis.jpUnits=units.filter(u=>u.f===2).length;aiProcure(2,cities.filter(q=>q.f===2));prepareAITransports(2,cities.filter(q=>q.f===2))');
 assert(run('cities.filter(q=>q.f===2).reduce((n,q)=>n+q.level,0)>jpLevels'));
 assert(run('units.filter(u=>u.f===2).length===jpUnits&&!cities.some(q=>q.f===2&&q.queue)'));
 assert(!run('canProduce(cities.find(q=>q.f===2&&q.capital),0,1)'));
 // A war with any country mobilizes Japanese AI permanently, without the later buff.
 run('eastAsiaWar(2,4,false);eastAsiaEvaluateDiplomacy(false);aiProcure(2,cities.filter(q=>q.f===2))');
 assert(run('eastAsiaDiplomacyState.japanMobilized&&cities.some(q=>q.f===2&&q.queue)'));
 assert(!run('eastAsiaDiplomacyState.unified'));
 // China recruits while still allied to NK, then moves inland troops to its border.
 run('setup();started=true;globalThis.cnUnit=units.find(u=>u.f===1&&u.type===0);globalThis.northBorder=eastAsiaNorthCities().map(q=>q.tile);globalThis.cnBefore=Math.min(...northBorder.map(i=>distance(cnUnit.tile,i)));freshOrders(cnUnit);globalThis.cnAct=aiStep(cnUnit,cities)');
 assert(run('cnAct?.move!==undefined'),'China must rally in peacetime');
 assert(run('tiles[cnAct.move].owner===1&&Math.min(...northBorder.map(i=>distance(cnAct.move,i)))<cnBefore'));
 run('food[1]=100000;oil[1]=100000;money[1]=100000;aiProcure(1,cities.filter(q=>q.f===1))');
 assert(run('cities.some(q=>q.f===1&&q.queue)&&!atWar(1,0)&&!atWar(1,3)'));
 // Fewer than four lost northern cities must not trigger intervention.
 run('globalThis.north=eastAsiaNorthCities();north[0].f=0;north[1].f=0;north[2].f=2;eastAsiaEvaluateDiplomacy(false)');
 assert(!run('eastAsiaDiplomacyState.chinaIntervened'));
 // Split 2+2 counts in aggregate: China attacks NK and BOTH occupying countries.
 run('north[3].f=2;eastAsiaEvaluateDiplomacy(false)');
 assert(run('eastAsiaDiplomacyState.chinaIntervened&&atWar(1,3)&&atWar(1,0)&&atWar(1,2)'));
 assert(!run('atWar(1,4)'));
 run('globalThis.cnTarget=danteUnitObjective(cnUnit)');assert(run('eastAsiaNorthCities().includes(cnTarget)&&atWar(1,cnTarget.f)'));
 // Other human player countries never receive automatic wars, quiet-AI gates or buffs.
 for(const f of [1,2,3,4,5]){
  run('player='+f+';setup();started=true;eastAsiaNorthCities().forEach(q=>q.f=0);eastAsiaEvaluateDiplomacy(false)');
  assert(!run('eastAsiaDiplomacyState.chinaIntervened||eastAsiaDiplomacyState.unified||eastAsiaDiplomacyState.unificationAvailable'));
  assert.equal(run('diplomacy[1][3]'),'ally');assert.equal(run('diplomacy[1][0]'),'neutral');
  assert.equal(run('eastAsiaUnify()'),false);
 }
 // Even with zero cities remaining to NK, a Japanese-held ORIGINAL city blocks unification.
 run('player=0;setup();started=true;menuMode=false;globalThis.north=eastAsiaNorthCities();north.forEach(q=>q.f=0);north.at(-1).f=2;buildRegions();money[0]=50000;updateHUD()');
 assert(run('!cities.some(q=>q.f===3)&&!eastAsiaOwnsAllNorth()&&!eastAsiaDiplomacyState.unificationAvailable'));
 assert.equal(nodes.get('eastAsiaUnify').style.display,'none');assert.equal(run('eastAsiaUnify()'),false);
 // Insufficient funds do not consume resources. The button stays available after No.
 run('north.at(-1).f=0;buildRegions();money[0]=29999;updateHUD()');
 assert.equal(nodes.get('eastAsiaUnify').style.display,'inline-flex');assert(nodes.get('eastAsiaUnify').disabled);
 assert.equal(run('eastAsiaShowUnification()'),false);assert.equal(run('money[0]'),29999);
 run('money[0]=50000;updateHUD();globalThis.beforeJapan=cityYield(cities.find(q=>q.f===2));globalThis.geoBefore=tiles.map(t=>[t.region,t.owner]);eastAsiaShowUnification()');
 assert(nodes.get('modal').textContent.includes('통일하시겠습니까?'));
 await click('unificationNo');assert.equal(run('money[0]'),50000);assert.equal(nodes.get('eastAsiaUnify').style.display,'inline-flex');
 assert.equal(run('factions[0].name'),'대한민국');assert(!run('atWar(2,0)'));
 run('eastAsiaShowUnification()');await click('unificationYes');await settle();
 assert.equal(run('money[0]'),20000);assert.equal(run('factions[0].name'),'고려연방');
 assert(run('eastAsiaDiplomacyState.unified&&atWar(2,0)&&eastAsiaDiplomacyState.japanMobilized'));
 assert.equal(run('eastAsiaFlagPath(0)'),'eastasia-goryeo-flag.png');assert.equal(run('flagImages[0].src'),'eastasia-goryeo-flag.png');
 assert(nodes.get('resources').innerHTML.includes('eastasia-goryeo-flag.png'));
 assert(run('eastAsiaNorthCities().length===14&&eastAsiaNorthCities().every(q=>q.origin===0&&!occupiedCity(q))'));
 assert(run('tiles.every((t,i)=>t.owner===geoBefore[i][1]&&t.region===geoBefore[i][0])'),'homeland conversion preserves geographical regions');
 assert.equal(run('eastAsiaCityProfile(eastAsiaNorthCities().find(q=>q.capital)).key'),'capital-3');
 run('globalThis.northHome=eastAsiaNorthCities()[0];northHome.level=5;cityProfile(northHome)');
 assert(run('canProduce(northHome,0,1)&&homelandSources(northHome).includes(northHome)'));
 for(const key of ['money','food','oil'])assert(Math.abs(run('cityYield(cities.find(q=>q.f===2)).'+key)-run('beforeJapan.'+key)*3)<1e-8);
 assert.equal(run('eastAsiaUnify()'),false);assert.equal(run('money[0]'),20000);
 // State survives slot reload; loading it never repeats the payment or resource multiplier.
 run('save(1);setup()');assert.equal(run('factions[0].name'),'대한민국');
 const loaded=await drain(run('load(1)'));assert(loaded);await settle();
 assert.equal(run('factions[0].name'),'고려연방');assert.equal(run('money[0]'),20000);
 assert(run('atWar(2,0)&&eastAsiaDiplomacyState.chinaIntervened&&eastAsiaNorthCities().every(q=>q.origin===0)'));
 assert(run('eastAsiaFlagPath(0)==="eastasia-goryeo-flag.png"&&canProduce(eastAsiaNorthCities()[0],0,1)'));
 assert.equal(nodes.get('eastAsiaUnify').style.display,'none');
 assert.equal(reads,0);assert.deepEqual(errors,[]);
 console.log('PASS specified diplomacy, peaceful Japanese upgrades, mobilization, Chinese recruitment/rally and 2+2 intervention, immutable 14-city unification including foreign occupiers, No/Yes/payment, homeland production/regions, original PNG flag, 3x Japanese yields, human-player exclusions and save/load');process.exit(0);
})().catch(e=>{console.error(e);process.exit(1)});
`)(require,__dirname);

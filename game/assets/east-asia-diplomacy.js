'use strict';
let eastAsiaVersion='normal';
const EAST_ASIA_UNIFICATION_COST=30000;
// This immutable founding roster includes northern cities held by ANY occupier.
const EAST_ASIA_NORTH_CITY_TILES=new Set(MAP.countryCities[3].map(q=>q.tile));
const eastAsiaBaseKoreanName=factions[0].name;
const eastAsiaKoreanFlag=new Image(),eastAsiaGoryeoFlag=new Image();
eastAsiaKoreanFlag.src='flag-0.png';eastAsiaGoryeoFlag.src='eastasia-goryeo-flag.png';
function eastAsiaFreshDiplomacyState(){return{schema:1,chinaIntervened:false,japanMobilized:false,unificationAvailable:false,unified:false}}
let eastAsiaDiplomacyState=eastAsiaFreshDiplomacyState(),eastAsiaRallySites=null;
function eastAsiaKoreanScenario(){return eastAsiaVersion==='normal'&&player===0&&!activeScenario}
function eastAsiaNorthCities(){return cities.filter(q=>q.origin===3||EAST_ASIA_NORTH_CITY_TILES.has(q.tile)||q.eastAsiaFoundingOrigin===3)}
function eastAsiaOwnsAllNorth(){const original=eastAsiaNorthCities();return original.length===EAST_ASIA_NORTH_CITY_TILES.size&&original.every(q=>q.f===0)}
function eastAsiaInitialDiplomacy(){
 const result=factions.map((_,a)=>factions.map((_,b)=>a===b?'self':'neutral'));
 if(eastAsiaVersion!=='blue-plum-2'){result[0][3]=result[3][0]='war';result[1][3]=result[3][1]='ally';}return result;
}
function eastAsiaFlagPath(f){if(eastAsiaVersion==='menremoi'&&f===3)return 'eastasia-gardara-flag.jpg';return f===0&&eastAsiaKoreanScenario()&&eastAsiaDiplomacyState.unified?'eastasia-goryeo-flag.png':'flag-'+f+(f===7?'.jpg':[3,6].includes(f)?'.svg':'.png')}
function eastAsiaApplyIdentity(){
 const unified=eastAsiaKoreanScenario()&&eastAsiaDiplomacyState.unified;
 factions[0].name=unified?'고려연방':eastAsiaVersion==='blue-plum-2'?'대한조선국':eastAsiaBaseKoreanName;
 flagImages[0]=unified?eastAsiaGoryeoFlag:eastAsiaKoreanFlag;
}
function eastAsiaWar(a,b,notify=true){
 if(a===b||atWar(a,b))return false;
 diplomacy[a][b]=diplomacy[b][a]='war';aiObjectives.fill(null);danteFrontPlan=null;danteExpansionPlan=null;
 if(notify){const message=factions[a].name+' · '+factions[b].name+'에 선전포고';log(message);worldNotice(message)}
 return true;
}
function eastAsiaEvaluateDiplomacy(notify=true){
 if(!eastAsiaKoreanScenario())return;
 const north=eastAsiaNorthCities(),occupied=north.filter(q=>q.f!==3);
 if(!eastAsiaDiplomacyState.chinaIntervened&&occupied.length>=4){
  eastAsiaDiplomacyState.chinaIntervened=true;eastAsiaWar(1,3,notify);
 }
 if(eastAsiaDiplomacyState.chinaIntervened){
  for(const owner of new Set(occupied.map(q=>q.f)))if(owner!==1&&owner!==3)eastAsiaWar(1,owner,notify);
 }
 if(eastAsiaOwnsAllNorth())eastAsiaDiplomacyState.unificationAvailable=true;
 if(diplomacy[2].some(v=>v==='war'))eastAsiaDiplomacyState.japanMobilized=true;
}
function eastAsiaJapanQuiet(){return eastAsiaKoreanScenario()&&!eastAsiaDiplomacyState.japanMobilized&&!diplomacy[2].some(v=>v==='war')}
function eastAsiaRefreshUnificationButton(){
 const button=$('eastAsiaUnify');if(!button)return;
 const visible=started&&eastAsiaKoreanScenario()&&eastAsiaDiplomacyState.unificationAvailable&&!eastAsiaDiplomacyState.unified;
 button.style.display=visible?'inline-flex':'none';
 button.disabled=busy||money[0]<EAST_ASIA_UNIFICATION_COST||!eastAsiaOwnsAllNorth();
 button.title='북한 원래 본토 도시 전부 소유 · 골드 30,000';
}
function eastAsiaCloseUnification(){menuMode=false;$('modal').style.display='none';refreshSelection();updateHUD()}
function eastAsiaUnify(){
 if(!eastAsiaKoreanScenario()||busy||!started||eastAsiaDiplomacyState.unified||!eastAsiaOwnsAllNorth()||money[0]<EAST_ASIA_UNIFICATION_COST)return false;
 money[0]-=EAST_ASIA_UNIFICATION_COST;
 for(const q of eastAsiaNorthCities()){q.eastAsiaFoundingOrigin=3;q.origin=0;cityProfile(q)}
 eastAsiaDiplomacyState.unified=true;eastAsiaDiplomacyState.japanMobilized=true;
 eastAsiaApplyIdentity();supplyTopology=null;buildRegions();eastAsiaWar(2,0);
 eastAsiaCloseUnification();save();return true;
}
function eastAsiaShowUnification(){
 if(!eastAsiaKoreanScenario()||busy||!started||eastAsiaDiplomacyState.unified||!eastAsiaOwnsAllNorth())return false;
 if(money[0]<EAST_ASIA_UNIFICATION_COST){toast('통일 비용: 골드 30,000');return false}
 menuMode=true;$('modal').style.display='flex';
 $('modal').innerHTML='<div class="box unificationDialog" role="dialog" aria-modal="true" aria-labelledby="unificationHeading"><h1 id="unificationHeading">통일하시겠습니까?</h1><p>골드 30,000을 사용하여 고려연방을 수립합니다.</p><div class="unificationChoices"><button class="gold" id="unificationYes">예</button><button id="unificationNo">아니오</button></div></div>';
 $('unificationYes').onclick=eastAsiaUnify;$('unificationNo').onclick=eastAsiaCloseUnification;return true;
}
function eastAsiaChinaRallyAction(u){
 if(u.carriedBy||isNaval(u)||isAircraft(u)||isHelicopter(u)||!mayMove(u))return null;
 if(!eastAsiaRallySites){
  const border=tiles.flatMap((t,i)=>MAP.tiles[i][0]===1&&neighbors(i).some(j=>MAP.tiles[j][0]===3)?[i]:[]);
  eastAsiaRallySites=tiles.flatMap((t,i)=>MAP.tiles[i][0]===1&&t.terrain!==3&&t.terrain!==4&&border.some(j=>distance(i,j)<=2)?[i]:[]);
 }
 const sites=eastAsiaRallySites.filter(i=>tiles[i].owner===1&&(!unitAt(i)||unitAt(i).id===u.id));
 if(!sites.length)return null;
 const goal=sites[mixSeed(u.id*173)%sites.length],r=reachable(u).costs;
 let best=u.tile,score=distance(u.tile,goal);
 for(const [i,cost]of r)if(tiles[i].owner===1){const value=distance(i,goal)+cost*.001;if(value<score){score=value;best=i}}
 return best===u.tile?null:{move:best};
}
function eastAsiaChinaProcure(owned){
 const f=1,weights={0:4,1:2,2:2,8:1,9:1,10:1,14:.5};
 const counts=k=>units.filter(u=>u.f===f&&u.type===k).length+cities.filter(q=>q.f===f&&q.queue?.type===k).length;
 const north=eastAsiaNorthCities();
 const homes=owned.filter(q=>q.f===f&&!occupiedCity(q)&&!q.queue&&!q.produced).sort((a,b)=>Math.min(...north.map(q=>distance(a.tile,q.tile)))-Math.min(...north.map(q=>distance(b.tile,q.tile)))||a.id-b.id);
 for(const q of homes){
  const pool=Object.keys(weights).map(Number).sort((a,b)=>counts(a)/weights[a]-counts(b)/weights[b]||a-b);
  pool.some(k=>aiQueueUnit(f,q,k,1));
 }
}
function installEastAsiaDiplomacy(){
 const previousSetup=setup;
 setup=function(...args){eastAsiaDiplomacyState=eastAsiaFreshDiplomacyState();eastAsiaRallySites=null;eastAsiaApplyIdentity();const result=previousSetup(...args);eastAsiaEvaluateDiplomacy(false);eastAsiaRefreshUnificationButton();save();return result};
 const previousSnapshot=snapshot;
 snapshot=function(){return{...previousSnapshot(),eastAsiaDiplomacyState:{...eastAsiaDiplomacyState}}};
 const previousMigration=migrateArmy;
 migrateArmy=function(s){
  const saved=s.eastAsiaDiplomacyState;
  eastAsiaDiplomacyState=eastAsiaFreshDiplomacyState();
  if(saved?.schema===1)for(const k of ['chinaIntervened','japanMobilized','unificationAvailable','unified'])eastAsiaDiplomacyState[k]=saved[k]===true;
  eastAsiaRallySites=null;eastAsiaApplyIdentity();const result=previousMigration(s);eastAsiaEvaluateDiplomacy(false);eastAsiaRefreshUnificationButton();return result;
 };
 const previousHUD=updateHUD;
 updateHUD=function(...args){eastAsiaEvaluateDiplomacy();eastAsiaApplyIdentity();const result=previousHUD(...args);eastAsiaRefreshUnificationButton();return result};
 const previousCapture=capture;
 capture=function(...args){const result=previousCapture(...args);eastAsiaEvaluateDiplomacy();eastAsiaRefreshUnificationButton();return result};
 const previousProcure=aiProcure;
 aiProcure=function(f,owned){
  eastAsiaEvaluateDiplomacy();
  if(eastAsiaKoreanScenario()&&f===1)return eastAsiaChinaProcure(owned);
  if(f===2&&eastAsiaJapanQuiet())return aiUpgradeCities(f,owned);
  return previousProcure(f,owned);
 };
 const previousReserve=aiUpgradeReserve;
 aiUpgradeReserve=function(f,owned){return f===2&&eastAsiaJapanQuiet()?Infinity:previousReserve(f,owned)};
 const previousProduction=canProduce;
 canProduce=function(q,k,l=1){return !(q?.f===2&&eastAsiaJapanQuiet())&&previousProduction(q,k,l)};
 const previousTransports=prepareAITransports;
 prepareAITransports=function(f,owned){if(f===2&&eastAsiaJapanQuiet()||f===1&&eastAsiaKoreanScenario()&&!eastAsiaDiplomacyState.chinaIntervened)return;return previousTransports(f,owned)};
 const previousStrategic=aiStrategicOperations;
 aiStrategicOperations=function(f,...args){if(f===2&&eastAsiaJapanQuiet())return;return previousStrategic(f,...args)};
 const previousStep=aiStep;
 aiStep=function(u,targets){
  eastAsiaEvaluateDiplomacy();
  if(eastAsiaKoreanScenario()&&u.f===1&&!eastAsiaDiplomacyState.chinaIntervened&&!diplomacy[1].includes('war'))return eastAsiaChinaRallyAction(u);
  return previousStep(u,targets);
 };
 const previousTransportCandidate=transportCandidate;
 transportCandidate=function(u){if(eastAsiaKoreanScenario()&&u.f===1&&!isNaval(u))return false;return previousTransportCandidate(u)};
 const previousObjective=danteUnitObjective;
 danteUnitObjective=function(u){
  if(eastAsiaKoreanScenario()&&u.f===1&&eastAsiaDiplomacyState.chinaIntervened){const goals=eastAsiaNorthCities().filter(q=>atWar(1,q.f));if(goals.length)return goals.reduce((a,b)=>distance(u.tile,a.tile)<=distance(u.tile,b.tile)?a:b)}
  return previousObjective(u);
 };
 const previousYield=cityYield;
 cityYield=function(q,level=q.level){const y=previousYield(q,level);if(!eastAsiaKoreanScenario()||!eastAsiaDiplomacyState.unified||q.f!==2)return y;return{...y,money:y.money*3,food:y.food*3,oil:y.oil*3}};
 $('eastAsiaUnify').onclick=eastAsiaShowUnification;
 Object.assign(APP_EN,{'고려연방':'Goryeo Federation','통일하시겠습니까?':'Unify the country?','통일 · 30,000':'Unify · 30,000'});
 eastAsiaApplyIdentity();
 Object.assign(window.Terha,{setup,snapshot,migrateArmy,updateHUD,capture,aiProcure,aiUpgradeReserve,canProduce,prepareAITransports,aiStrategicOperations,aiStep,transportCandidate,danteUnitObjective,cityYield,eastAsiaInitialDiplomacy,eastAsiaNorthCities,eastAsiaOwnsAllNorth,eastAsiaEvaluateDiplomacy,eastAsiaFlagPath,eastAsiaUnify,eastAsiaShowUnification,eastAsiaChinaRallyAction,eastAsiaJapanQuiet});
}

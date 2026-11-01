"""Apply the standalone scenario to the pinned upstream engine without changing combat rules."""
import pathlib,re,json
R=pathlib.Path(__file__).resolve().parents[2];A=R/'game/assets'
def edit(name,fn):
 p=A/name;p.write_text(fn(p.read_text()))
names=['대한민국','중화인민공화국','일본','조선민주주의인민공화국','중화민국','러시아','몽골','베트남']
colors=['#26944c','#d63232','#92989e','#e8c83e','#286cda','#53aabf','#b88d58','#9b6bac']
capitals=['서울','베이징','도쿄','평양','타이베이','블라디보스토크','울란바토르','하노이']
bonuses=['보병 방어 +15%','기갑 공격 +20%','기갑 방어 +15%','도시 수입 +15%','이동 거리 +1','해군 공격 +15%','포병 공격 +15%','균형 전력']
fs=[dict(name=n,color=c,dark='#25343d',accent='#eadab2',capital=k,desc=n,bonus=b) for n,c,k,b in zip(names,colors,capitals,bonuses)]
edit('game.js',lambda s:re.sub(r'const factions=\[.*?\];', 'const factions='+json.dumps(fs,ensure_ascii=False)+';',s,count=1))
# Give every country its explicit geographic roster and standard units, including armor and artillery.
edit('game.js',lambda s:s.replace("makeUnit(f,[0,0,8,0,9,0,10,0,0][n],q.tile)","makeUnit(f,[0,1,8,2,9,13,10,16,11][n%9],q.tile)"))
edit('orders.js',lambda s:s.replace("a===b?'self':BLOCS[a]===BLOCS[b]?'ally':a===7||b===7||a===4||b===4?'neutral':'war'","a===b?'self':'neutral'").replace("대극락공영권: 백양·낙월 / 이중제국동맹: 단테·아이리아 / 기사도 동맹: 스테토피아·시엘룬<br>란나는 낙월민국과 전쟁 중이며, 다른 국가와는 중립입니다.","모든 국가는 중립 관계로 시작합니다.").replace("BLOC_NAMES[BLOCS[f]]+' · '+relationName(player,f)","relationName(player,f)"))
edit('saves.js',lambda s:s.replace("s.gardaraSchema===2&&s.cities.length===190","s.eastAsiaSchema===1&&s.cities.length===213").replace("appVersion:'1.11.94'","appVersion:'1.0.0',eastAsiaSchema:1").replace("'terha-","'eastasia-"))
# App identity and title change; layout and controls remain upstream.
for name in ['index.html','app-shell.js','app-shell.css']:
 edit(name,lambda s:s.replace('테르하 : 낙원의 기억','동아시아 콘퀘스트').replace('TERHA: MEMORIES OF PARADISE','EAST ASIA CONQUEST').replace('테르하 통일','동아시아 통일').replace('TERHA CONQUERED','EAST ASIA CONQUERED').replace("APP_VERSION='1.11.94'","APP_VERSION='1.0.0'").replace("'terha-settings'","'eastasia-settings'").replace("'terha-conquests'","'eastasia-conquests'"))
# Remove fantasy campaign entry. The conquest entry retains its original menu design.
edit('app-shell.js',lambda s:s.replace("$('campaignMode').onclick=showCampaignPicker;","$('campaignMode').style.display='none';").replace("$('campaignMode').onclick=showCampaign;","$('campaignMode').style.display='none';"))
# Old geography modifiers must never alter a real geographic cell (also during load).
edit('hansa-island.js',lambda s:re.sub(r'const HANSA_WATER_TILES=\[.*?\];','const HANSA_WATER_TILES=[];',s,count=1))
# Rendering replacement is last, before bootstrap. Geography remains a normal conquest.
edit('index.html',lambda s:s.replace('<script src="bootstrap.js">','<script src="east-asia.js"></script><script src="bootstrap.js">'))
# Android package is independent; retain full Activity class name to resolve the original DEX.
p=R/'build.py';s=p.read_text().replace("VERSION='1.11.94';CODE=239","VERSION='1.0.0';CODE=1").replace("APP_NAME='테르하 : 낙원의 기억'","APP_NAME='동아시아 콘퀘스트'").replace("'테르하: 전장의 국권':APP_NAME","'테르하: 전장의 국권':APP_NAME,'com.terha.conquest':'com.eastasia.conquest','.MainActivity':'com.terha.conquest.MainActivity'").replace("deliverables/Terha-Conquest-v","deliverables/East-Asia-Conquest-v");p.write_text(s)
(R/'package.json').write_text(json.dumps(dict(name='east-asia-conquest',version='1.0.0',private=True,scripts={'test':'node qa/east-asia.cjs'},devDependencies={'@napi-rs/canvas':'0.1.100'}),indent=2)+'\n')
print('East Asia source patch applied')

edit('rifle-art.js',lambda s:s.replace("function loadBaekArt(idlePath,firePath=idlePath){", "const geometryMarkerArt={idle:new Image(),fire:new Image(),idleReady:false,fireReady:false};\nfunction loadBaekArt(idlePath,firePath=idlePath){if(idlePath!=='ocean-material.png')return geometryMarkerArt;"))
edit('coast-art.js',lambda s:s.replace("coastArtwork.mask.src='world-natural-land.png'","coastArtwork.mask.src='' ").replace("coastArtwork.image.src='world-natural.png'","coastArtwork.image.src='' "))

(A/'ground-colors.js').write_text("'use strict';const GROUND_COLOR_RUNS={};\n")

(A/'ground-data.js').write_text("'use strict';const GROUND_DATA={step:512,scale:1,overviewScale:.25,chunks:[]};\n")

(A/'natural-ownership-data.js').write_text("'use strict';const NATURAL_OWNERSHIP={far:{},regions:{},pages:[]};\n")

(A/'map-page-ext0-data.js').write_text('// East Asia has a single bounded geographic page.\n')

# Runtime packaging is maintained as a standalone East Asia build script.

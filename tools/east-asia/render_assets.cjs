const fs=require('fs'),path=require('path');const {createCanvas,loadImage,GlobalFonts}=require('@napi-rs/canvas');
const R=path.resolve(__dirname,'../..'),A=path.join(R,'game/assets');process.chdir(R);
const map=JSON.parse(fs.readFileSync(path.join(A,'east-asia-map.json'))),S=64,V=55.43,WW=map.w*S+S/3,HH=map.h*V+V/2;
const colors=['#26944c','#d63232','#92989e','#e8c83e','#286cda','#53aabf','#b88d58','#9b6bac'];
function hex(g,x,y,r=37){g.beginPath();for(let j=0;j<6;j++){const a=(j*60+30)*Math.PI/180;const px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;j?g.lineTo(px,py):g.moveTo(px,py)}g.closePath()}
(async()=>{
GlobalFonts.registerFromPath(path.join(A,'terha.otf'),'Terha');
const sea=await loadImage(path.join(A,'ocean-material.png'));
const ground=createCanvas(Math.ceil(WW),Math.ceil(HH)),g=ground.getContext('2d');const tile=createCanvas(930,930),tg=tile.getContext('2d');tg.drawImage(sea,0,0,930,930);tg.fillStyle='#093a5b55';tg.fillRect(0,0,930,930);g.fillStyle=g.createPattern(tile,'repeat');g.fillRect(0,0,WW,HH);
const overlay=createCanvas(ground.width,ground.height),d=overlay.getContext('2d');
const forestA=await loadImage(path.join(A,'trial-forest-a.png')),forestB=await loadImage(path.join(A,'trial-forest-b.png')),mountain=await loadImage(path.join(A,'trial-mountain-low.png')),high=await loadImage(path.join(A,'trial-mountain-high.png'));
// All terrain stamps and sea materials are the retained Terha artwork, without new illustration.
for(let i=0;i<map.tiles.length;i++){const [owner,t]=map.tiles[i];if(owner<0)continue;const x=(i%map.w+.5*((i/map.w|0)%2))*S+S/3,y=(i/map.w|0)*V+V/2;hex(g,x,y);g.fillStyle=colors[owner];g.fill();g.save();hex(g,x,y);g.clip();const gradient=g.createLinearGradient(x-30,y-27,x+30,y+27);gradient.addColorStop(0,'#e9dfbc44');gradient.addColorStop(1,'#1e302e55');g.fillStyle=gradient;g.fillRect(x-40,y-40,80,80);g.restore();}
for(let i=0;i<map.tiles.length;i++){const [owner,t]=map.tiles[i];if(owner<0||t<2||t===4)continue;const x=(i%map.w+.5*((i/map.w|0)%2))*S+S/3,y=(i/map.w|0)*V+V/2;d.save();hex(d,x,y,36);d.clip();if(t===2){d.drawImage(i%2?forestA:forestB,x-31,y-42,56,53);d.drawImage(i%2?forestB:forestA,x-9,y-26,43,40)}else{d.drawImage(mountain,x-42,y-29,84,42);const im=i%4===0?high:mountain;d.drawImage(im,x-37,y-43,74,57)}d.restore();}
// Channels and tile classification use the exact same geographic paths.
function geo([lon,lat]){const b=map.bounds;return [(lon-b[0])/(b[2]-b[0])*(map.w-1)*S+S/3,(b[3]-lat)/(b[3]-b[1])*(map.h-1)*V+V/2]}
d.save();d.lineJoin=d.lineCap='round';
for(const river of map.features.rivers)for(const points of river.paths||[river.points])for(const [width,color]of [[11,'#c8b888'],[8,'#235668'],[5,'#77aeba'],[1,'#d1e7df88']]){d.beginPath();points.forEach((p,n)=>{const [x,y]=geo(p);n?d.lineTo(x,y):d.moveTo(x,y)});d.lineWidth=width;d.strokeStyle=color;d.stroke()}
d.restore();
fs.writeFileSync(path.join(A,'east-asia-terrain.png'),overlay.toBuffer('image/png'));g.drawImage(overlay,0,0);
for(const name of ['world-clean.png','world.jpg','world-natural.png']){const c=createCanvas(ground.width,ground.height);c.getContext('2d').drawImage(ground,0,0);fs.writeFileSync(path.join(A,name),c.toBuffer(name.endsWith('.jpg')?'image/jpeg':'image/png'))}
// Terrain is composited separately at runtime, so the clean base has no doubled shadows.
g.clearRect(0,0,WW,HH);g.fillStyle=g.createPattern(tile,'repeat');g.fillRect(0,0,WW,HH);
for(let i=0;i<map.tiles.length;i++){const [f,t]=map.tiles[i];if(f<0)continue;const x=(i%map.w+.5*((i/map.w|0)%2))*S+S/3,y=(i/map.w|0)*V+V/2;hex(g,x,y);g.fillStyle=colors[f];g.fill();}
fs.writeFileSync(path.join(A,'world-clean.png'),ground.toBuffer('image/png'));
// Same original title layout and title artwork, with the standalone game's typography.
const logo=createCanvas(1600,360),l=logo.getContext('2d');l.textAlign='center';l.shadowColor='#071c26';l.shadowBlur=16;l.fillStyle='#ead8a5';l.font='bold 132px Terha';l.fillText('동아시아 콘퀘스트',800,180);l.shadowBlur=0;l.font='36px Terha';l.fillStyle='#d7e2e0';l.fillText('E A S T   A S I A   C O N Q U E S T',800,270);fs.writeFileSync(path.join(A,'title-logo.png'),logo.toBuffer('image/png'));
const codes=['kr','cn','jp','kp','tw','ru','mn','vn'];
for(let f=0;f<8;f++){const im=await loadImage(path.join(R,'data/flags',codes[f]+'.svg')),c=createCanvas(120,80);c.getContext('2d').drawImage(im,0,0,120,80);fs.writeFileSync(path.join(A,'flag-'+f+'.png'),c.toBuffer('image/png'));if(f===3||f===6)fs.copyFileSync(path.join(R,'data/flags',codes[f]+'.svg'),path.join(A,'flag-'+f+'.svg'));if(f===7)fs.writeFileSync(path.join(A,'flag-7.jpg'),c.toBuffer('image/jpeg'))}
console.log('Generated geography, retained terrain art, title and 8 flags');
})().catch(e=>{console.error(e);process.exit(1)});

// Run the exact Terha river sampler over the new geographic coordinates.
const fs=require('fs'),vm=require('vm'),path=require('path');const R=path.resolve(__dirname,'../..'),A=path.join(R,'game/assets');
const geo=JSON.parse(fs.readFileSync(path.join(R,'art/terrain-alignment-geography.json'))),ctx={};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(A,'river-data.js'),'utf8')+fs.readFileSync(path.join(A,'rivers.js'),'utf8').split('let riverView=')[0],ctx);
// riverSamples is a pure geometry function, shared verbatim with upstream.
const source=fs.readFileSync(path.join(A,'rivers.js'),'utf8');
const start=source.indexOf('function riverSamples('),end=source.indexOf('\nfor(const reach of RIVER_REACHES)',start);
vm.runInContext(source.slice(start,end)+';this.sample=riverSamples;this.reaches=RIVER_REACHES',ctx);
geo.reaches=ctx.reaches.map(r=>({id:r.id,name:r.name,nodes:r.nodes,samples:ctx.sample(r)}));fs.writeFileSync(path.join(R,'art/terrain-alignment-geography.json'),JSON.stringify(geo));
const cols=8,rows=6,regions=[];
for(let row=0;row<rows;row++)for(let col=0;col<cols;col++)regions.push({name:`natural-detail-${col}-${row}`,x:(col*181-14)/(cols*181)*geo.width,y:(row*181-14)/(rows*181)*geo.height,w:209/(cols*181)*geo.width,h:209/(rows*181)*geo.height,feather:14/209,pixelWidth:1254,pixelHeight:1254});
fs.writeFileSync(path.join(A,'natural-detail-data.js'),"'use strict';\nconst NATURAL_DETAIL="+JSON.stringify({cols,rows,effectiveWidth:8688,effectiveHeight:6516,regions})+';\n');
console.log('Exported native column-offset grid and original river sampler');

// node desk/tools/test_printful_real.js — runs the REAL Design Shop renderer (render.js + tee-render.js + art) headlessly with @napi-rs/canvas
// and checks actual design states: leggings print file (base fill, side stripes, leg/seat/waistband art inside Printful safe area) and tee zone export.
const fs=require('fs'),path=require('path'),assert=require('assert');let CV;try{CV=require(process.env.NAPI_CANVAS||'@napi-rs/canvas');}catch(e){console.log('skip: @napi-rs/canvas not installed');process.exit(0);}
const {createCanvas,Path2D,Image}=CV,D=path.join(__dirname,'..');
const W={};W.window=W;Object.assign(W,{Path2D,Image,console,Math,JSON,Promise,setTimeout,addEventListener(){},location:{protocol:'file:'},navigator:{}});
const doc={querySelector:()=>null,querySelectorAll:()=>[],createElement:t=>t==='canvas'?createCanvas(1,1):{style:{},appendChild(){}},head:{appendChild(){}},body:{appendChild(){}},addEventListener(){},fonts:{load:()=>Promise.resolve(),ready:Promise.resolve()}};
W.document=doc;
const run=f=>new Function('window','document','Image','Path2D',fs.readFileSync(path.join(D,f),'utf8'))(W,doc,Image,Path2D);
['assets.js','assets2.js','gyj.js','fonts.js','render.js','tee-render.js','printful.js'].forEach(run);
const R=W.JimmiRender,P=W.JIMMI_PRINTFUL,out=process.env.OUT||'/tmp/pf-real';fs.mkdirSync(out,{recursive:true});
const px=(c,x,y)=>[...c.getContext('2d').getImageData(Math.round(x),Math.round(y),1,1).data];
(async()=>{const A=W.JIMMI_ASSETS;W.JIMMI_IMG={};for(const k in A){const i=new Image();const s=A[k];i.src=s.startsWith('data:')?Buffer.from(s.split(',')[1],'base64'):fs.readFileSync(path.join(D,s));W.JIMMI_IMG[k]=i;}await new Promise(r=>setTimeout(r,200));
 const area=(cv,hex)=>{const [R0,G0,B0]=[1,3,5].map(k=>parseInt(hex.slice(k,k+2),16)),g=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;let n=0;for(let i=0;i<g.length;i+=4)if(g[i+3]>200&&Math.abs(g[i]-R0)<12&&Math.abs(g[i+1]-G0)<12&&Math.abs(g[i+2]-B0)<12)n++;return n;};
 for(const garment of ['tee','hoodie']){const d=R.makeEditor(garment,{designer:{name:'t',role:'owner'}});const K=R.zk(d),pair=K.includes('leftArm')?['leftArm','rightArm']:['leftSleeve','rightSleeve'];
  const mine=R.sticker('logo',{body:'#00ff00',hair:'#00ff00'},pair[0]);d.zones[pair[0]].push(mine);const front0=JSON.stringify(d.zones.front);
  const areas={};for(const n of [1,2,3]){assert.strictEqual(P.sleeveStripes(d,{color:'#ff00aa',lines:n,thick:.25}),2);
   for(const z of pair){const st=d.zones[z].filter(q=>q.el==='stripe');assert.strictEqual(st.length,1,garment+' '+z+' no duplicate stripes');assert.strictEqual(st[0].lines,n);assert.ok(st[0].slvStripe);assert.ok(!R.validate(d).length||!R.validate(d).some(e=>/stripe/.test(e)),R.validate(d).join(';'));}
   assert.ok(d.zones[pair[0]].includes(mine),'user sticker kept');assert.strictEqual(JSON.stringify(d.zones.front),front0,'front untouched');
   const Z=R.ZONES,a=pair.map(z=>{const c=P.zoneArt(d,z,{w:Math.round(Z[z].inch[0]*150),h:Math.round(Z[z].inch[1]*150)});assert.strictEqual(c.getContext('2d').getImageData(0,0,1,1).data[3],0,'transparent corner');if(n===3)fs.writeFileSync(out+'/'+garment+'-'+z+'-triple.png',c.toBuffer('image/png'));return area(c,'#ff00aa');});
   assert.ok(a[0]>200&&a[1]>200,garment+' both sleeves export stripes '+a);assert.ok(Math.abs(a[0]-a[1])/Math.max(a[0],a[1])<0.15,'mirrored sleeves similar '+a);areas[n]=a[0];}
  assert.ok(areas[2]>areas[1]*1.6&&areas[3]>areas[1]*2.4,garment+' single<double<triple area '+JSON.stringify(areas));console.log(garment,'sleeve stripe areas',areas);}
 console.log('tops sleeve stripe tests OK →',out);})().catch(e=>{console.error(e);process.exit(1);});

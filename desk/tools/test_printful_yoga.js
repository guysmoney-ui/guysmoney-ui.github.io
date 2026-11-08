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
 const d=R.makeLeggings({designer:{name:'t',role:'owner'}});d.colors.base='#14204a';d.colors.stripe='#c8102e';d.colors.stripeCount=2;d.colors.stripeWidth=7;
 d.zones.rightLeg.push(R.sticker('head',{body:'#ffffff',hair:'#ffffff'},'rightLeg'));d.zones.waistband.push(R.sticker('word',{body:'#ff00ff'},'waistband'));d.zones.waistbandBack.push(R.sticker('word',{body:'#00ff00'},'waistbandBack'));
 const t0=Date.now(),o=P.legPrintFile(d,{},P.YOGA),c=o.canvas;console.log('yoga ms',Date.now()-t0);assert.deepStrictEqual([c.width,c.height],[7050,6150]);assert.ok(!o.incomplete);
 for(const [k,w,h] of [['front',3000,1050],['back',2400,900]])assert.deepStrictEqual([o.bands[k].width,o.bands[k].height],[w,h]);
 fs.writeFileSync(out+'/yoga-legs.png',c.toBuffer('image/png'));fs.writeFileSync(out+'/yoga-preview.png',P.legPreview(c,P.YOGA).toBuffer('image/png'));fs.writeFileSync(out+'/yoga-wb-front.png',o.bands.front.toBuffer('image/png'));fs.writeFileSync(out+'/yoga-wb-back.png',o.bands.back.toBuffer('image/png'));
 assert.deepStrictEqual(px(c,10,10),[0x14,0x20,0x4a,255],'base');for(const p of ['right','left']){const T=7*7,gap=14*7,x0=P.YOGA.cx[p]-(2*T+gap)/2+T/2;assert.deepStrictEqual(px(c,x0,3000).slice(0,3),[0xc8,0x10,0x2e],'stripe 1 '+p);assert.deepStrictEqual(px(c,x0+T+gap,3000).slice(0,3),[0xc8,0x10,0x2e],'stripe 2 '+p);assert.deepStrictEqual(px(c,P.YOGA.cx[p],3000).slice(0,3),[0x14,0x20,0x4a],'gap between double stripes '+p);}
 const cnt=(cv,f)=>{const g=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;let n=0;for(let i=0;i<g.length;i+=4*7)if(f(g[i],g[i+1],g[i+2]))n++;return n;};
 assert.ok(cnt(c,(r,g,b)=>r>230&&g>230&&b>230)>100,'white head on legs');assert.strictEqual(cnt(c,(r,g,b)=>r>200&&b>200&&g<80),0,'no waistband art on legs file');
 assert.ok(cnt(o.bands.front,(r,g,b)=>r>200&&b>200&&g<80)>100,'front waistband art');assert.ok(cnt(o.bands.back,(r,g,b)=>g>200&&r<80&&b<80)>100,'back waistband art');assert.deepStrictEqual(px(o.bands.front,5,5),[0x14,0x20,0x4a,255],'waistband base');
 console.log('yoga tests OK →',out);})().catch(e=>{console.error(e);process.exit(1);});

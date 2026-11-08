// node desk/tools/test_printful_real.js — runs the REAL Design Shop renderer (render.js + tee-render.js + art) headlessly with @napi-rs/canvas
// AOP Recycled Unisex Hoodie 388 real-renderer test (7 pieces).
// Memory: run one stripe count per process, e.g. for N in 1 2 3; do N=$N node ...; done
// and checks actual design states: leggings print file (base fill, side stripes, leg/seat/waistband art inside Printful safe area) and tee zone export.
const fs=require('fs'),path=require('path'),assert=require('assert');let CV;try{CV=require(process.env.NAPI_CANVAS||'@napi-rs/canvas');}catch(e){console.log('skip: @napi-rs/canvas not installed');process.exit(0);}
const {createCanvas,Path2D,Image}=CV,D=path.join(__dirname,'..');
const W={};W.window=W;Object.assign(W,{Path2D,Image,console,Math,JSON,Promise,setTimeout,addEventListener(){},location:{protocol:'file:'},navigator:{}});
const doc={querySelector:()=>null,querySelectorAll:()=>[],createElement:t=>t==='canvas'?createCanvas(1,1):{style:{},appendChild(){}},head:{appendChild(){}},body:{appendChild(){}},addEventListener(){},fonts:{load:()=>Promise.resolve(),ready:Promise.resolve()}};
W.document=doc;
const run=f=>new Function('window','document','Image','Path2D',fs.readFileSync(path.join(D,f),'utf8'))(W,doc,Image,Path2D);
['assets.js','assets2.js','gyj.js','fonts.js','render.js','tee-render.js','printful.js'].forEach(run);
const R=W.JimmiRender,P=W.JIMMI_PRINTFUL,out=process.env.OUT||'/tmp/pf-real';fs.mkdirSync(out,{recursive:true});
/* Node-only harness speed-up: @napi-rs/canvas copies the WHOLE source canvas on every canvas->canvas drawImage (~160 ms for the 2400x4896 seat zone,
   x thousands of row draws = ~400 s; browser export of the same code was ~1.6 s). For large canvas sources, copy only the requested source rect (+2 px pad)
   into a small canvas and draw from it at the same fractional offset: same pixels sampled, same destination. Production printful.js is unchanged. */
{const C2=Object.getPrototypeOf(createCanvas(1,1).getContext('2d')),orig=C2.drawImage;C2.drawImage=function(src,...a){if(a.length===8&&src&&typeof src.toBuffer==='function'&&src.width*src.height>4e5){
 const [sx,sy,sw,sh,dx,dy,dw,dh]=a,x0=Math.max(0,Math.floor(sx)-2),y0=Math.max(0,Math.floor(sy)-2),x1=Math.min(src.width,Math.ceil(sx+sw)+2),y1=Math.min(src.height,Math.ceil(sy+sh)+2);if(x1<=x0||y1<=y0)return;
 const t=createCanvas(x1-x0,y1-y0);t.getContext('2d').putImageData(src.getContext('2d').getImageData(x0,y0,x1-x0,y1-y0),0,0);return orig.call(this,t,sx-x0,sy-y0,sw,sh,dx,dy,dw,dh);}return orig.call(this,src,...a);};}
const px=(c,x,y)=>[...c.getContext('2d').getImageData(Math.round(x),Math.round(y),1,1).data];
(async()=>{const A=W.JIMMI_ASSETS;W.JIMMI_IMG={};for(const k in A){const i=new Image();const s=A[k];i.src=s.startsWith('data:')?Buffer.from(s.split(',')[1],'base64'):fs.readFileSync(path.join(D,s));W.JIMMI_IMG[k]=i;}await new Promise(r=>setTimeout(r,200));
 const reg=(c,x0,y0,x1,y1,f)=>{const g=c.getContext('2d').getImageData(x0,y0,x1-x0,y1-y0).data;let n=0;for(let i=0;i<g.length;i+=4*5)if(f(g[i],g[i+1],g[i+2]))n++;return n;};
 const wht=(r,g,b)=>r>230&&g>230&&b>230,grn=(r,g,b)=>g>200&&r<80&&b<80,mag=(r,g,b)=>r>200&&b>200&&g<80,red=(r,g,b)=>r>180&&g<40&&b<60,BASE=[0x14,0x20,0x4a],HP=P.AOPHOOD.pieces;
 {const d0=R.makeEditor('hoodie',{designer:{name:'t',role:'owner'}});d0.colors.base='#14204a';const k=Object.keys(d0.zones).filter(z=>(d0.zones[z]||[]).length&&HP[z]);for(const z of k){const c=P.aopTeeFile(d0,z,{},P.AOPHOOD).canvas;assert.ok(reg(c,...HP[z].safe,(r,g,b)=>Math.abs(r-0x14)+Math.abs(g-0x20)+Math.abs(b-0x4a)>60)>20,'default art kept on '+z);}console.log('default hoodie art zones',k.join(','));}
 for(const n of (process.env.N?[+process.env.N]:[1,2,3])){const d=R.makeEditor('hoodie',{designer:{name:'t',role:'owner'}});for(const z in d.zones)d.zones[z]=[];d.colors.base='#14204a';
  d.zones.front.push(R.sticker('head',{body:'#ffffff',hair:'#ffffff'},'front'));d.zones.back.push(R.sticker('word',{body:'#00ff00'},'back'));d.zones.leftArm.push(R.sticker('word',{body:'#ff00ff'},'leftArm'));d.zones.hemFront.push(R.sticker('word',{body:'#00ff00'},'hemFront'));
  assert.strictEqual(P.sleeveStripes(d,{lines:n,thick:.25,color:'#c8102e'}),2);const t0=Date.now(),F={};
  for(const k of Object.keys(HP)){F[k]=P.aopTeeFile(d,k,{},P.AOPHOOD).canvas;assert.deepStrictEqual([F[k].width,F[k].height],[6000,6000],k+' size');assert.deepStrictEqual(px(F[k],5,5).slice(0,3),BASE,k+' base');}
  assert.strictEqual(Object.keys(HP).length,7);
  assert.ok(reg(F.front,...HP.front.safe,wht)>100,'front art');for(const k of Object.keys(HP).filter(k=>k!=='front'))assert.strictEqual(reg(F[k],0,0,6000,6000,wht),0,'no front art on '+k);
  assert.ok(reg(F.back,...HP.back.safe,grn)>100,'back art');assert.ok(reg(F.front,...HP.front.bands[0].rect,grn)>20,'hemFront art in front hem band');assert.strictEqual(reg(F.front,0,0,6000,4900,grn),0,'hem art stays in band');assert.strictEqual(reg(F.back,0,4900,6000,6000,grn),0,'no hemFront on back band');
  assert.ok(reg(F.leftArm,...HP.leftArm.safe,mag)>20,'left arm art');assert.strictEqual(reg(F.rightArm,0,0,6000,6000,mag),0,'no left arm art on right');
  for(const k of ['pocket','hood','labelPanel'])for(const f of [wht,grn,mag,red])assert.strictEqual(reg(F[k],0,0,6000,6000,f),0,k+' base only');
  const w=Math.round(.25*150),gap=Math.max(w,Math.round(150/16)),T=n*w+(n-1)*gap,ax=3000;
  for(const k of ['leftArm','rightArm']){for(const y of [200,1000,4300]){for(let i=0;i<n;i++)assert.deepStrictEqual(px(F[k],ax-T/2+i*(w+gap)+w/2,y).slice(0,3),[0xc8,0x10,0x2e],`${k} stripe ${i+1}/${n} y${y}`);
    if(y!==1000&&y<1300||y>4100){assert.deepStrictEqual(px(F[k],ax-T/2-20,y).slice(0,3),BASE,'outside stripe');if(n>1)assert.deepStrictEqual(px(F[k],ax-T/2+w+gap/2,y).slice(0,3),BASE,'gap');}}
   assert.strictEqual(reg(F[k],2199,4511,3801,5446,red),0,k+' cuff has no stripe');}
  for(const k of ['front','back','pocket','hood','labelPanel'])assert.strictEqual(reg(F[k],0,0,6000,6000,red),0,'no sleeve stripe on '+k);
  if(n===3)for(const k in F)fs.writeFileSync(out+`/aophood-${k}.png`,F[k].toBuffer('image/png'));
  console.log('aophood n='+n,'ms',Date.now()-t0);}
 console.log('AOP hoodie 388 tests OK →',out);})().catch(e=>{console.error(e);process.exit(1);});
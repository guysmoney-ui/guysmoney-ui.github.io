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
 const S=P.SHORTS,reg=(c,x0,y0,x1,y1,f)=>{const g=c.getContext('2d').getImageData(x0,y0,x1-x0,y1-y0).data;let n=0;for(let i=0;i<g.length;i+=4*5)if(f(g[i],g[i+1],g[i+2]))n++;return n;};
 const mag=(r,g,b)=>r>200&&b>200&&g<80,wht=(r,g,b)=>r>230&&g>230&&b>230,grn=(r,g,b)=>g>200&&r<80&&b<80;
 for(const n of [1,2,3]){const d=R.makeShorts({designer:{name:'t',role:'owner'}});d.zones.shLeftLeg=[];d.colors.base='#14204a';d.colors.stripe='#c8102e';d.colors.stripeCount=n;d.colors.stripeWidth=7;
  d.zones.shRightLeg.push(R.sticker('head',{body:'#ffffff',hair:'#ffffff'},'shRightLeg'));d.zones.shBack.push(R.sticker('word',{body:'#00ff00'},'shBack'));d.zones.shWaist.push(R.sticker('word',{body:'#ff00ff'},'shWaist'));
  const t0=Date.now(),o=P.legPrintFile(d,{},S),c=o.canvas;assert.deepStrictEqual([c.width,c.height],[8400,3300]);assert.ok(!o.incomplete,o.notes.join(';'));
  assert.deepStrictEqual(px(c,10,10),[0x14,0x20,0x4a,255],'base');
  const w=49,gap=98,T=n*w+(n-1)*gap;for(const p of ['right','left'])for(let k=0;k<n;k++)assert.deepStrictEqual(px(c,S.cx[p]-T/2+k*(w+gap)+w/2,2000).slice(0,3),[0xc8,0x10,0x2e],`stripe ${k+1}/${n} ${p}`);
  if(n===2)for(const p of ['right','left'])assert.deepStrictEqual(px(c,S.cx[p],2000).slice(0,3),[0x14,0x20,0x4a],'double gap');
  if(n===3){fs.writeFileSync(out+'/shorts-printfile.png',c.toBuffer('image/png'));fs.writeFileSync(out+'/shorts-preview.png',P.legPreview(c,S).toBuffer('image/png'));
   assert.ok(reg(c,S.cx.right+60,S.yTop,3700,S.yBot,wht)>100,'head on RIGHT leg FRONT half');assert.strictEqual(reg(c,0,S.yTop,S.cx.right-60,3300,wht),0,'no head on right back half');assert.strictEqual(reg(c,4200,0,8400,3300,wht),0,'no head on left leg');
   assert.ok(reg(c,0,S.yTop,S.cx.right-60,3300,grn)>50&&reg(c,S.cx.left+60,S.yTop,8400,3300,grn)>50,'back art on both BACK halves');assert.strictEqual(reg(c,S.cx.right+60,S.yTop,S.cx.left-60,3300,grn),0,'no back art on front halves');
   const fr=S.fold.right,yAt=x=>fr[0][1]+(x-fr[0][0])*(fr[1][1]-fr[0][1])/(fr[1][0]-fr[0][0]);let below=0;const g=c.getContext('2d').getImageData(0,0,8400,3300).data;for(let y=0;y<3300;y+=5)for(let x=0;x<8400;x+=5){const i=(y*8400+x)*4;if(mag(g[i],g[i+1],g[i+2])){const fy=x<4200?yAt(x):S.fold.left[0][1]+(x-S.fold.left[0][0])*(S.fold.left[1][1]-S.fold.left[0][1])/(S.fold.left[1][0]-S.fold.left[0][0]);if(y>fy+5)below++;}}
   assert.ok(reg(c,0,0,8400,1000,mag)>50,'waistband art present');assert.strictEqual(below,0,'waistband art stays above folding line');}
  console.log('shorts n='+n,'ms',Date.now()-t0);}
 console.log('shorts tests OK →',out);})().catch(e=>{console.error(e);process.exit(1);});

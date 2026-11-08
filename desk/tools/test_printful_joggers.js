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
 const reg=(c,x0,y0,x1,y1,f)=>{const g=c.getContext('2d').getImageData(x0,y0,x1-x0,y1-y0).data;let n=0;for(let i=0;i<g.length;i+=4*5)if(f(g[i],g[i+1],g[i+2]))n++;return n;};
 const mag=(r,g,b)=>r>200&&b>200&&g<80,wht=(r,g,b)=>r>230&&g>230&&b>230,grn=(r,g,b)=>g>200&&r<80&&b<80,BASE=[0x14,0x20,0x4a];
 for(const S of [P.JOGM,P.JOGW])for(const n of [1,2,3]){const d=R.makeLeggings({designer:{name:'t',role:'owner'}});d.garment='joggers';for(const z in d.zones)d.zones[z]=[];d.colors.base='#14204a';d.colors.stripe='#c8102e';d.colors.stripeCount=n;d.colors.stripeWidth=7;
  d.zones.rightLeg.push(R.sticker('head',{body:'#ffffff',hair:'#ffffff'},'rightLeg'));d.zones.seat.push(R.sticker('word',{body:'#00ff00'},'seat'));d.zones.waistband.push(R.sticker('word',{body:'#ff00ff'},'waistband'));
  const t0=Date.now(),o=P.legPrintFile(d,{},S),c=o.canvas;assert.ok(!o.incomplete,o.notes.join(';'));
  for(const p of ['right','left'])assert.deepStrictEqual([o.files[p].width,o.files[p].height],[4950,7500],S.key+' leg file 33x50in@150');
  assert.deepStrictEqual(px(o.files.right,10,10).slice(0,3),BASE,'base right');assert.deepStrictEqual(px(o.files.left,4940,7490).slice(0,3),BASE,'base left');
  const w=49,gap=98,T=n*w+(n-1)*gap;for(const p of ['right','left'])for(const y of [300,3000,6000]){for(let k=0;k<n;k++)assert.deepStrictEqual(px(c,S.cx[p]-T/2+k*(w+gap)+w/2,y).slice(0,3),[0xc8,0x10,0x2e],`${S.key} stripe ${k+1}/${n} ${p} y${y}`);
   assert.deepStrictEqual(px(c,S.cx[p]-T/2-30,y).slice(0,3),BASE,'outside stripe');if(n>1)assert.deepStrictEqual(px(c,S.cx[p]-T/2+w+gap/2,y).slice(0,3),BASE,'gap');}
  for(const p of ['right','left'])assert.deepStrictEqual(px(c,S.cx[p],S.stripeBot+100).slice(0,3),BASE,S.key+' no stripe on cuff');
  if(n===3){fs.writeFileSync(out+`/${S.key}-right.png`,o.files.right.toBuffer('image/png'));fs.writeFileSync(out+`/${S.key}-left.png`,o.files.left.toBuffer('image/png'));fs.writeFileSync(out+`/${S.key}-preview.png`,P.legPreview(c,S).toBuffer('image/png'));
   const R0=S.cx.right,L0=S.cx.left,m=60;
   assert.ok(reg(c,R0+m,S.yTop,4950,S.yBot,wht)>100,'head on RIGHT leg FRONT half');assert.strictEqual(reg(c,0,0,R0-m,7500,wht),0,'no head on right back');assert.strictEqual(reg(c,4950,0,9900,7500,wht),0,'no head on left leg file');
   assert.ok(reg(c,0,S.yTop,R0-m,S.yBot,grn)>50&&reg(c,L0+m,S.yTop,9900,S.yBot,grn)>50,'seat art on both BACK halves');assert.strictEqual(reg(c,R0+m,0,L0-m,7500,grn),0,'no seat art on front halves');
   const fy=(L,x)=>L[0][1]+(x-L[0][0])*(L[1][1]-L[0][1])/(L[1][0]-L[0][0]),g=c.getContext('2d').getImageData(0,0,9900,7500).data;let below=0,tot=0;
   for(let y=0;y<7500;y+=5)for(let x=0;x<9900;x+=5){const i=(y*9900+x)*4;if(mag(g[i],g[i+1],g[i+2])){tot++;if(y>fy(S.fold[x<4950?'right':'left'],x)+5)below++;}}
   assert.ok(tot>50,'waistband art present');assert.strictEqual(below,0,'waistband art stays above folding line');
   for(const f of [wht,grn,mag])assert.strictEqual(reg(c,0,S.stripeBot+40,9900,7500,f),0,'nothing on cuffs');}
  console.log(S.key,'n='+n,'ms',Date.now()-t0);}
 console.log('jogger tests OK →',out);})().catch(e=>{console.error(e);process.exit(1);});

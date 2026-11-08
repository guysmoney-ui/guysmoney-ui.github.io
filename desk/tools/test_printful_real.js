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
/* Node-only harness speed-up: @napi-rs/canvas copies the WHOLE source canvas on every canvas->canvas drawImage (~160 ms for the 2400x4896 seat zone,
   x thousands of row draws = ~400 s; browser export of the same code was ~1.6 s). For large canvas sources, copy only the requested source rect (+2 px pad)
   into a small canvas and draw from it at the same fractional offset: same pixels sampled, same destination. Production printful.js is unchanged. */
{const C2=Object.getPrototypeOf(createCanvas(1,1).getContext('2d')),orig=C2.drawImage;C2.drawImage=function(src,...a){if(a.length===8&&src&&typeof src.toBuffer==='function'&&src.width*src.height>4e5){
 const [sx,sy,sw,sh,dx,dy,dw,dh]=a,x0=Math.max(0,Math.floor(sx)-2),y0=Math.max(0,Math.floor(sy)-2),x1=Math.min(src.width,Math.ceil(sx+sw)+2),y1=Math.min(src.height,Math.ceil(sy+sh)+2);if(x1<=x0||y1<=y0)return;
 const t=createCanvas(x1-x0,y1-y0);t.getContext('2d').putImageData(src.getContext('2d').getImageData(x0,y0,x1-x0,y1-y0),0,0);return orig.call(this,t,sx-x0,sy-y0,sw,sh,dx,dy,dw,dh);}return orig.call(this,src,...a);};}
const px=(c,x,y)=>[...c.getContext('2d').getImageData(Math.round(x),Math.round(y),1,1).data];
(async()=>{const A=W.JIMMI_ASSETS;W.JIMMI_IMG={};for(const k in A){const i=new Image();const s=A[k];i.src=s.startsWith('data:')?Buffer.from(s.split(',')[1],'base64'):fs.readFileSync(path.join(D,s));W.JIMMI_IMG[k]=i;}await new Promise(r=>setTimeout(r,200));
 // leggings: base navy, red triple side stripe, yellow logo on left leg (default), head on right leg, word on seat, word on waistband
 const d=R.makeLeggings({designer:{name:'t',role:'owner'}});d.colors.base='#14204a';d.colors.stripe='#c8102e';d.colors.stripeCount=3;d.colors.stripeWidth=7;
 d.zones.rightLeg.push(R.sticker('head',{body:'#ffffff',hair:'#ffffff'},'rightLeg'));d.zones.seat.push(R.sticker('word',{body:'#00ff00'},'seat'));d.zones.waistband.push(R.sticker('word',{body:'#ff00ff'},'waistband'));
 const t0=Date.now();const o=P.legPrintFile(d),c=o.canvas;console.log('legPrintFile ms',Date.now()-t0);assert.strictEqual(c.width,7200);assert.strictEqual(c.height,6225);assert.ok(!o.incomplete);
 fs.writeFileSync(out+'/leggings-printfile.png',c.toBuffer('image/png'));fs.writeFileSync(out+'/leggings-preview.png',P.legPreview(c).toBuffer('image/png'));
 assert.deepStrictEqual(px(c,10,10),[0x14,0x20,0x4a,255],'base fill corner');
 assert.deepStrictEqual(px(c,P.LEG.cx.right,3500).slice(0,3),[0xc8,0x10,0x2e],'side stripe on right leg side line');
 assert.deepStrictEqual(px(c,P.LEG.cx.left,3500).slice(0,3),[0xc8,0x10,0x2e],'side stripe on left leg side line');
 // count non-base, non-stripe pixels per region on a downsample
 const g=c.getContext('2d').getImageData(0,0,7200,6225).data,cnt={rf:0,lf:0,rb:0,lb:0,out:0,band:0,green:0,mag:0,yellow:0,white:0};
 const outs=[];for(let y=0;y<6225;y+=6){const sr=P.xsAt(P.LEG.safe.right,y),sl=P.xsAt(P.LEG.safe.left,y);for(let x=0;x<7200;x+=6){const i=(y*7200+x)*4,r_=g[i],g_=g[i+1],b_=g[i+2];if(r_===0x14&&g_===0x20&&b_===0x4a)continue;if(Math.abs(r_-0xc8)<30&&g_<60&&b_<70)continue;if(Math.abs(x-P.LEG.cx.right)<200||Math.abs(x-P.LEG.cx.left)<200){if(r_>g_&&g_<70&&b_<100)continue;}
  if(g_>200&&r_<80&&b_<80)cnt.green++;if(r_>200&&b_>200&&g_<80)cnt.mag++;if(r_>200&&g_>180&&b_<90)cnt.yellow++;if(r_>230&&g_>230&&b_>230)cnt.white++;
  const inR=sr&&x>=sr[0]-8&&x<=sr[1]+8,inL=sl&&x>=sl[0]-8&&x<=sl[1]+8;if(y<1000){cnt.band++;continue;}
  if(inR)cnt[x>=P.LEG.cx.right?'rf':'rb']++;else if(inL)cnt[x<=P.LEG.cx.left?'lf':'lb']++;else{cnt.out++;if(outs.length<8)outs.push([x,y,r_,g_,b_]);}}}
 console.log(cnt,outs);assert.ok(cnt.rf>50&&cnt.lf>50,'front art on both legs');assert.ok(cnt.rb>20&&cnt.lb>20,'seat art on both back halves');assert.ok(cnt.band>20&&cnt.mag>20,'waistband art');
 assert.ok(cnt.green>20,'seat word');assert.ok(cnt.yellow>20,'default yellow logo on left leg');assert.ok(cnt.white>20,'white head on right leg');assert.strictEqual(cnt.out,0,'no art outside safe area below waistband');
 // base fill off -> transparent corner
 assert.strictEqual(px(P.legPrintFile(d,{base:false}).canvas,10,10)[3],0);
 // tee: front logo export is artwork-only, transparent, non-empty
 const t=R.makeEditor('tee',{designer:{name:'t',role:'owner'}});const tc=P.zoneArt(t,'front',{w:1800,h:2400});assert.strictEqual(px(tc,0,0)[3],0);
 let a=0;const td=tc.getContext('2d').getImageData(0,0,1800,2400).data;for(let i=3;i<td.length;i+=400)if(td[i])a++;assert.ok(a>50,'tee front art present');fs.writeFileSync(out+'/tee-front.png',tc.toBuffer('image/png'));
 console.log('real renderer tests OK →',out);})().catch(e=>{console.error(e);process.exit(1);});

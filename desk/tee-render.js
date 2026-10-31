/* Jimmi's Design Shop — schema v2: Tee Editor (per-zone sticker objects), designer credit + review fields, exports. Extends window.JimmiRender. */
(function(W){
const R=W.JimmiRender,C=R.C,v1validate=R.validate,v1make=R.make;
/* ---- zones (600x800 canvas units, as seen on the FRONT view; sleeves mirror on the back view) ---- */
const ZONES={
 front:{n:'Front body',g:'tee',view:'front',rect:[178,170,244,325],inch:[12,16]},
 back:{n:'Back body',view:'back',rect:[178,150,244,325],inch:[12,16]},
 rightSleeve:{n:'Right sleeve',sleeve:1,side:-1,rect:[30,122,140,140],inch:[5,5],g:'tee'}, /* wearer's right = viewer's left on front */
 leftSleeve:{n:'Left sleeve',sleeve:1,side:1,rect:[430,122,140,140],inch:[5,5],g:'tee'},
 /* leggings (v2.1): waistband wraps front + back */
 waistband:{n:'Waistband (front)',view:'front',g:'leggings',band:1,rect:[160,82,280,50],inch:[14,2.5]},
 waistbandBack:{n:'Waistband (back)',view:'back',g:'leggings',band:1,rect:[160,82,280,50],inch:[14,2.5]},
 rightLeg:{n:'Right leg',view:'front',g:'leggings',rect:[150,138,150,612],inch:[7,30]},
 leftLeg:{n:'Left leg',view:'front',g:'leggings',rect:[300,138,150,612],inch:[7,30]},
 bottleFront:{n:'Bottle front',view:'front',g:'bottle',rect:[200,280,200,330],inch:[4,6.5]},
 bottleBack:{n:'Bottle back',view:'back',g:'bottle',rect:[200,280,200,330],inch:[4,6.5]},
 lid:{n:'Lid',lid:1,g:'bottle',rect:[212,128,176,84],inch:[3.5,1.5]},
 shWaist:{n:'Waistband (front)',view:'front',g:'leggings',band:1,rect:[160,82,280,50],inch:[15,2.5]},
 shWaistBack:{n:'Waistband (back)',view:'back',g:'leggings',band:1,rect:[160,82,280,50],inch:[15,2.5]},
 shRightLeg:{n:'Right leg',view:'front',g:'leggings',rect:[138,138,162,330],inch:[8,10]},
 shLeftLeg:{n:'Left leg',view:'front',g:'leggings',rect:[300,138,162,330],inch:[8,10]},
 shBack:{n:'Back',view:'back',g:'leggings',rect:[138,138,324,330],inch:[16,10]},
 /* long-sleeve lower arm (hoodie / zip / long sleeve only); canvas coords, side like leftSleeve/rightSleeve */
 leftForearm:{n:'Left forearm',sleeve:1,low:1,side:1,rect:[520,288,72,176],inch:[3.5,9],g:'tee'},
 rightForearm:{n:'Right forearm',sleeve:1,low:1,side:-1,rect:[8,288,72,176],inch:[3.5,9],g:'tee'},
 leftWrist:{n:'Left wrist',sleeve:1,low:1,side:1,rect:[530,486,70,52],inch:[3,2.5],g:'tee'},
 rightWrist:{n:'Right wrist',sleeve:1,low:1,side:-1,rect:[0,486,70,52],inch:[3,2.5],g:'tee'},
 /* v17: one continuous sleeve per arm, shoulder -> lower forearm (long-sleeve tops) */
 leftArm:{n:'Left sleeve (shoulder → forearm)',sleeve:1,low:1,arm:1,side:1,rect:[430,122,170,364],inch:[5,18],g:'tee'},
 rightArm:{n:'Right sleeve (shoulder → forearm)',sleeve:1,low:1,arm:1,side:-1,rect:[0,122,170,364],inch:[5,18],g:'tee'},
 /* hoodie / zip ribbed hem band */
 hemFront:{n:'Hem band (front)',view:'front',hem:1,rect:[156,619,290,27],inch:[20,1.75],g:'tee'},
 hemBack:{n:'Hem band (back)',view:'back',hem:1,rect:[156,619,290,27],inch:[20,1.75],g:'tee'},
 seat:{n:'Back / seat',view:'back',g:'leggings',rect:[150,138,300,612],inch:[14,30]}};
ZONES.back.g='tee';
const ZK=['front','back','leftSleeve','rightSleeve'],LK=['waistband','waistbandBack','rightLeg','leftLeg','seat'];
const BK=['bottleFront','bottleBack','lid'];const SK=['shWaist','shWaistBack','shRightLeg','shLeftLeg','shBack'];const shorts=d=>d&&d.garment==='shorts';const legs=d=>d&&(d.garment==='leggings'||d.garment==='joggers'||d.garment==='shorts'),gp=d=>d&&(d.garment==='joggers'||d.garment==='shorts')?d.garment:'leggings',bot=d=>d&&d.garment==='bottle';const LOWK=['leftArm','rightArm','leftWrist','rightWrist'],OLDLOW=['leftSleeve','rightSleeve','leftForearm','rightForearm'],HEMK=['hemFront','hemBack'];const LST=['front','back',...LOWK];const topK=g=>g==='hoodie'||g==='zip'?[...LST,...HEMK]:g==='longsleeve'?LST:ZK;
const zk=d=>shorts(d)?SK:legs(d)?LK:bot(d)?BK:topK(d&&d.garment);
const bandOf=(d,back)=>shorts(d)?(back?'shWaistBack':'shWaist'):(back?'waistbandBack':'waistband');
/* switch style within the pants family; shorts<->leggings remaps zone keys index-wise and pulls art into the new zone */
function restyle(d,g){if(['tee','longsleeve','hoodie','zip'].includes(g)&&!legs(d)&&!bot(d)){d.garment=g;d.wrist17=1;const K=zk(d);for(const z of Object.keys(d.zones||{}))if(!K.includes(z)){const Z=ZONES[z],to=Z.hem?(Z.view==='back'?'back':'front'):Z.side>0?(K.includes('leftArm')?'leftArm':'leftSleeve'):(K.includes('rightArm')?'rightArm':'rightSleeve');(d.zones[to]=d.zones[to]||[]).push(...d.zones[z].map(s=>{clampTo(to,s);s.scale=Math.min(s.scale,fitScale(s.el,to,1));return s;}));delete d.zones[z];}K.forEach(k=>d.zones[k]=d.zones[k]||[]);return d;}const was=shorts(d);d.garment=g;if(was!==shorts(d)&&d.zones){const A=was?SK:LK,B=was?LK:SK,n={};B.forEach((k,i)=>{n[k]=(d.zones[A[i]]||[]).map(s=>{clampTo(k,s);s.scale=Math.min(s.scale,fitScale(s.el,k,3));return s;});});d.zones=n;}return d;}
/* brand rule: ONLY these elements */
const EL={logo:{n:'Buff Jimmi logo',parts:['body','hair']},body:{n:'Logo only (no hair)',parts:['body']},hair:{n:'Spiky hair',parts:['hair']},
 word:{n:'Wordmark "Jimmi / at the gym"',parts:['word']},combo:{n:'Logo + wordmark',parts:['body','hair','word']},
 text:{n:'Curved text',parts:['body']},
 stripe:{n:'Stripe',parts:['body']},
 head:{n:'Just the Jimmi head',parts:['body','hair']},skinny:{n:'Skinny Jimmi logo',parts:['body']},leg:{n:'JIMMI down the leg',parts:['body']}};
const PRESETS=[['Yellow','Yellow'],['Red','Red'],['Coral','Coral'],['Orange','Orange'],['Gold','Gold'],['Neon','Pink'],['White','White'],['Cream','Gold'],['Black','Red'],['Cobalt','Yellow']];
const LH=100,WW=170;
function img(){return W.JIMMI_IMG;}
/* ---- curved / arc text (brand words only) ---- */
const TEXTS=['JIMMI','Jimmi','at the gym','Jimmi at the gym','Jimmi @ the gym'],FONTS={script:'JimmiScript',round:'JimmiRound'},TFS=40;
let _mc=null;const mctx=()=>_mc||(_mc=document.createElement('canvas').getContext('2d'));
const tl={};function textLayout(s){const t=TEXTS.includes(s.text)?s.text:'Jimmi',f=FONTS[s.font]?s.font:'script',sp=+(s.spacing||0),cv=Math.max(-360,Math.min(360,+(s.curve||0)));
 const k=[t,f,sp,cv].join('|');if(tl[k])return tl[k];const c=mctx();c.font=`${f==='script'?'':'bold '}${TFS}px ${FONTS[f]}, ${f==='script'?'cursive':'sans-serif'}`;
 const ch=[...t],ws=ch.map(x=>c.measureText(x).width),L=ws.reduce((a,b)=>a+b,0)+sp*(ch.length-1),th=Math.abs(cv)*Math.PI/180,g=[];
 const asc=TFS*.78,desc=TFS*.25;let pos=-L/2;
 for(let i=0;i<ch.length;i++){const m=pos+ws[i]/2;pos+=ws[i]+sp;let x,y,r;
  if(th<0.01){x=m;y=0;r=0;}else{const R0=L/th,a=m/R0;if(cv>0){x=R0*Math.sin(a);y=R0-R0*Math.cos(a);y=-y;y=-(R0*Math.cos(a)-R0);r=a;}else{x=R0*Math.sin(a);y=-(R0-R0*Math.cos(a));y=R0-R0*Math.cos(a);y=-y*-1;r=-a;}
   if(cv>0)y=R0-R0*Math.cos(a),y=y; }
  g.push({c:ch[i],x,y:th<0.01?0:(cv>0?(L/th)*(1-Math.cos(m/(L/th))):-(L/th)*(1-Math.cos(m/(L/th)))),r:th<0.01?0:(cv>0?m/(L/th):-m/(L/th)),w:ws[i]});}
 /* bbox of rotated glyph boxes (baseline at y; glyph spans -asc..+desc) */let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
 for(const q of g){const co=Math.cos(q.r),si=Math.sin(q.r);for(const [u,v] of [[-q.w/2,-asc],[q.w/2,-asc],[-q.w/2,desc],[q.w/2,desc]]){const X=q.x+u*co-v*si,Y=q.y+u*si+v*co;x0=Math.min(x0,X);x1=Math.max(x1,X);y0=Math.min(y0,Y);y1=Math.max(y1,Y);}}
 const cx=(x0+x1)/2,cy=(y0+y1)/2;g.forEach(q=>{q.x-=cx;q.y-=cy;});return tl[k]={g,w:x1-x0,h:y1-y0,font:c.font};}
function drawText(ctx,s,w,h,cb,glow){const Lo=textLayout(s),k=s.scale||1;ctx.save();ctx.scale(k,k);ctx.font=Lo.font;ctx.fillStyle=cb;ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.shadowColor=cb;ctx.shadowBlur=glow*4;
 for(const q of Lo.g){ctx.save();ctx.translate(q.x,q.y);ctx.rotate(q.r);ctx.fillText(q.c,0,0);ctx.restore();}ctx.restore();}
function textSticker(text,font,curve,colors,z,extra){return sticker('text',colors,z,{text,font,curve,spacing:font==='round'?4:0,...(extra||{})});}
/* ---- stripes: thick is in inches (1/32..2), len in logical units; PPI = front-body units per inch ---- */
const PPI=244/12,STH=[1/32,2];const stripeGeom=s=>{const n=[1,2,3].includes(s.lines)?s.lines:1,t=Math.max(STH[0],Math.min(STH[1],+s.thick||.25))*PPI,gap=Math.max(t,PPI/16);return {n,t,gap,T:n*t+(n-1)*gap,L:Math.max(4,+s.len||120)};};
function drawStripe(ctx,s,cb,glow){const G=stripeGeom(s),k=s.scale||1;ctx.save();ctx.scale(k,k);ctx.fillStyle=cb;ctx.shadowColor=cb;ctx.shadowBlur=glow*4;let y=-G.T/2;for(let i=0;i<G.n;i++){ctx.fillRect(-G.L/2,y,G.L,G.t);y+=G.t+G.gap;}ctx.restore();}
function dims(s){if(s.el==='stripe'){const G=stripeGeom(s),k=s.scale||1;return [G.L*k,Math.max(G.T,1)*k];}if(s.el==='text'){const Lo=textLayout(s),k=s.scale||1;return [Math.max(10,Lo.w*k),Math.max(10,Lo.h*k)];}const A=img(),ar=A.body.naturalWidth/A.body.naturalHeight||0.93,war=A.word.naturalHeight/A.word.naturalWidth||0.39,k=s.scale;
 if(s.el==='word')return [WW*k,WW*war*k];if(s.el==='combo'){const w=Math.max(LH*ar,WW*.8);return [w*k,(LH+WW*.8*war+6)*k];}if(s.el==='hair')return [LH*.6*k,LH*.6*k*112/185];const I=n=>A[n].naturalWidth/A[n].naturalHeight||1;if(s.el==='head')return [LH*.8*I('headBody')*k,LH*.8*k];if(s.el==='skinny')return [LH*I('skinny')*k,LH*k];if(s.el==='leg')return [LH*3*I('leg')*k,LH*3*k];return [LH*ar*k,LH*k];}
function drawEl(ctx,s,glow){const A=img(),[w,h]=dims(s),cb=s.colors.body,ch=s.colors.hair||cb,t=R._tint;
 ctx.save();ctx.translate(s.x,s.y);ctx.rotate((s.rotation||0)*Math.PI/180);
 const L=(x,y,lw,lh,hair)=>{if(hair){ctx.shadowColor=ch;ctx.shadowBlur=glow*lh/40;ctx.drawImage(t(A.hair,ch),x,y,lw,lh);}else{ctx.shadowColor=cb;ctx.shadowBlur=glow*lh/40;ctx.drawImage(t(A.body,cb),x,y,lw,lh);}};
 if(s.el==='logo'){L(-w/2,-h/2,w,h);L(-w/2,-h/2,w,h,1);}
 else if(s.el==='body')L(-w/2,-h/2,w,h);
 else if(s.el==='hair'){/* crop hair band of the logo art */const hh=A.hair,cy=hh.naturalHeight*.15;ctx.shadowColor=ch;ctx.shadowBlur=glow*3;const sx=hh.naturalWidth/684;ctx.drawImage(t(hh,ch),240*sx,0,185*sx,112*sx,-w/2,-h/2,w,h);}
 else if(s.el==='stripe')drawStripe(ctx,s,cb,glow);
 else if(s.el==='text')drawText(ctx,s,w,h,cb,glow);
 else if(s.el==='head'){ctx.shadowColor=cb;ctx.shadowBlur=glow*h/40;ctx.drawImage(t(A.headBody,cb),-w/2,-h/2,w,h);ctx.shadowColor=ch;ctx.drawImage(t(A.headHair,ch),-w/2,-h/2,w,h);}
 else if(s.el==='skinny'||s.el==='leg'){ctx.shadowColor=cb;ctx.shadowBlur=glow*3;ctx.drawImage(t(A[s.el],cb),-w/2,-h/2,w,h);}
 else if(s.el==='word'){ctx.shadowColor=cb;ctx.shadowBlur=glow*3;ctx.drawImage(t(A.word,cb),-w/2,-h/2,w,h);}
 else if(s.el==='combo'){const k=s.scale,ar=A.body.naturalWidth/A.body.naturalHeight,lw=LH*ar*k,lh=LH*k,ww=WW*.8*k,wh=ww*A.word.naturalHeight/A.word.naturalWidth;
  L(-lw/2,-h/2,lw,lh);L(-lw/2,-h/2,lw,lh,1);ctx.shadowColor=cb;ctx.shadowBlur=glow*3;ctx.drawImage(t(A.word,cb),-ww/2,h/2-wh,ww,wh);}
 ctx.restore();}
/* ---- tee geometry ---- */
const TM=[1.3,0,0,.9,-90,10.8];function xf(p){const q=new Path2D();q.addPath(p,new DOMMatrix(TM));return q;}
function body(back){return xf(rawBody(back));}function sleeve(sd){return xf(rawSleeve(sd));}
function rawBody(back){const p=new Path2D();p.moveTo(250,108);if(back)p.quadraticCurveTo(300,122,350,108);else p.bezierCurveTo(268,150,332,150,350,108);
 p.bezierCurveTo(372,118,392,124,404,134);p.bezierCurveTo(404,190,400,225,402,258);p.bezierCurveTo(404,420,412,600,414,700);
 p.quadraticCurveTo(300,716,186,700);p.bezierCurveTo(188,600,196,420,198,258);p.bezierCurveTo(200,225,196,190,196,134);p.bezierCurveTo(208,124,228,118,250,108);p.closePath();return p;}
function rawSleeve(sd){/* sd=-1 viewer-left, 1 viewer-right */const m=x=>300+sd*(x-300),p=new Path2D();
 p.moveTo(m(404),134);p.bezierCurveTo(m(440),146,m(478),176,m(506),226);p.lineTo(m(470),280);p.bezierCurveTo(m(446),270,m(420),262,m(402),258);p.bezierCurveTo(m(400),225,m(404),190,m(404),134);p.closePath();return p;}
/* which screen side a sleeve zone sits on in a view */
/* lower long sleeve, canvas coords; sd=-1 viewer-left, 1 viewer-right */
function lowSleeve(sd){/* raw coords like topExtras, mapped through TM like the body */const m=x=>300+sd*(x-300),p=new Path2D();p.moveTo(m(506),226);p.bezierCurveTo(m(518),300,m(524),420,m(526),560);p.lineTo(m(528),582);p.lineTo(m(490),594);p.lineTo(m(488),572);p.bezierCurveTo(m(484),450,m(480),340,m(470),280);p.closePath();return xf(p);}
const SLV_TILT=5.1;/* sleeve axis deviation from vertical, degrees */
function sleeveAxisX(Z,y){const x=544.4+(y-238.5)*.0895;return Z.side>0?x:600-x;}
function sleeveSide(z,view){return view==='back'?-ZONES[z].side:ZONES[z].side;}
function zoneVisible(z,view){const Z=ZONES[z];return Z.sleeve||Z.lid?true:Z.view===view;}
function zonePath(z,view){const Z=ZONES[z];if(Z.arm){const p=new Path2D(),sd=sleeveSide(z,view);p.addPath(sleeve(sd));p.addPath(lowSleeve(sd));return p;}if(Z.low)return lowSleeve(sleeveSide(z,view));if(Z.sleeve)return sleeve(sleeveSide(z,view));const p=new Path2D(),[x,y,w,h]=Z.rect;p.rect(x,y,w,h);return p;}
/* map canonical sticker coords -> screen coords for view (sleeves mirror on the back) */
function mir(z,view){return ZONES[z].sleeve&&sleeveSide(z,view)!==ZONES[z].side;}
function toScreen(z,view,s){return mir(z,view)?{...s,x:600-s.x,rotation:-(s.rotation||0)}:s;}
function fromScreen(z,view,x){return mir(z,view)?600-x:x;}
function sorted(a){return [...(a||[])].sort((p,q)=>(p.z||0)-(q.z||0));}
function shade(hex,a){const n=parseInt(hex.slice(1),16);const f=v=>Math.max(0,Math.min(255,Math.round(v+a)));return `rgb(${f(n>>16)},${f(n>>8&255)},${f(n&255)})`;}
function boxOf(z,view,s){const t=toScreen(z,view,s),[w,h]=dims(s);return {x:t.x,y:t.y,w,h,r:(t.rotation||0)*Math.PI/180};}
function paintLegs(ctx,d,back){const base=d.colors.base,p=R.path(gp(d),back),dark=parseInt(base.slice(1),16)<0x303030;
 const gr=ctx.createLinearGradient(140,0,460,0);gr.addColorStop(0,shade(base,-24));gr.addColorStop(.3,shade(base,dark?24:12));gr.addColorStop(.7,shade(base,dark?18:8));gr.addColorStop(1,shade(base,-24));
 ctx.save();ctx.shadowColor='#000';ctx.shadowBlur=26;ctx.shadowOffsetY=8;ctx.fillStyle=gr;ctx.fill(p);ctx.restore();
 ctx.save();ctx.clip(p);ctx.fillStyle=shade(base,dark?14:-18);ctx.fillRect(0,80,600,55);ctx.strokeStyle=shade(base,dark?40:-45);ctx.lineWidth=1.2;ctx.setLineDash([3,3]);
 ctx.beginPath();ctx.moveTo(150,134);ctx.lineTo(450,134);ctx.moveTo(150,86);ctx.lineTo(450,86);ctx.stroke();ctx.setLineDash([]);ctx.lineWidth=2;ctx.strokeStyle=shade(base,-40);if(d.garment==='joggers'){ctx.fillStyle=shade(base,dark?14:-18);ctx.fillRect(0,712,600,40);}ctx.beginPath();ctx.moveTo(300,135);ctx.lineTo(300,330);ctx.stroke();ctx.restore();legStripe(ctx,d,back);}
function legStripe(ctx,d,back){if(!d.colors.stripe)return;ctx.save();ctx.clip(R.path(gp(d),back));ctx.strokeStyle=d.colors.stripe;ctx.lineWidth=d.colors.stripeWidth||7;ctx.beginPath();if(d.garment==='shorts'){ctx.moveTo(171,100);ctx.lineTo(157,300);ctx.lineTo(146,430);ctx.moveTo(429,100);ctx.lineTo(443,300);ctx.lineTo(454,430);}else{ctx.moveTo(162,100);ctx.lineTo(160,300);ctx.lineTo(195,750);ctx.moveTo(438,100);ctx.lineTo(440,300);ctx.lineTo(405,750);}ctx.stroke();ctx.restore();}
const BP=[['Black','Red'],['Navy','Yellow'],['Cobalt','Orange'],['Teal','Coral']];
function bottleBody(sz){const p=new Path2D(),b=sz===28?728:700;p.moveTo(196,236);p.lineTo(404,236);p.quadraticCurveTo(414,240,414,256);p.lineTo(410,b-16);p.quadraticCurveTo(408,b,390,b);p.lineTo(210,b);p.quadraticCurveTo(192,b,190,b-16);p.lineTo(186,256);p.quadraticCurveTo(186,240,196,236);p.closePath();return p;}
function bottleLid(){const p=new Path2D();p.moveTo(206,236);p.lineTo(200,130);p.quadraticCurveTo(200,118,214,116);p.lineTo(386,116);p.quadraticCurveTo(400,118,400,130);p.lineTo(394,236);p.closePath();return p;}
function paintBottle(ctx,d,back){const base=d.colors.base,lid=d.colors.lid||C.Red,sz=d.size||24,B=bottleBody(sz),L=bottleLid();
 const g=ctx.createLinearGradient(186,0,414,0);g.addColorStop(0,shade(base,-30));g.addColorStop(.3,shade(base,30));g.addColorStop(.42,shade(base,10));g.addColorStop(1,shade(base,-36));
 ctx.save();ctx.shadowColor='#000';ctx.shadowBlur=28;ctx.shadowOffsetY=10;ctx.fillStyle=g;ctx.fill(B);ctx.restore();
 ctx.save();ctx.clip(B);ctx.fillStyle='#ffffff14';ctx.fillRect(232,250,18,(sz===28?460:430));ctx.strokeStyle=shade(base,30);ctx.lineWidth=1;for(const y of [640,660])if(!back){ctx.beginPath();ctx.moveTo(400,y);ctx.lineTo(380,y);ctx.stroke();}ctx.restore();
 const lg=ctx.createLinearGradient(200,0,400,0);lg.addColorStop(0,shade(lid,-40));lg.addColorStop(.3,shade(lid,30));lg.addColorStop(1,shade(lid,-45));
 ctx.save();ctx.shadowColor='#000';ctx.shadowBlur=12;ctx.fillStyle=lg;ctx.fill(L);ctx.restore();
 ctx.fillStyle=shade(lid,-25);ctx.fillRect(204,214,192,22);ctx.strokeStyle=shade(lid,-60);ctx.lineWidth=2;for(let x=214;x<392;x+=12){ctx.beginPath();ctx.moveTo(x,216);ctx.lineTo(x,234);ctx.stroke();}
 /* spout + flip cap */ctx.fillStyle=shade(lid,-10);const sx=back?330:270;ctx.beginPath();ctx.roundRect(sx-22,92,44,26,8);ctx.fill();ctx.fillStyle=shade(lid,20);ctx.beginPath();ctx.roundRect(back?230:330,100,46,16,6);ctx.fill();}
function topExtras(ctx,d,back){const g=d.garment,base=d.colors.base,dark=parseInt(base.slice(1),16)<0x303030;if(g==='tee')return;
 for(const sd of [-1,1]){const m=x=>300+sd*(x-300),p=new Path2D();p.moveTo(m(506),226);p.bezierCurveTo(m(518),300,m(524),420,m(526),560);p.lineTo(m(488),572);p.bezierCurveTo(m(484),450,m(480),340,m(470),280);p.closePath();
  const gr=ctx.createLinearGradient(m(470),0,m(556),0);gr.addColorStop(0,shade(base,dark?20:6));gr.addColorStop(1,shade(base,-20));ctx.save();ctx.shadowColor='#000';ctx.shadowBlur=14;ctx.fillStyle=gr;ctx.fill(p);ctx.restore();
  ctx.fillStyle=shade(base,dark?12:-16);ctx.beginPath();ctx.moveTo(m(526),560);ctx.lineTo(m(488),572);ctx.lineTo(m(490),594);ctx.lineTo(m(528),582);ctx.closePath();ctx.fill();}
 if(g==='hoodie'||g==='zip'){ctx.fillStyle=shade(base,dark?12:-16);ctx.fillRect(188,676,226,30);}
 if(g==='hoodie'){ctx.save();ctx.strokeStyle=shade(base,dark?36:-40);ctx.lineWidth=14;ctx.beginPath();if(back){ctx.moveTo(236,112);ctx.bezierCurveTo(240,190,360,190,364,112);}else{ctx.moveTo(240,110);ctx.bezierCurveTo(250,170,350,170,360,110);}ctx.stroke();
  if(!back){ctx.lineWidth=3;ctx.strokeStyle=shade(base,dark?60:-60);ctx.beginPath();ctx.moveTo(284,150);ctx.lineTo(282,250);ctx.moveTo(316,150);ctx.lineTo(318,250);ctx.stroke();
   ctx.lineWidth=2;ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(230,520);ctx.lineTo(370,520);ctx.lineTo(392,640);ctx.lineTo(208,640);ctx.closePath();ctx.stroke();ctx.setLineDash([]);}ctx.restore();}
 if(g==='zip'&&!back){ctx.save();ctx.strokeStyle='#cfcfd6';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(300,132);ctx.lineTo(300,704);ctx.stroke();ctx.fillStyle='#e8e8ee';ctx.fillRect(294,140,12,22);ctx.restore();}}
function drawTee(ctx,d,o){o=o||{};const view=o.view||d.view||'front',back=view==='back',base=d.colors.base,LG=legs(d),BT=bot(d),K=zk(d);ctx.clearRect(0,0,600,800);
 if(!o.print&&BT){const bg=ctx.createLinearGradient(0,0,0,800);bg.addColorStop(0,'#1d1238');bg.addColorStop(1,'#0b0618');ctx.fillStyle=bg;ctx.fillRect(0,0,600,800);paintBottle(ctx,d,back);}else
 if(!o.print&&LG){const bg=ctx.createLinearGradient(0,0,0,800);bg.addColorStop(0,'#1d1238');bg.addColorStop(1,'#0b0618');ctx.fillStyle=bg;ctx.fillRect(0,0,600,800);paintLegs(ctx,d,back);}
 else if(!o.print){const bg=ctx.createLinearGradient(0,0,0,800);bg.addColorStop(0,'#1d1238');bg.addColorStop(1,'#0b0618');ctx.fillStyle=bg;ctx.fillRect(0,0,600,800);
  const gl=ctx.createRadialGradient(300,0,20,300,0,520);gl.addColorStop(0,'#ffd9a055');gl.addColorStop(1,'#0000');ctx.fillStyle=gl;ctx.fillRect(0,0,600,800);
  ctx.save();ctx.transform(...TM);const B=rawBody(back),SL=rawSleeve(-1),SR=rawSleeve(1),dark=parseInt(base.slice(1),16)<0x303030;
  const lift=dark?26:12;
  ctx.save();ctx.shadowColor='#000';ctx.shadowBlur=30;ctx.shadowOffsetY=10;ctx.fillStyle=base;ctx.fill(SL);ctx.fill(SR);ctx.fill(B);ctx.restore();
  for(const [p,x0,x1] of [[SL,100,200],[SR,500,400]]){const g=ctx.createLinearGradient(x0,0,x1,0);g.addColorStop(0,shade(base,-10));g.addColorStop(1,shade(base,lift*.6));ctx.fillStyle=g;ctx.fill(p);}
  const g=ctx.createLinearGradient(186,0,414,0);g.addColorStop(0,shade(base,-14));g.addColorStop(.35,shade(base,lift));g.addColorStop(.6,shade(base,lift*.7));g.addColorStop(1,shade(base,-18));ctx.fillStyle=g;ctx.fill(B);
  ctx.save();ctx.clip(B);/* soft folds */ctx.globalAlpha=.22;ctx.strokeStyle=shade(base,-40);ctx.lineWidth=10;ctx.filter='blur(6px)';
  ctx.beginPath();ctx.moveTo(230,300);ctx.quadraticCurveTo(250,480,236,690);ctx.moveTo(372,320);ctx.quadraticCurveTo(352,500,366,690);ctx.stroke();ctx.filter='none';ctx.globalAlpha=1;
  const lg=ctx.createRadialGradient(300,240,10,300,300,260);lg.addColorStop(0,'#ffffff10');lg.addColorStop(1,'#0000');ctx.fillStyle=lg;ctx.fillRect(150,100,300,600);ctx.restore();
  /* collar rib */ctx.save();ctx.lineWidth=12;ctx.strokeStyle=shade(base,dark?18:-22);ctx.beginPath();ctx.moveTo(250,108);if(back)ctx.quadraticCurveTo(300,122,350,108);else ctx.bezierCurveTo(268,150,332,150,350,108);ctx.stroke();
  ctx.lineWidth=1.2;ctx.setLineDash([3,3]);ctx.strokeStyle=shade(base,dark?50:-50);ctx.beginPath();ctx.moveTo(244,118);if(back)ctx.quadraticCurveTo(300,132,356,118);else ctx.bezierCurveTo(266,162,334,162,356,118);ctx.stroke();
  /* hems + shoulder seams */ctx.beginPath();ctx.moveTo(190,684);ctx.quadraticCurveTo(300,700,410,684);ctx.stroke();
  for(const sd of [-1,1]){const m=x=>300+sd*(x-300);ctx.beginPath();ctx.moveTo(m(500),236);ctx.lineTo(m(476),272);ctx.stroke();ctx.setLineDash([]);ctx.lineWidth=1.5;ctx.strokeStyle=shade(base,dark?14:-30);ctx.beginPath();ctx.moveTo(m(404),136);ctx.bezierCurveTo(m(400),190,m(400),225,m(402),258);ctx.stroke();ctx.setLineDash([3,3]);ctx.lineWidth=1.2;ctx.strokeStyle=shade(base,dark?50:-50);}
  ctx.restore();topExtras(ctx,d,back);ctx.restore();}
 /* stickers per zone, clipped to print area */
 const glow=o.print?0:.6;
 for(const z of K){if(!zoneVisible(z,view))continue;ctx.save();if(!(LG&&!ZONES[z].band))ctx.clip(zonePath(z,view));if(LG)ctx.clip(R.path(gp(d),back));else if(BT)ctx.clip(ZONES[z].lid?bottleLid():bottleBody(d.size||24));else if(ZONES[z].sleeve){const [x,y,w,h]=ZONES[z].rect;const r=new Path2D();const sx=mir(z,view)?600-x-w:x;r.rect(sx,y,w,h);ctx.clip(r);}else if(!ZONES[z].hem)ctx.clip(body(back));
  for(const s of sorted(d.zones[z]))drawEl(ctx,toScreen(z,view,s),glow);ctx.restore();}
 if(!o.print&&o.guides!==false){ctx.save();ctx.setLineDash([6,6]);ctx.strokeStyle='#ffffff38';ctx.lineWidth=1.5;if(LG||BT){for(const z of K)if(zoneVisible(z,view))ctx.strokeRect(...ZONES[z].rect);}else{const Z=ZONES[back?'back':'front'];ctx.strokeRect(...Z.rect);}ctx.restore();
  if(o.zone&&zoneVisible(o.zone,view)){ctx.save();ctx.strokeStyle='#ff2bd6';ctx.shadowColor='#ff2bd6';ctx.shadowBlur=16;ctx.lineWidth=3.5;const Zs=ZONES[o.zone];if(Zs.low){const [x,y,w,h]=Zs.rect,sx=mir(o.zone,view)?600-x-w:x,r=new Path2D();r.rect(sx,y,w,h);ctx.save();ctx.clip(r);ctx.stroke(zonePath(o.zone,view));ctx.stroke(zonePath(o.zone,view));ctx.restore();ctx.save();ctx.clip(zonePath(o.zone,view));ctx.stroke(r);ctx.restore();}else{ctx.stroke(zonePath(o.zone,view));ctx.stroke(zonePath(o.zone,view));}ctx.restore();}
  if(o.sel&&o.zone&&zoneVisible(o.zone,view)){const s=(d.zones[o.zone]||[]).find(x=>x.id===o.sel);if(s){const b=boxOf(o.zone,view,s),H=handles(b);ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.r);ctx.strokeStyle='#ffe14a';ctx.lineWidth=2;ctx.setLineDash([7,5]);ctx.strokeRect(-b.w/2-6,-b.h/2-6,b.w+12,b.h+12);ctx.setLineDash([]);
   ctx.beginPath();ctx.moveTo(0,-b.h/2-6);ctx.lineTo(0,-b.h/2-30);ctx.stroke();ctx.restore();
   for(const [k,p] of Object.entries(H)){ctx.beginPath();ctx.arc(p[0],p[1],11,0,7);ctx.fillStyle=k==='rot'?'#22e6ff':'#ffe14a';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=10;ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#0b0618';ctx.font='bold 14px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(k==='rot'?'⟳':'⤡',p[0],p[1]+1);}}}
  if(o.label!==false){ctx.fillStyle='#fff';ctx.font='bold 22px system-ui,sans-serif';ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.fillText(`${d.name} · ${BT?`Shaker Bottle ${d.size||24} oz`:(R.G[d.garment]||{n:'Tee'}).n}${back?' · BACK':' · FRONT'}`,300,40);
   if(d.designer&&d.designer.name){ctx.font='italic 15px system-ui';ctx.fillStyle='#ffe14a';ctx.fillText('designs by '+d.designer.name,300,64);}}}}
function handles(b){const c=Math.cos(b.r),s=Math.sin(b.r),T=(u,v)=>[b.x+u*c-v*s,b.y+u*s+v*c];return {rot:T(0,-b.h/2-30),size:T(b.w/2+6,b.h/2+6)};}
/* hit: returns {kind:'rot'|'size'|'sticker'|'zone',zone,id} */
function teeHit(d,x,y,view,selZone,selId){
 if(selZone&&selId&&zoneVisible(selZone,view)){const s=(d.zones[selZone]||[]).find(q=>q.id===selId);if(s){const H=handles(boxOf(selZone,view,s));for(const k in H)if(Math.hypot(x-H[k][0],y-H[k][1])<20)return {kind:k,zone:selZone,id:selId};}}
 const K=zk(d),order=[...K].sort((a,b)=>(a===selZone?-1:0)-(b===selZone?-1:0));
 for(const z of order){if(!zoneVisible(z,view))continue;const arr=sorted(d.zones[z]).reverse();for(const s of arr){const b=boxOf(z,view,s),dx=x-b.x,dy=y-b.y,c=Math.cos(-b.r),sn=Math.sin(-b.r),u=dx*c-dy*sn,v=dx*sn+dy*c;if(Math.abs(u)<=b.w/2+6&&Math.abs(v)<=b.h/2+6)return {kind:'sticker',zone:z,id:s.id};}}
 const c=document.createElement('canvas').getContext('2d');if(bot(d)){for(const z of K){const Z=ZONES[z],[rx,ry,rw,rh]=Z.rect;if((Z.lid||Z.view===view)&&x>=rx-10&&x<=rx+rw+10&&y>=ry-10&&y<=ry+rh+10)return {kind:'zone',zone:z};}return null;}
 if(legs(d)){if(!c.isPointInPath(R.path(gp(d),view==='back'),x,y))return null;for(const z of K){const Z=ZONES[z],[rx,ry,rw,rh]=Z.rect;if(Z.view===view&&x>=rx&&x<=rx+rw&&y>=ry&&y<=ry+rh)return {kind:'zone',zone:z};}return null;}
 for(const z of K){const Z=ZONES[z];if(Z.low&&zoneVisible(z,view)&&c.isPointInPath(zonePath(z,view),x,y)){const [,ry,,rh]=Z.rect;if(y>=ry-6&&y<=ry+rh+6)return {kind:'zone',zone:z};}}
 for(const z of K){const Z=ZONES[z];if(Z.hem&&Z.view===view){const [rx,ry,rw,rh]=Z.rect;if(x>=rx&&x<=rx+rw&&y>=ry-4&&y<=ry+rh+4)return {kind:'zone',zone:z};}}
 for(const z of ZK){if(zoneVisible(z,view)&&ZONES[z].sleeve&&c.isPointInPath(zonePath(z,view),x,y))return {kind:'zone',zone:z};}
 if(c.isPointInPath(body(view==='back'),x,y))return {kind:'zone',zone:view==='back'?'back':'front'};return null;}
function zoneCenter(z){const [x,y,w,h]=ZONES[z].rect;return ZONES[z].sleeve?[x+w/2+ZONES[z].side*4,y+h*.48]:[x+w/2,y+h*.4];}
function fitScale(el,z,base){const Z=ZONES[z],[,,rw,rh]=Z.rect,[w,h]=dims({el,scale:1});return Math.min(base,(rw*.9)/w,(rh*.9)/h);}
/* stickers in lower-sleeve zones lie flat along the sleeve axis; hem band ones lie flat along the hem */
function sticker(el,colors,z,extra){const s=sticker0(el,colors,z,extra),Z=ZONES[z];if(!Z||!(Z.low||Z.hem))return s;const [rx,ry,rw,rh]=Z.rect;
 if(el==='stripe'){s.len=Math.round((Z.hem?rw:rh)*.85);s.thick=Math.min(s.thick,Z.hem?.25:.375);}
 const base=dims({...s,rotation:0}),along=Z.hem?false:(el==='stripe'||el==='text'||el==='word'||base[0]>base[1]*1.3);
 s.rotation=Z.hem?0:along?Z.side*(90-SLV_TILT):-Z.side*SLV_TILT;
 if(!(extra&&extra.scale)&&el!=='stripe'){const [w,h]=base,lw=Z.hem?rw*.9:along?rh*.9:rw*.62,lh=Z.hem?rh*.82:along?rw*.42:rh*.88;s.scale=+(s.scale*Math.min(lw/w,lh/h)).toFixed(3);}
 s.y=ry+rh/2;s.x=Z.low?sleeveAxisX(Z,s.y):rx+rw/2;return s;}
function sticker0(el,colors,z,extra){const [x,y]=zoneCenter(z),Z=ZONES[z];if(el==='stripe'){const Z0=ZONES[z],[,,rw0,rh0]=Z0.rect,vert=rh0>rw0*1.5;return {id:'s'+Math.random().toString(36).slice(2,8),el,lines:1,thick:.25,len:Math.round((vert?rh0:rw0)*.8),...(extra||{}),colors:{body:colors.body,hair:colors.body},x,y:Z0.band?Z0.rect[1]+Z0.rect[3]/2:y,scale:1,rotation:vert?90:0,z:0};}if(el==='text'){const s0={el,scale:1,...(extra||{})},[w,h]=dims(s0),[,,rw,rh]=Z.rect;const sc=+Math.min(Z.band?1:1.6,rw*.8/w,rh*.8/h).toFixed(3);return {id:'s'+Math.random().toString(36).slice(2,8),el,colors:{body:colors.body,hair:colors.body},x,y:Z.band?Z.rect[1]+Z.rect[3]/2:y,scale:sc,rotation:0,z:0,...(extra||{}),...(extra&&extra.scale?{scale:extra.scale}:{})};}let sc=Z.sleeve?(el==='word'?.55:.7):(el==='word'?1.1:1.5);if(Z.g==='bottle')sc=fitScale(el,z,Z.lid?.6:el==='leg'?1:1.3);else if(Z.g==='leggings')sc=fitScale(el,z,el==='leg'?1.5:Z.band?1:1.2);
 const yy=Z.g==='bottle'?Z.rect[1]+Z.rect[3]/2:Z.band?Z.rect[1]+Z.rect[3]/2:Z.g==='leggings'?(el==='leg'?Z.rect[1]+Z.rect[3]*.4:Z.rect[1]+Z.rect[3]*.3):y;
 return {id:'s'+Math.random().toString(36).slice(2,8),el,colors:{body:colors.body,hair:colors.hair||colors.body},x,y:yy,scale:sc,rotation:ZONES[z].sleeve&&el==='word'?90*ZONES[z].side:0,z:0,...(extra||{})};}
/* ---- v2 factory / upgrade / validate ---- */
function v2fields(d,who){d.version=2;if(!d.designer)d.designer=who||{name:d.author||'Guy',role:d.author==='JimmiBot'?'bot':'owner'};if(!d.status)d.status='draft';if(d.reviewNotes==null)d.reviewNotes='';if(!Array.isArray(d.history))d.history=[];if(d.creditTag==null)d.creditTag=false;return d;}
function make(o){return v2fields(v1make(o),o&&o.designer);}
function makeTee(o){o=o||{};const d=v1make({garment:'tee',base:o.base||C.Black,logo:o.ink||C.Red,name:o.name||'New Jimmi tee',author:o.author||'Guy'});d.editor='tee';d.view='front';
 d.zones={front:[sticker('logo',{body:C.Red,hair:C.Red},'front',{id:'s-front1'})],back:[],leftSleeve:[],rightSleeve:[]};return v2fields(d,o.designer);}
function makeLeggings(o){o=o||{};const d=v1make({garment:'leggings',base:o.base||C.Navy,logo:o.ink||C.Yellow,name:o.name||'New Jimmi leggings',author:o.author||'Guy'});d.editor='tee';d.view='front';
 d.zones={waistband:[],waistbandBack:[],rightLeg:[],leftLeg:[],seat:[]};d.zones.leftLeg.push(sticker('leg',{body:o.ink||C.Yellow},'leftLeg',{id:'s-leg1'}));return v2fields(d,o.designer);}
/* repeat / pattern. mode: 'wrap' (all the way around the waistband: front + back), 'row' (across the zone), 'column' (down the zone).
   Replaces the source sticker (and any earlier copies in its group) with count evenly spaced copies sharing a new group id. Returns the new stickers. */
function repeat(d,zone,src,o){o=o||{};const n=Math.max(1,Math.min(40,o.count|0||8)),gap=+(o.gap||0),mode=o.mode||'row',gid='g'+Math.random().toString(36).slice(2,7);
 const zs=mode==='wrap'&&legs(d)?[bandOf(d,0),bandOf(d,1)]:[zone];
 if(src.group)for(const z of zk(d))d.zones[z]=(d.zones[z]||[]).filter(q=>q.group!==src.group);
 d.zones[zone]=(d.zones[zone]||[]).filter(q=>q.id!==src.id);
 const [rx,ry,rw,rh]=ZONES[zs[0]].rect,rot=src.rotation||0,vert=mode==='column';
 const one=k=>{const t={...src,rotation:rot,scale:k};const [w,h]=dims(t);const c=Math.abs(Math.cos(rot*Math.PI/180)),s=Math.abs(Math.sin(rot*Math.PI/180));return vert?h*c+w*s:w*c+h*s;};
 const cross=k=>{const t={...src,rotation:rot,scale:k};const [w,h]=dims(t);const c=Math.abs(Math.cos(rot*Math.PI/180)),s=Math.abs(Math.sin(rot*Math.PI/180));return vert?w*c+h*s:h*c+w*s;};
 const len=(vert?rh:rw)*zs.length,pitch=len/n;let k=src.scale;
 if(one(k)>pitch-gap)k=k*Math.max(.05,pitch-gap)/one(k);if(ZONES[zs[0]].band&&cross(k)>rh*.9)k=k*rh*.9/cross(k);k=Math.max(.05,+k.toFixed(3));
 const out=[];let z0=Math.max(0,...zs.flatMap(z=>(d.zones[z]||[]).map(q=>q.z||0)));
 for(let i=0;i<n;i++){const t=(i+.5)*pitch,zi=Math.min(zs.length-1,Math.floor(t/(vert?rh:rw))),loc=t-zi*(vert?rh:rw),z=zs[zi];
  const s={...JSON.parse(JSON.stringify(src)),id:'s'+Math.random().toString(36).slice(2,8),group:gid,scale:k,z:++z0};
  if(vert){s.y=ry+loc;}else{s.x=rx+loc;if(ZONES[z].band)s.y=ry+rh/2;}(d.zones[z]=d.zones[z]||[]).push(s);out.push(s);}
 return out;}
function makeShorts(o){o=o||{};const d=makeLeggings({...o,name:o.name||'New Jimmi gym shorts',base:o.base||C.Black});d.garment='shorts';d.zones={};SK.forEach(k=>d.zones[k]=[]);d.zones.shLeftLeg.push(sticker('logo',{body:o.ink||C.Red,hair:o.ink||C.Red},'shLeftLeg',{id:'s-sh1'}));return d;}
function makeEditor(g,o){o=o||{};if(g==='bottle')return makeBottle(o);if(g==='shorts')return makeShorts(o);if(g==='leggings'||g==='joggers'){const d=makeLeggings(o);d.garment=g;if(o.base)d.colors.base=o.base;return d;}
 const d=makeTee(o);d.garment=g;d.name=o.name||('New Jimmi '+R.G[g].n.toLowerCase());if(o.base)d.colors.base=o.base;if(['longsleeve','hoodie','zip'].includes(g)){d.wrist17=1;return upgrade(d);}return d;}
function badge(d,zone,colors){const Z=ZONES[zone],[rx,ry,rw,rh]=Z.rect,gid='b'+Math.random().toString(36).slice(2,7),S=Math.min(rw,rh),cx=rx+rw/2,cy=Z.sleeve?ry+rh*.48:ry+Math.min(rh/2,S*.55);
 const zm=Math.max(0,...(d.zones[zone]||[]).map(q=>q.z||0));const H=sticker('head',{body:colors.body,hair:colors.hair||colors.body},zone,{group:gid});const [hw,hh]=dims({el:'head',scale:1});H.scale=+(S*.34/hh).toFixed(3);H.x=cx;H.y=cy;H.z=zm+1;
 const top={id:'s'+Math.random().toString(36).slice(2,8),el:'text',text:'Jimmi',font:'script',curve:150,spacing:2,colors:{body:colors.body,hair:colors.body},rotation:0,group:gid,z:zm+2,scale:1,x:cx,y:0};
 const bot={id:'s'+Math.random().toString(36).slice(2,8),el:'text',text:'at the gym',font:'round',curve:-130,spacing:4,colors:{body:colors.body,hair:colors.body},rotation:0,group:gid,z:zm+3,scale:1,x:cx,y:0};
 const [tw]=dims(top);top.scale=+(S*.62/tw).toFixed(3);const [,th]=dims(top);const [bw]=dims(bot);bot.scale=+(S*.6/bw).toFixed(3);const [,bh]=dims(bot);const hd=S*.34/2;
 top.y=cy-hd-th/2-S*.02;bot.y=cy+hd+bh/2+S*.02;(d.zones[zone]=d.zones[zone]||[]).push(H,top,bot);return [H,top,bot];}
function makeBottle(o){o=o||{};const d=v1make({garment:'bottle',base:o.base||C.Black,logo:o.ink||C.Red,name:o.name||'New Jimmi shaker',author:o.author||'Guy'});d.editor='tee';d.view='front';d.size=o.size||24;d.colors.lid=o.lid||C.Red;
 d.zones={bottleFront:[sticker('logo',{body:o.ink||C.Red},'bottleFront',{id:'s-bot1'})],bottleBack:[],lid:[]};return v2fields(d,o.designer);}
function ungroup(d,gid){let n=0;for(const z of zk(d))(d.zones[z]||[]).forEach(s=>{if(s.group===gid){delete s.group;n++;}});return n;}
/* classic (no editor) leggings/tee/bottle -> new editor zones. Keeps logo/wordmark fields so v1 readers still work. */
function inRect(z,x,y){const [rx,ry,rw,rh]=ZONES[z].rect;return x>=rx&&x<=rx+rw&&y>=ry&&y<=ry+rh;}
function clampTo(z,s){const [rx,ry,rw,rh]=ZONES[z].rect;s.x=Math.max(rx,Math.min(rx+rw,s.x));s.y=Math.max(ry,Math.min(ry+rh,s.y));return s;}
function zoneFor(g,side,x,y){if(g==='joggers')g='leggings';const K=g==='leggings'?LK:g==='bottle'?BK:['front','back'];
 const c=K.filter(z=>(ZONES[z].view||side)===side&&!ZONES[z].sleeve);return c.find(z=>inRect(z,x,y))||(g==='leggings'?(side==='back'?(y<135?'waistbandBack':'seat'):(y<135?'waistband':x<300?'rightLeg':'leftLeg')):g==='bottle'?(side==='back'?'bottleBack':'bottleFront'):side);}
function migrateClassic(d){const g=d.garment;if(d.editor||!R.G[g])return d;d.editor='tee';d.migratedFrom='classic';
 d.zones={};(g==='leggings'||g==='joggers'?LK:g==='bottle'?BK:ZK).forEach(z=>d.zones[z]=[]);const col=d.colors||{};let n=0;
 const put=(s,side)=>{const z=zoneFor(g,side||'front',s.x,s.y);if(!legs(d)){if(!inRect(z,s.x,s.y)||Math.abs(s.rotation||0)>30){const [cx,cy]=zoneCenter(z);s.x=cx;s.y=s.el==='word'?cy+ZONES[z].rect[3]*.25:cy;s.rotation=0;}s.scale=Math.min(s.scale,fitScale(s.el,z,3));clampTo(z,s);}s.z=++n;d.zones[z].push(s);};
 if(d.logo&&typeof d.logo.x==='number')put({id:'m-logo',el:'logo',colors:{body:col.logo||C.Yellow,hair:col.hair||col.logo||C.Yellow},x:d.logo.x,y:d.logo.y,scale:+((d.logo.scale||1)*150/LH).toFixed(3),rotation:0},d.logo.side);
 if(d.wordmark&&!d.wordmark.hidden&&typeof d.wordmark.x==='number')put({id:'m-word',el:'word',colors:{body:col.logo||C.Yellow,hair:col.logo||C.Yellow},x:d.wordmark.x,y:d.wordmark.y,scale:+((d.wordmark.scale||1)*290/WW).toFixed(3),rotation:d.wordmark.rotation||0},d.wordmark.side);
 if(g==='bottle'&&!col.lid)col.lid=C.Red;return d;}
function upgrade(d){d=JSON.parse(JSON.stringify(d));v2fields(d);migrateClassic(d);if(d.editor==='tee'){d.zones=d.zones||{};if(['longsleeve','hoodie','zip'].includes(d.garment)){const mv=(from,to,dy)=>{const a=d.zones[from];if(!a)return;delete d.zones[from];(d.zones[to]=d.zones[to]||[]).push(...a.map(s=>({...s,y:s.y+(dy||0)})));};mv('leftSleeve','leftArm');mv('leftForearm','leftArm');mv('rightSleeve','rightArm');mv('rightForearm','rightArm');for(const k of ['leftWrist','rightWrist'])if(d.zones[k]&&!d.wrist17)d.zones[k]=d.zones[k].map(s=>({...s,y:s.y+24}));d.wrist17=1;}zk(d).forEach(k=>d.zones[k]=d.zones[k]||[]);}return d;}
const HX=/^#[0-9a-fA-F]{6}$/;
function validate(d){if(d&&d.version===2){const e=v1validate({...d,version:1});if(d.editor==='tee'){if(!d.zones||typeof d.zones!=='object')e.push('zones missing');else for(const z in d.zones){if(!ZONES[z]||!(zk(d).includes(z)||(LST.includes('leftArm')&&['longsleeve','hoodie','zip'].includes(d.garment)&&OLDLOW.includes(z))))e.push('unknown zone '+z);else (d.zones[z]||[]).forEach(s=>{if(!EL[s.el])e.push('element not allowed: '+s.el);if(!s.colors||!HX.test(s.colors.body||''))e.push('sticker colors.body must be #rrggbb');if(s.el==='stripe'){if(![1,2,3].includes(s.lines))e.push('stripe lines must be 1-3');if(!(s.thick>=STH[0]-1e-9&&s.thick<=STH[1]))e.push('stripe thick must be 1/32..2 in');if(!(s.len>0))e.push('stripe len >0');}if(s.el==='text'){if(!TEXTS.includes(s.text))e.push('text not allowed: '+s.text);if(!FONTS[s.font])e.push('bad font '+s.font);if(typeof s.curve!=='number'||Math.abs(s.curve)>360)e.push('curve must be -360..360');}['x','y','scale'].forEach(k=>{if(typeof s[k]!=='number')e.push('sticker '+k+' missing')});});}}
 if(bot(d)){if(d.colors.lid!=null&&!HX.test(d.colors.lid))e.push('colors.lid must be #rrggbb');if(d.size!=null&&![24,28].includes(d.size))e.push('size must be 24 or 28');}
 if(d.status&&!['draft','submitted','approved','rejected'].includes(d.status))e.push('bad status '+d.status);return e;}return v1validate(d);}
/* ---- exports ---- */
function footer(c,d){if(!d.designer||!d.designer.name)return c;const o=document.createElement('canvas'),fh=Math.round(c.height*.05);o.width=c.width;o.height=c.height+fh;const x=o.getContext('2d');x.drawImage(c,0,0);x.fillStyle='#0b0618';x.fillRect(0,c.height,o.width,fh);x.fillStyle='#ff2bd6';x.fillRect(0,c.height,o.width,4);
 x.fillStyle='#fff';x.font=`italic ${Math.round(fh*.45)}px system-ui,sans-serif`;x.textAlign='center';x.textBaseline='middle';x.fillText(`Jimmi at the gym · ${d.name} · designs by ${d.designer.name}${d.status==='approved'?' · approved by Guy':''}`,o.width/2,c.height+fh/2+2);return o;}
function tag(c,d){if(!d.creditTag||!d.designer||!d.designer.name)return c;const x=c.getContext('2d');x.save();x.setTransform(1,0,0,1,0,0);x.fillStyle='#ffffffcc';x.font=`${Math.round(c.height*.018)}px system-ui`;x.textAlign='right';x.fillText('designs by '+d.designer.name,c.width-12,c.height-12);x.restore();return c;}
function zonePrint(d,z,dpi){const Z=ZONES[z],[rx,ry,rw,rh]=Z.rect,W2=Math.round(Z.inch[0]*(dpi||150)),k=W2/rw,c=document.createElement('canvas');c.width=W2;c.height=Math.round(rh*k);const x=c.getContext('2d');x.scale(k,k);x.translate(-rx,-ry);
 if(Z.low)x.clip(lowSleeve(Z.side));else if(Z.sleeve)x.clip(sleeve(Z.side));if(Z.g==='leggings'){x.clip(R.path(gp(d),Z.view==='back'));if(!Z.band)legStripe(x,d,Z.view==='back');}if(Z.g==='bottle')x.clip(Z.lid?bottleLid():bottleBody(d.size||24));const r=new Path2D();r.rect(rx,ry,rw,rh);x.clip(r);for(const s of sorted(d.zones[z]))drawEl(x,s,0);return c;}
function legacySheet(d,print,px){const vs=[...new Set([d.logo.side||'front',d.wordmark.hidden?(d.logo.side||'front'):(d.wordmark.side||'front'),d.view||'front'])].sort();const cs=vs.map(v=>R.render(d,{print,view:v,px}));if(cs.length===1)return cs[0];const c=document.createElement('canvas');c.width=cs[0].width*cs.length;c.height=px;cs.forEach((s,i)=>c.getContext('2d').drawImage(s,i*s.width,0));return c;}
function teeView(d,view,px){const k=px/800,c=document.createElement('canvas');c.width=Math.round(600*k);c.height=px;const x=c.getContext('2d');x.scale(k,k);drawTee(x,d,{view,label:false,guides:false});return c;}
/* exports(d,{px}) -> [{suffix, canvas}] */
function exportsOf(d,o){o=o||{};const px=o.px||2000;
 if(d.editor!=='tee')return [{suffix:'mockup',canvas:footer(legacySheet(d,false,px),d)},{suffix:'print',canvas:tag(legacySheet(d,true,px),d)}];
 if(legs(d)||bot(d)){const K=zk(d),f=teeView(d,'front',px),b=teeView(d,'back',px),m=document.createElement('canvas');m.width=f.width*2;m.height=px;m.getContext('2d').drawImage(f,0,0);m.getContext('2d').drawImage(b,f.width,0);
  return [{suffix:'mockup',canvas:footer(m,d)},...K.map((z,i)=>({suffix:'print-'+z.replace(/[A-Z]/g,c=>'-'+c.toLowerCase()),canvas:i===0?tag(zonePrint(d,z),d):zonePrint(d,z)}))];}
 const f=teeView(d,'front',px),b=teeView(d,'back',px),m=document.createElement('canvas');m.width=f.width*2;m.height=px;m.getContext('2d').drawImage(f,0,0);m.getContext('2d').drawImage(b,f.width,0);
 return [{suffix:'mockup',canvas:footer(m,d)},{suffix:'print-front',canvas:tag(zonePrint(d,'front'),d)},{suffix:'print-back',canvas:zonePrint(d,'back')},...(zk(d).includes('leftSleeve')?[{suffix:'print-left-sleeve',canvas:zonePrint(d,'leftSleeve')},{suffix:'print-right-sleeve',canvas:zonePrint(d,'rightSleeve')}]:[]),...zk(d).filter(z=>ZONES[z].low||ZONES[z].hem).map(z=>({suffix:'print-'+z.replace(/[A-Z]/g,c=>'-'+c.toLowerCase()),canvas:zonePrint(d,z)}))];}
Object.assign(R,{LOWK,HEMK,lowSleeve,SK,shorts,isLegs:legs,bandOf,restyle,makeShorts,STH,PPI,stripeGeom,TEXTS,FONTS,textSticker,badge,textLayout,makeEditor,migrateClassic,BK,BP,makeBottle,ZONES,ZK,LK,zk,repeat,ungroup,makeLeggings,EL,PRESETS,make,makeTee,upgrade,validate,drawTee,teeHit,sticker,dims,drawEl,exportsOf,fromScreen,toScreen,zonePrint,zoneCenter});
})(window);

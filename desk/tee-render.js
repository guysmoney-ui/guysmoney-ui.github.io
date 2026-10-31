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
 seat:{n:'Back / seat',view:'back',g:'leggings',rect:[150,138,300,612],inch:[14,30]}};
ZONES.back.g='tee';
const ZK=['front','back','leftSleeve','rightSleeve'],LK=['waistband','waistbandBack','rightLeg','leftLeg','seat'];
const legs=d=>d&&d.garment==='leggings';const zk=d=>legs(d)?LK:ZK;
/* brand rule: ONLY these elements */
const EL={logo:{n:'Buff Jimmi logo',parts:['body','hair']},body:{n:'Logo only (no hair)',parts:['body']},hair:{n:'Spiky hair',parts:['hair']},
 word:{n:'Wordmark "Jimmi / at the gym"',parts:['word']},combo:{n:'Logo + wordmark',parts:['body','hair','word']},
 head:{n:'Just the Jimmi head',parts:['body','hair']},skinny:{n:'Skinny Jimmi logo',parts:['body']},leg:{n:'JIMMI down the leg',parts:['body']}};
const PRESETS=[['Yellow','Yellow'],['Red','Red'],['Coral','Coral'],['Orange','Orange'],['Gold','Gold'],['Neon','Pink'],['White','White'],['Cream','Gold'],['Black','Red'],['Cobalt','Yellow']];
const LH=100,WW=170;
function img(){return W.JIMMI_IMG;}
function dims(s){const A=img(),ar=A.body.naturalWidth/A.body.naturalHeight||0.93,war=A.word.naturalHeight/A.word.naturalWidth||0.39,k=s.scale;
 if(s.el==='word')return [WW*k,WW*war*k];if(s.el==='combo'){const w=Math.max(LH*ar,WW*.8);return [w*k,(LH+WW*.8*war+6)*k];}if(s.el==='hair')return [LH*.6*k,LH*.6*k*112/185];const I=n=>A[n].naturalWidth/A[n].naturalHeight||1;if(s.el==='head')return [LH*.8*I('headBody')*k,LH*.8*k];if(s.el==='skinny')return [LH*I('skinny')*k,LH*k];if(s.el==='leg')return [LH*3*I('leg')*k,LH*3*k];return [LH*ar*k,LH*k];}
function drawEl(ctx,s,glow){const A=img(),[w,h]=dims(s),cb=s.colors.body,ch=s.colors.hair||cb,t=R._tint;
 ctx.save();ctx.translate(s.x,s.y);ctx.rotate((s.rotation||0)*Math.PI/180);
 const L=(x,y,lw,lh,hair)=>{if(hair){ctx.shadowColor=ch;ctx.shadowBlur=glow*lh/40;ctx.drawImage(t(A.hair,ch),x,y,lw,lh);}else{ctx.shadowColor=cb;ctx.shadowBlur=glow*lh/40;ctx.drawImage(t(A.body,cb),x,y,lw,lh);}};
 if(s.el==='logo'){L(-w/2,-h/2,w,h);L(-w/2,-h/2,w,h,1);}
 else if(s.el==='body')L(-w/2,-h/2,w,h);
 else if(s.el==='hair'){/* crop hair band of the logo art */const hh=A.hair,cy=hh.naturalHeight*.15;ctx.shadowColor=ch;ctx.shadowBlur=glow*3;const sx=hh.naturalWidth/684;ctx.drawImage(t(hh,ch),240*sx,0,185*sx,112*sx,-w/2,-h/2,w,h);}
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
function sleeveSide(z,view){return view==='back'?-ZONES[z].side:ZONES[z].side;}
function zoneVisible(z,view){const Z=ZONES[z];return Z.sleeve?true:Z.view===view;}
function zonePath(z,view){const Z=ZONES[z];if(Z.sleeve)return sleeve(sleeveSide(z,view));const p=new Path2D(),[x,y,w,h]=Z.rect;p.rect(x,y,w,h);return p;}
/* map canonical sticker coords -> screen coords for view (sleeves mirror on the back) */
function mir(z,view){return ZONES[z].sleeve&&sleeveSide(z,view)!==ZONES[z].side;}
function toScreen(z,view,s){return mir(z,view)?{...s,x:600-s.x,rotation:-(s.rotation||0)}:s;}
function fromScreen(z,view,x){return mir(z,view)?600-x:x;}
function sorted(a){return [...(a||[])].sort((p,q)=>(p.z||0)-(q.z||0));}
function shade(hex,a){const n=parseInt(hex.slice(1),16);const f=v=>Math.max(0,Math.min(255,Math.round(v+a)));return `rgb(${f(n>>16)},${f(n>>8&255)},${f(n&255)})`;}
function boxOf(z,view,s){const t=toScreen(z,view,s),[w,h]=dims(s);return {x:t.x,y:t.y,w,h,r:(t.rotation||0)*Math.PI/180};}
function paintLegs(ctx,d,back){const base=d.colors.base,p=R.path('leggings',back),dark=parseInt(base.slice(1),16)<0x303030;
 const gr=ctx.createLinearGradient(140,0,460,0);gr.addColorStop(0,shade(base,-24));gr.addColorStop(.3,shade(base,dark?24:12));gr.addColorStop(.7,shade(base,dark?18:8));gr.addColorStop(1,shade(base,-24));
 ctx.save();ctx.shadowColor='#000';ctx.shadowBlur=26;ctx.shadowOffsetY=8;ctx.fillStyle=gr;ctx.fill(p);ctx.restore();
 ctx.save();ctx.clip(p);ctx.fillStyle=shade(base,dark?14:-18);ctx.fillRect(0,80,600,55);ctx.strokeStyle=shade(base,dark?40:-45);ctx.lineWidth=1.2;ctx.setLineDash([3,3]);
 ctx.beginPath();ctx.moveTo(150,134);ctx.lineTo(450,134);ctx.moveTo(150,86);ctx.lineTo(450,86);ctx.stroke();ctx.setLineDash([]);ctx.lineWidth=2;ctx.strokeStyle=shade(base,-40);ctx.beginPath();ctx.moveTo(300,135);ctx.lineTo(300,330);ctx.stroke();ctx.restore();}
function drawTee(ctx,d,o){o=o||{};const view=o.view||d.view||'front',back=view==='back',base=d.colors.base,LG=legs(d),K=zk(d);ctx.clearRect(0,0,600,800);
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
  ctx.restore();ctx.restore();}
 /* stickers per zone, clipped to print area */
 const glow=o.print?0:.6;
 for(const z of K){if(!zoneVisible(z,view))continue;ctx.save();ctx.clip(zonePath(z,view));if(LG)ctx.clip(R.path('leggings',back));else if(ZONES[z].sleeve){const [x,y,w,h]=ZONES[z].rect;const r=new Path2D();const sx=mir(z,view)?600-x-w:x;r.rect(sx,y,w,h);ctx.clip(r);}else ctx.clip(body(back));
  for(const s of sorted(d.zones[z]))drawEl(ctx,toScreen(z,view,s),glow);ctx.restore();}
 if(!o.print&&o.guides!==false){ctx.save();ctx.setLineDash([6,6]);ctx.strokeStyle='#ffffff38';ctx.lineWidth=1.5;if(LG){for(const z of K)if(zoneVisible(z,view))ctx.strokeRect(...ZONES[z].rect);}else{const Z=ZONES[back?'back':'front'];ctx.strokeRect(...Z.rect);}ctx.restore();
  if(o.zone&&zoneVisible(o.zone,view)){ctx.save();ctx.strokeStyle='#ff2bd6';ctx.shadowColor='#ff2bd6';ctx.shadowBlur=16;ctx.lineWidth=3.5;ctx.stroke(zonePath(o.zone,view));ctx.stroke(zonePath(o.zone,view));ctx.restore();}
  if(o.sel&&o.zone&&zoneVisible(o.zone,view)){const s=(d.zones[o.zone]||[]).find(x=>x.id===o.sel);if(s){const b=boxOf(o.zone,view,s),H=handles(b);ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.r);ctx.strokeStyle='#ffe14a';ctx.lineWidth=2;ctx.setLineDash([7,5]);ctx.strokeRect(-b.w/2-6,-b.h/2-6,b.w+12,b.h+12);ctx.setLineDash([]);
   ctx.beginPath();ctx.moveTo(0,-b.h/2-6);ctx.lineTo(0,-b.h/2-30);ctx.stroke();ctx.restore();
   for(const [k,p] of Object.entries(H)){ctx.beginPath();ctx.arc(p[0],p[1],11,0,7);ctx.fillStyle=k==='rot'?'#22e6ff':'#ffe14a';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=10;ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#0b0618';ctx.font='bold 14px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(k==='rot'?'⟳':'⤡',p[0],p[1]+1);}}}
  if(o.label!==false){ctx.fillStyle='#fff';ctx.font='bold 22px system-ui,sans-serif';ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.fillText(`${d.name} · ${LG?'Leggings':'Tee'}${back?' · BACK':' · FRONT'}`,300,40);
   if(d.designer&&d.designer.name){ctx.font='italic 15px system-ui';ctx.fillStyle='#ffe14a';ctx.fillText('designs by '+d.designer.name,300,64);}}}}
function handles(b){const c=Math.cos(b.r),s=Math.sin(b.r),T=(u,v)=>[b.x+u*c-v*s,b.y+u*s+v*c];return {rot:T(0,-b.h/2-30),size:T(b.w/2+6,b.h/2+6)};}
/* hit: returns {kind:'rot'|'size'|'sticker'|'zone',zone,id} */
function teeHit(d,x,y,view,selZone,selId){
 if(selZone&&selId&&zoneVisible(selZone,view)){const s=(d.zones[selZone]||[]).find(q=>q.id===selId);if(s){const H=handles(boxOf(selZone,view,s));for(const k in H)if(Math.hypot(x-H[k][0],y-H[k][1])<20)return {kind:k,zone:selZone,id:selId};}}
 const K=zk(d),order=[...K].sort((a,b)=>(a===selZone?-1:0)-(b===selZone?-1:0));
 for(const z of order){if(!zoneVisible(z,view))continue;const arr=sorted(d.zones[z]).reverse();for(const s of arr){const b=boxOf(z,view,s),dx=x-b.x,dy=y-b.y,c=Math.cos(-b.r),sn=Math.sin(-b.r),u=dx*c-dy*sn,v=dx*sn+dy*c;if(Math.abs(u)<=b.w/2+6&&Math.abs(v)<=b.h/2+6)return {kind:'sticker',zone:z,id:s.id};}}
 const c=document.createElement('canvas').getContext('2d');if(legs(d)){if(!c.isPointInPath(R.path('leggings',view==='back'),x,y))return null;for(const z of K){const Z=ZONES[z],[rx,ry,rw,rh]=Z.rect;if(Z.view===view&&x>=rx&&x<=rx+rw&&y>=ry&&y<=ry+rh)return {kind:'zone',zone:z};}return null;}
 for(const z of ZK){if(zoneVisible(z,view)&&ZONES[z].sleeve&&c.isPointInPath(zonePath(z,view),x,y))return {kind:'zone',zone:z};}
 if(c.isPointInPath(body(view==='back'),x,y))return {kind:'zone',zone:view==='back'?'back':'front'};return null;}
function zoneCenter(z){const [x,y,w,h]=ZONES[z].rect;return ZONES[z].sleeve?[x+w/2+ZONES[z].side*4,y+h*.48]:[x+w/2,y+h*.4];}
function fitScale(el,z,base){const Z=ZONES[z],[,,rw,rh]=Z.rect,[w,h]=dims({el,scale:1});return Math.min(base,(rw*.9)/w,(rh*.9)/h);}
function sticker(el,colors,z,extra){const [x,y]=zoneCenter(z),Z=ZONES[z];let sc=Z.sleeve?(el==='word'?.55:.7):(el==='word'?1.1:1.5);if(Z.g==='leggings')sc=fitScale(el,z,el==='leg'?1.5:Z.band?1:1.2);
 const yy=Z.band?Z.rect[1]+Z.rect[3]/2:Z.g==='leggings'?(el==='leg'?Z.rect[1]+Z.rect[3]*.4:Z.rect[1]+Z.rect[3]*.3):y;
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
 const zs=mode==='wrap'&&legs(d)?['waistband','waistbandBack']:[zone];
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
function ungroup(d,gid){let n=0;for(const z of zk(d))(d.zones[z]||[]).forEach(s=>{if(s.group===gid){delete s.group;n++;}});return n;}
function upgrade(d){d=JSON.parse(JSON.stringify(d));v2fields(d);if(d.editor==='tee'){d.zones=d.zones||{};zk(d).forEach(k=>d.zones[k]=d.zones[k]||[]);}return d;}
const HX=/^#[0-9a-fA-F]{6}$/;
function validate(d){if(d&&d.version===2){const e=v1validate({...d,version:1});if(d.editor==='tee'){if(!d.zones||typeof d.zones!=='object')e.push('zones missing');else for(const z in d.zones){if(!ZONES[z]||!zk(d).includes(z))e.push('unknown zone '+z);else (d.zones[z]||[]).forEach(s=>{if(!EL[s.el])e.push('element not allowed: '+s.el);if(!s.colors||!HX.test(s.colors.body||''))e.push('sticker colors.body must be #rrggbb');['x','y','scale'].forEach(k=>{if(typeof s[k]!=='number')e.push('sticker '+k+' missing')});});}}
 if(d.status&&!['draft','submitted','approved','rejected'].includes(d.status))e.push('bad status '+d.status);return e;}return v1validate(d);}
/* ---- exports ---- */
function footer(c,d){if(!d.designer||!d.designer.name)return c;const o=document.createElement('canvas'),fh=Math.round(c.height*.05);o.width=c.width;o.height=c.height+fh;const x=o.getContext('2d');x.drawImage(c,0,0);x.fillStyle='#0b0618';x.fillRect(0,c.height,o.width,fh);x.fillStyle='#ff2bd6';x.fillRect(0,c.height,o.width,4);
 x.fillStyle='#fff';x.font=`italic ${Math.round(fh*.45)}px system-ui,sans-serif`;x.textAlign='center';x.textBaseline='middle';x.fillText(`Jimmi at the gym · ${d.name} · designs by ${d.designer.name}${d.status==='approved'?' · approved by Guy':''}`,o.width/2,c.height+fh/2+2);return o;}
function tag(c,d){if(!d.creditTag||!d.designer||!d.designer.name)return c;const x=c.getContext('2d');x.save();x.setTransform(1,0,0,1,0,0);x.fillStyle='#ffffffcc';x.font=`${Math.round(c.height*.018)}px system-ui`;x.textAlign='right';x.fillText('designs by '+d.designer.name,c.width-12,c.height-12);x.restore();return c;}
function zonePrint(d,z,dpi){const Z=ZONES[z],[rx,ry,rw,rh]=Z.rect,W2=Math.round(Z.inch[0]*(dpi||150)),k=W2/rw,c=document.createElement('canvas');c.width=W2;c.height=Math.round(rh*k);const x=c.getContext('2d');x.scale(k,k);x.translate(-rx,-ry);
 if(Z.sleeve)x.clip(sleeve(Z.side));if(Z.g==='leggings')x.clip(R.path('leggings',Z.view==='back'));const r=new Path2D();r.rect(rx,ry,rw,rh);x.clip(r);for(const s of sorted(d.zones[z]))drawEl(x,s,0);return c;}
function legacySheet(d,print,px){const vs=[...new Set([d.logo.side||'front',d.wordmark.hidden?(d.logo.side||'front'):(d.wordmark.side||'front'),d.view||'front'])].sort();const cs=vs.map(v=>R.render(d,{print,view:v,px}));if(cs.length===1)return cs[0];const c=document.createElement('canvas');c.width=cs[0].width*cs.length;c.height=px;cs.forEach((s,i)=>c.getContext('2d').drawImage(s,i*s.width,0));return c;}
function teeView(d,view,px){const k=px/800,c=document.createElement('canvas');c.width=Math.round(600*k);c.height=px;const x=c.getContext('2d');x.scale(k,k);drawTee(x,d,{view,label:false,guides:false});return c;}
/* exports(d,{px}) -> [{suffix, canvas}] */
function exportsOf(d,o){o=o||{};const px=o.px||2000;
 if(d.editor!=='tee')return [{suffix:'mockup',canvas:footer(legacySheet(d,false,px),d)},{suffix:'print',canvas:tag(legacySheet(d,true,px),d)}];
 if(legs(d)){const f=teeView(d,'front',px),b=teeView(d,'back',px),m=document.createElement('canvas');m.width=f.width*2;m.height=px;m.getContext('2d').drawImage(f,0,0);m.getContext('2d').drawImage(b,f.width,0);
  return [{suffix:'mockup',canvas:footer(m,d)},...LK.map((z,i)=>({suffix:'print-'+z.replace(/[A-Z]/g,c=>'-'+c.toLowerCase()),canvas:i===0?tag(zonePrint(d,z),d):zonePrint(d,z)}))];}
 const f=teeView(d,'front',px),b=teeView(d,'back',px),m=document.createElement('canvas');m.width=f.width*2;m.height=px;m.getContext('2d').drawImage(f,0,0);m.getContext('2d').drawImage(b,f.width,0);
 return [{suffix:'mockup',canvas:footer(m,d)},{suffix:'print-front',canvas:tag(zonePrint(d,'front'),d)},{suffix:'print-back',canvas:zonePrint(d,'back')},{suffix:'print-left-sleeve',canvas:zonePrint(d,'leftSleeve')},{suffix:'print-right-sleeve',canvas:zonePrint(d,'rightSleeve')}];}
Object.assign(R,{ZONES,ZK,LK,zk,repeat,ungroup,makeLeggings,EL,PRESETS,make,makeTee,upgrade,validate,drawTee,teeHit,sticker,dims,drawEl,exportsOf,fromScreen,toScreen,zonePrint,zoneCenter});
})(window);

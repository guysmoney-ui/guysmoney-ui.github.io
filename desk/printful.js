/* Printful export: artwork-only transparent PNGs (no garment, no mockup, no background) for upload into Printful's Design Maker.
   Printful docs: PNG/JPEG upload; recoloring uploaded art is not documented, so pick colors HERE before exporting. Nothing is sent to Printful. */
(function(){const W=window,R=()=>W.JimmiRender,$=s=>document.querySelector(s);
const PF_URL='https://www.printful.com/';
/* --- PNG pHYs (DPI) chunk, pure + unit tested --- */
const CT=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;})();
function crc(b){let c=0xffffffff;for(const x of b)c=CT[(c^x)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
function withDpi(u8,dpi){const ppm=Math.round(dpi/0.0254),ch=new Uint8Array(21),dv=new DataView(ch.buffer);dv.setUint32(0,9);ch.set([112,72,89,115],4);dv.setUint32(8,ppm);dv.setUint32(12,ppm);ch[16]=1;dv.setUint32(17,crc(ch.subarray(4,17)));
 const o=new Uint8Array(u8.length+21);o.set(u8.subarray(0,33));o.set(ch,33);o.set(u8.subarray(33),54);return o;}
/* --- catalog: every Sticker-page artwork. src = native pixel source (limits sharp print size); null = drawn as vector (sharp at any size) --- */
function catalog(){const r=R(),I=W.JIMMI_IMG||{},A=W.JIMMI_ASSETS||{},C=r.C||{},out=[];
 const nat=k=>I[k]?Math.max(I[k].naturalWidth||0,I[k].naturalHeight||0):0;
 const add=(id,n,s,srcW,rec)=>out.push({id,n,s,srcW,rec});
 add('buff-jimmi-logo','Buff Jimmi logo',{el:'logo',colors:{body:C.Red||'#e10600',hair:C.Red||'#e10600'}},nat('body'),['body','hair']);
 add('logo-no-hair','Logo only (no hair)',{el:'body',colors:{body:C.Red||'#e10600'}},nat('body'),['body']);
 add('spiky-hair','Spiky hair',{el:'hair',colors:{body:C.Red||'#e10600',hair:C.Red||'#e10600'}},nat('hair'),['hair']);
 add('wordmark','Wordmark "Jimmi / at the gym"',{el:'word',colors:{body:C.Red||'#e10600'}},nat('word'),['body']);
 add('logo-plus-wordmark','Logo + wordmark',{el:'combo',colors:{body:C.Red||'#e10600',hair:C.Red||'#e10600'}},nat('body'),['body','hair']);
 add('jimmi-head','Just the Jimmi head',{el:'head',colors:{body:C.White||'#ffffff',hair:C.White||'#ffffff'}},nat('headBody'),['body','hair']);
 add('skinny-jimmi','Skinny Jimmi logo',{el:'skinny',colors:{body:C.White||'#ffffff'}},nat('skinny'),['body']);
 add('jimmi-down-the-leg','JIMMI down the leg',{el:'leg',colors:{body:C.Yellow||'#ffd400'}},nat('leg'),['body']);
 (W.JIMMI_GYJ||[]).forEach(g=>add(g.key.replace('gyj_','got-your-jimmies-'),g.n+' — original die-cut colors',{el:g.key,colors:{body:'#ffffff'}},nat(g.key),[]));
 (r.TEXTS||[]).forEach(t=>['script','round'].forEach(f=>add('text-'+t.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'-'+f,'"'+t+'" ('+f+', curved)',{el:'text',text:t,font:f,curve:120,spacing:f==='round'?4:0,colors:{body:'#ffffff'}},null,['body'])));
 [1,2,3].forEach(n=>add('stripe-'+n,['','Single','Double','Triple'][n]+' stripe',{el:'stripe',lines:n,thick:.3,len:110,colors:{body:'#ffffff'}},null,['body']));
 return out;}
/* render one item to a tight-cropped transparent canvas, longest side = px */
function render(it,colors,px){const r=R(),s=JSON.parse(JSON.stringify(it.s));s.colors={...s.colors,...colors};if(!s.colors.hair)s.colors.hair=s.colors.body;s.x=0;s.y=0;s.rotation=0;s.scale=1;
 let [w,h]=r.dims(s);s.scale=px/Math.max(w,h);[w,h]=r.dims(s);const pad=Math.ceil(px*.06),cv=document.createElement('canvas');cv.width=Math.ceil(w)+2*pad;cv.height=Math.ceil(h)+2*pad;s.x=cv.width/2;s.y=cv.height/2;
 const c=cv.getContext('2d');c.clearRect(0,0,cv.width,cv.height);r.drawEl(c,s,0);return trim(cv);}
function trim(cv){const c=cv.getContext('2d'),{width:w,height:h}=cv,d=c.getImageData(0,0,w,h).data;let x0=w,y0=h,x1=-1,y1=-1;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]>0){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
 if(x1<0)return null;const o=document.createElement('canvas');o.width=x1-x0+1;o.height=y1-y0+1;o.getContext('2d').drawImage(cv,-x0,-y0);return o;}
const blobOf=cv=>new Promise(res=>cv.toBlob(res,'image/png'));
async function pngFile(it,colors,inch,dpi){const cv=render(it,colors,Math.round(inch*dpi));if(!cv)throw new Error('empty artwork');const b=new Uint8Array(await (await blobOf(cv)).arrayBuffer());return {blob:new Blob([withDpi(b,dpi)],{type:'image/png'}),w:cv.width,h:cv.height};}
function save(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000);}
function quality(it,inch,dpi){const px=Math.round(inch*dpi);if(!it.srcW)return {ok:1,t:'Drawn as vector — sharp at any size.'};const max=it.srcW/dpi,up=px/it.srcW;
 return up<=1.05?{ok:1,t:`Sharp: source is ${it.srcW}px wide (max ≈${max.toFixed(1)}" at ${dpi} dpi).`}:{ok:0,t:`⚠️ Source is only ${it.srcW}px wide: at ${inch}" it is upscaled ${up.toFixed(1)}× and will print soft. Sharp max ≈${max.toFixed(1)}" at ${dpi} dpi.`};}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- This design -> per-placement Printful print files ----------
   Placement keys below were read from Printful's public Catalog API (GET https://api.printful.com/products, Nov 2026).
   Exact print-area pixel sizes need an authenticated Printful call, so they are NOT hardcoded: the user types the size Printful shows
   (Design Maker / product "File guidelines"); until then we export at the Design Shop zone size and say so. */
const PRODUCTS={
 tee:[{id:71,n:'Unisex Staple T-Shirt | Bella + Canvas 3001',tech:'dtg',map:{front:'front',back:'back',leftSleeve:'sleeve_left',rightSleeve:'sleeve_right'}}],
 hoodie:[{id:146,n:'Unisex Heavy Blend Hoodie | Gildan 18500',tech:'dtg',map:{front:'front',back:'back',leftSleeve:'sleeve_left',rightSleeve:'sleeve_right',leftArm:'sleeve_left',rightArm:'sleeve_right'}}],
 leggings:[]};
PRODUCTS.zip=PRODUCTS.longsleeve=[];

/* ---------- Authentic Printful profile: All-Over Print Leggings (standard) ----------
   Source: Printful's official template for this product, https://printful.s3-accelerate.amazonaws.com/upload/guideline/leggings.zip
   (All-over-leggings-template.png 7200x6225 @150dpi, sha256 of zip 4c599bd2…5efe85) and its guideline PDF: max graphic 48"x41.5", >=150 dpi, sRGB, PNG/JPEG,
   "Exact placement is not possible … cannot guarantee … alignment on seams". Dashboard product page showed product #301 with tabs PRINT FILE + INSIDE LABEL (2.5"x1").
   Geometry below was measured from that template's red safe-area, grey outer-side guide and blue folding lines (guides never printed). */
const LEG={W:7200,H:6225,dpi:150,cx:{right:1927,left:5264},yTop:1250,yBot:5921,
 safe:{"right":[[1292,871],[1185,1296],[1092,1596],[995,1746],[746,1871],[739,1946],[839,2146],[1005,2621],[1162,3221],[1239,3596],[1314,4021],[1395,4671],[1489,5921],[2406,5921],[2421,5596],[2466,5096],[2514,4621],[2601,3971],[2733,3171],[2913,2321],[3025,1871],[3024,1796],[2987,1771],[2921,1671],[2880,1546],[2850,1371],[2847,1171],[2789,1146],[1486,871]],"left":[[5713,871],[4410,1146],[4352,1171],[4349,1371],[4319,1546],[4278,1671],[4212,1771],[4175,1796],[4174,1871],[4286,2321],[4466,3171],[4598,3971],[4733,5096],[4778,5596],[4793,5921],[5710,5921],[5766,5146],[5837,4396],[5885,4021],[5960,3596],[6037,3221],[6194,2621],[6360,2146],[6460,1946],[6453,1871],[6204,1746],[6107,1596],[6014,1296],[5907,871]]},
 fold:{right:[[824,336],[3360,904]],left:[[3840,904],[6400,360]]},bandH:280,
 url:'https://www.printful.com/dashboard/custom/womens/leggings/all-over-print-leggings',tpl:'https://printful.s3-accelerate.amazonaws.com/upload/guideline/leggings.zip'};
function xsAt(poly,Y){const xs=[];for(let i=0;i<poly.length;i++){const [x1,y1]=poly[i],[x2,y2]=poly[(i+1)%poly.length];if((y1<=Y&&y2>Y)||(y2<=Y&&y1>Y))xs.push(x1+(Y-y1)*(x2-x1)/(y2-y1));}return xs.length?[Math.min(...xs),Math.max(...xs)]:null;}
const foldY=(L,x)=>L[0][1]+(x-L[0][0])*(L[1][1]-L[0][1])/(L[1][0]-L[0][0]),foldA=L=>Math.atan2(L[1][1]-L[0][1],L[1][0]-L[0][0]);
/* zone art in garment space (same clip + draw path as the editor preview), rendered at scale S over the zone rect */
function garmentZone(d,z,S){const r=R(),Z=r.ZONES[z],[rx,ry,rw,rh]=Z.rect,c=document.createElement('canvas');c.width=Math.ceil(rw*S);c.height=Math.ceil(rh*S);const x=c.getContext('2d');x.scale(S,S);x.translate(-rx,-ry);
 if(!Z.band)x.clip(r.path(d.garment==='joggers'?'joggers':'leggings',Z.view==='back'));const cl=new Path2D();cl.rect(rx,ry,rw,rh);x.clip(cl);for(const s of [...(d.zones[z]||[])].sort((p,q)=>(p.z||0)-(q.z||0)))r.drawEl(x,s,0,z);return c;}
/* silhouette row edges (garment units) inside [a,b] */
function silEdges(back,a,b){const r=R(),c=document.createElement('canvas');c.width=600;c.height=1100;const x=c.getContext('2d');x.fillStyle='#000';x.fill(r.path('leggings',back));const D=x.getImageData(0,0,600,1100).data,E=[];
 for(let y=0;y<1100;y++){let lo=-1,hi=-1;for(let X=a;X<b;X++)if(D[(y*600+X)*4+3]>127){if(lo<0)lo=X;hi=X+1;}E.push(lo<0?null:[lo,hi]);}return E;}
/* row-width warp: one half-leg of the editor view onto the matching half of Printful's panel */
function warpHalf(ctx,src,Z,S,edges,a,b,panel,dir){const [rx,ry,,rh]=Z.rect,y0=ry,y1=ry+rh,poly=LEG.safe[panel],cx=LEG.cx[panel],step=4;
 for(let Y=LEG.yTop;Y<LEG.yBot;Y+=step){const y=y0+(Y-LEG.yTop)/(LEG.yBot-LEG.yTop)*(y1-y0),e=edges[Math.floor(y)],sx=xsAt(poly,Y+step/2);if(!e||!sx)continue;
  const tx0=dir>0?cx:sx[0],tx1=dir>0?sx[1]:cx;if(tx1-tx0<2)continue;const sy=(y-ry)*S,sh=Math.max(1,(rh*S)*step/(LEG.yBot-LEG.yTop));
  ctx.drawImage(src,(e[0]-Z.rect[0])*S,sy,(e[1]-e[0])*S,sh,tx0,Y,tx1-tx0,step+0.5);}}
function bandPiece(ctx,src,S,Z,a,b,panel,dir){const L=LEG.fold[panel],cx=LEG.cx[panel],[rx,,,rh]=Z.rect,w=(b-a)*7.5,h=rh*7.5,k=Math.min(1,LEG.bandH/h);
 ctx.save();ctx.translate(cx,foldY(L,cx));ctx.rotate(foldA(L));ctx.drawImage(src,(a-rx)*S,0,(b-a)*S,rh*S,dir>0?0:-w*k,-12-h*k,w*k,h*k);ctx.restore();}
function legPrintFile(d,o){o=o||{};const r=R(),c=document.createElement('canvas');c.width=LEG.W;c.height=LEG.H;const x=c.getContext('2d'),notes=[],S=8,base=d.colors&&d.colors.base;
 if(o.base!==false&&base){x.fillStyle=base;x.fillRect(0,0,LEG.W,LEG.H);notes.push('Base color '+base+' fills the whole print file (full bleed, per template).');}
 if(d.colors&&d.colors.stripe){const w=(+d.colors.stripeWidth||7)*7,n=Math.max(1,Math.min(3,+d.colors.stripeCount||1)),gap=w*2,T=n*w+(n-1)*gap;x.fillStyle=d.colors.stripe;
  for(const p of ['right','left']){const cx=LEG.cx[p],top=foldY(LEG.fold[p],cx)-LEG.bandH-20;for(let k=0;k<n;k++)x.fillRect(cx-T/2+k*(w+gap),top,w,LEG.H-top);}
  notes.push(`Side stripe ×${n} (${d.colors.stripe}) runs down each leg's outer-side line (template grey guide), centered on it.`);}
 const has=z=>(d.zones[z]||[]).length,Zs=r.ZONES;
 if(has('rightLeg')||has('leftLeg')){const E=silEdges(false,150,300),E2=silEdges(false,300,450);
  if(has('rightLeg'))warpHalf(x,garmentZone(d,'rightLeg',S),Zs.rightLeg,S,E,150,300,'right',1);
  if(has('leftLeg'))warpHalf(x,garmentZone(d,'leftLeg',S),Zs.leftLeg,S,E2,300,450,'left',-1);notes.push('Front-view leg art warped row-by-row onto the FRONT half of each leg panel (inside the safe area).');}
 if(has('seat')){const g=garmentZone(d,'seat',S),Z=Zs.seat;const E=silEdges(true,150,300),E2=silEdges(true,300,450);
  const half=(e,a,b,panel,dir)=>warpHalf(x,g,Z,S,e,a,b,panel,dir);
  /* back view: viewer-left half = wearer's left leg */ half(E,150,300,'left',1);half(E2,300,450,'right',-1);notes.push('Back/seat art warped onto the BACK half of each leg panel.');}
 if(has('waistband')){const g=garmentZone(d,'waistband',S),Z=Zs.waistband;bandPiece(x,g,S,Z,160,300,'right',1);bandPiece(x,g,S,Z,300,440,'left',-1);}
 if(has('waistbandBack')){const g=garmentZone(d,'waistbandBack',S),Z=Zs.waistbandBack;bandPiece(x,g,S,Z,160,300,'left',1);bandPiece(x,g,S,Z,300,440,'right',-1);}
 if(has('waistband')||has('waistbandBack'))notes.push('Waistband art sits just above each leg\'s folding line, split at the side line (approximate: check the waistband in Printful\'s 3D preview).');
 const unk=Object.keys(d.zones||{}).filter(z=>has(z)&&!['rightLeg','leftLeg','seat','waistband','waistbandBack'].includes(z));if(unk.length)notes.push('NOT PLACED (place manually): '+unk.join(', '));
 return {canvas:c,notes,incomplete:unk.length>0};}
function legPreview(pf){const k=900/LEG.W,c=document.createElement('canvas');c.width=900;c.height=Math.round(LEG.H*k);const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(pf,0,0,c.width,c.height);x.scale(k,k);x.lineWidth=12;
 x.setLineDash([60,40]);x.strokeStyle='#ff2a2a';for(const p of ['right','left']){x.beginPath();LEG.safe[p].forEach(([a,b],i)=>i?x.lineTo(a,b):x.moveTo(a,b));x.closePath();x.stroke();}
 x.strokeStyle='#888';for(const p of ['right','left']){x.beginPath();x.moveTo(LEG.cx[p],0);x.lineTo(LEG.cx[p],LEG.H);x.stroke();}x.strokeStyle='#2a7bff';for(const p of ['right','left']){const L=LEG.fold[p];x.beginPath();x.moveTo(...L[0]);x.lineTo(...L[1]);x.stroke();}
 x.setLineDash([]);x.font='bold 150px sans-serif';x.fillStyle='#000';x.fillText('PREVIEW – guides – NOT the print file',600,6100);x.fillText('RIGHT LEG',1300,250);x.fillText('LEFT LEG',4700,250);return c;}
const AOP_URL='https://www.printful.com/custom/womens/leggings/all-over-print-leggings',AOP_GUIDE='https://www.printful.com/creating-aop-file';
const kebab=z=>z.replace(/[A-Z]/g,c=>'-'+c.toLowerCase());
const slug=t=>String(t||'design').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40)||'design';
/* source-based sharpness: pixels of the ORIGINAL art per printed inch for each sticker in the zone */
function srcPx(s){const I=W.JIMMI_IMG||{},n=k=>I[k]?Math.max(I[k].naturalWidth,I[k].naturalHeight):0;const m={logo:'body',body:'body',hair:'hair',combo:'body',word:'word',head:'headBody',skinny:'skinny',leg:'leg'};
 if(s.el==='text'||s.el==='stripe')return 0;return n(m[s.el]||s.el);}
function zoneWarnings(d,z){const r=R(),Z=r.ZONES[z],ppu=Z.inch[0]/Z.rect[2],out=[];for(const s of d.zones[z]||[]){const sp=srcPx(s);if(!sp)continue;const [w,h]=r.dims(s,z),inch=Math.max(w,h)*ppu,ppi=sp/inch;if(ppi<150)out.push(`${r.EL[s.el]?r.EL[s.el].n:s.el}: source ${sp}px over ${inch.toFixed(1)}" ≈ ${Math.round(ppi)} px/in (soft below 150)`);}return out;}
/* isolated zone artwork: no garment, no mockup; optional flat base fill (AOP only) */
function zoneArt(d,z,o){const r=R(),Z=r.ZONES[z],[rx,ry,rw,rh]=Z.rect,c=document.createElement('canvas');c.width=o.w;c.height=o.h;const x=c.getContext('2d');
 if(o.base){x.fillStyle=o.base;x.fillRect(0,0,o.w,o.h);}const k=Math.min(o.w/rw,o.h/rh);x.translate((o.w-rw*k)/2,(o.h-rh*k)/2);x.scale(k,k);x.translate(-rx,-ry);
 const cl=new Path2D();cl.rect(rx,ry,rw,rh);x.clip(cl);for(const s of [...(d.zones[z]||[])].sort((p,q)=>(p.z||0)-(q.z||0)))r.drawEl(x,s,0,z);return c;}
const hasArt=c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;for(let i=3;i<d.length;i+=4)if(d[i])return true;return false;};
async function savePng(c,name,dpi){const b=new Uint8Array(await (await blobOf(c)).arrayBuffer());save(new Blob([withDpi(b,dpi)],{type:'image/png'}),name);}
function designSection(m){const host=m.querySelector('#pfDesign'),J=W.__jimmi,d=J&&J.get&&J.get();const r=R();
 if(!d||d.editor!=='tee'){host.innerHTML='<p class="hint">Open a design in the Tee, Hoodie or Leggings editor to export its print files.</p>';return;}
 const g=d.garment||'tee',nm=slug(d.name);
 if(g==='leggings')return legSection(host,d,nm);
 const prods=PRODUCTS[g]||[],sel=prods[0],zones=r.zk(d).filter(z=>(d.zones[z]||[]).length);
 host.innerHTML=`<h5>This design → Printful</h5>
 <p class="hint">One transparent PNG per print area of <b>${esc(d.name||'this design')}</b>: artwork only, never the shirt picture. ${sel?`Product: <b>${esc(sel.n)}</b>. The shirt color is picked in Printful; a PNG can't recolor the blank.`:`<span class="warn">No verified Printful product for "${esc(g)}": drafts only, place manually.</span>`}</p>
 <p class="hint"><b>DRAFT</b> = Design Shop zone size (not Printful's). For a real <b>print file</b>, copy the print-area pixel size from Printful's Design Maker / File guidelines for that area, tick the box, then download.</p>
 ${zones.length?zones.map(z=>{const Z=r.ZONES[z],pl=sel&&sel.map[z]||null,wn=zoneWarnings(d,z);
  return `<div class="pfRow pfZ" data-z="${z}"><div class="pfInfo"><b>${esc(Z.n)}</b> → ${pl?`Printful area <code>${pl}</code>`:'<span class="warn">no matching Printful area (place manually)</span>'}
  <div class="pfCtl"><label>Printful W px <input type="number" class="pfW" min="100" max="20000" placeholder="from Printful"></label><label>H px <input type="number" class="pfH" min="100" max="20000" placeholder="from Printful"></label><label><input type="checkbox" class="pfOk"> I copied these from Printful</label></div>
  ${wn.length?`<div class="hint warn">⚠️ ${wn.map(esc).join('<br>⚠️ ')}</div>`:''}</div><div><button class="pfDraft">DRAFT PNG</button><button class="hot pfPrint" disabled>⬇️ Print file</button></div></div>`;}).join(''):'<p class="hint">This design has no artwork yet.</p>'}`;
 host.querySelectorAll('.pfZ').forEach(row=>{const z=row.dataset.z,Z=r.ZONES[z],pl=sel&&sel.map[z]||null,W_=row.querySelector('.pfW'),H_=row.querySelector('.pfH'),ok=row.querySelector('.pfOk'),pb=row.querySelector('.pfPrint');
  const chk=()=>pb.disabled=!(ok.checked&&+W_.value>=100&&+H_.value>=100);[W_,H_,ok].forEach(e=>e.oninput=e.onchange=chk);
  const go=async(w,h,tag,dpi)=>{const c=zoneArt(d,z,{w,h});if(!hasArt(c)){alert(Z.n+' came out empty');return;}const name=`jimmi-${nm}-${tag}${sel?sel.id+'-':''}${pl||kebab(z)}-${w}x${h}.png`;await savePng(c,name,dpi);W.__pfLastZone={name,w,h};};
  row.querySelector('.pfDraft').onclick=()=>go(Math.round(Z.inch[0]*150),Math.round(Z.inch[1]*150),'DRAFT-',150);
  pb.onclick=()=>go(Math.round(+W_.value),Math.round(+H_.value),'',150);});}
function legSection(host,d,nm){const base=d.colors&&d.colors.base;
 host.innerHTML=`<h5>This leggings design → Printful All-Over Print Leggings</h5>
 <p class="hint">Uses Printful's official template for this product: one combined <b>48×41.5 in</b> print file, <b>7200×6225 px @150 dpi</b>, sRGB PNG, holding both legs as cut pattern pieces. Your base color fills the whole file, the side stripe runs down each leg's outer side, and your leg / seat / waistband art is fitted into each panel's safe area.</p>
 <p class="hint warn">Printful's own guide says exact placement and seam alignment can't be guaranteed. The front view is fitted onto the FRONT half of each panel, and the waistband position is approximate. Check the 3D preview in Printful before saving or ordering.</p>
 <div class="pfRow"><canvas id="pfLegPrev" class="pfPrev" style="width:220px;height:190px" width="900" height="778"></canvas><div class="pfInfo"><div id="pfLegNotes" class="hint">Building preview…</div></div></div>
 <button class="hot" id="pfLegDl">⬇️ Leggings print file (7200×6225 PNG)</button> <button id="pfLegPv">Preview with guides (not for print)</button> <button id="pfLegLbl">Inside label 2.5×1 in (375×150)</button>
 <ol class="hint pfSteps"><li>Open <a href="${LEG.url}" target="_blank" rel="noopener">All-Over Print Leggings in Printful</a> → <b>PRINT FILE</b> tab → Upload the print file. It should fill the whole area: don't scale it down.</li><li><b>INSIDE LABEL</b> tab → upload the 375×150 label (optional).</li><li>Turn on 3D view to check the legs and waistband. Nothing is sent to Printful automatically.</li></ol>
 <p class="hint">Official template (for checking): <a href="${LEG.tpl}" target="_blank" rel="noopener">leggings.zip</a>. Large file: building it uses about 180 MB of memory, so phones may fail; use a computer.</p>`;
 let pf=null;const build=()=>pf||(pf=legPrintFile(d));
 setTimeout(()=>{try{const o=build(),pv=legPreview(o.canvas);host.querySelector('#pfLegPrev').getContext('2d').drawImage(pv,0,0,900,778);host.querySelector('#pfLegNotes').innerHTML=o.notes.map(esc).join('<br>')+(o.incomplete?'<br><b class="warn">Some art is not placed: see above.</b>':'');}catch(e){host.querySelector('#pfLegNotes').textContent='Could not build: '+e.message;}},30);
 host.querySelector('#pfLegDl').onclick=async e=>{e.target.disabled=true;try{const o=build();await savePng(o.canvas,`jimmi-${nm}-printful-aop-leggings-${o.incomplete?'INCOMPLETE-':''}7200x6225-150dpi.png`,150);W.__pfLastLeg={notes:o.notes};}catch(err){alert('Export failed: '+err.message);}e.target.disabled=false;};
 host.querySelector('#pfLegPv').onclick=()=>savePng(legPreview(build().canvas),`jimmi-${nm}-leggings-PREVIEW-not-for-print.png`,72);
 host.querySelector('#pfLegLbl').onclick=async()=>{const img=new Image();img.src='printful/Jimmi-inside-label-Etsy-icon-dark.png';await img.decode();const c=document.createElement('canvas');c.width=375;c.height=150;const k=Math.min(375/img.width,150/img.height);c.getContext('2d').drawImage(img,(375-img.width*k)/2,(150-img.height*k)/2,img.width*k,img.height*k);await savePng(c,'jimmi-leggings-inside-label-375x150-150dpi.png',150);};}
function open(){let m=$('#pfModal');if(!m){m=document.createElement('div');m.id='pfModal';m.className='modal lib';m.innerHTML=`<div class="box"><div class="store-sign"><span class="neon2">Use in Printful</span></div>
<ol class="hint pfSteps"><li>Pick an artwork, set its colors and print width here (Printful can't recolor an uploaded PNG).</li><li>Tap <b>⬇️ PNG</b>. You get <b>only the artwork</b> on a transparent background — no shirt, no mockup.</li><li>Open Printful, choose your real shirt blank, then <b>Upload</b> (or drag the downloaded file from your Downloads folder) onto the print area and place it.</li></ol>
<p class="hint">Want Printful's own model photos automatically? Printful's Mockup Generator API needs a private Printful token kept on a server; this static site has no server and never stores keys, so the handoff is: download → upload in Printful → use Printful's preview.</p><p><a class="chip" href="${PF_URL}" target="_blank" rel="noopener">↗ Open Printful (new tab)</a> <span class="hint">Nothing is sent to Printful automatically.</span></p>
<label class="hint">Print DPI <select id="pfDpi"><option>300</option><option>150</option></select></label>
<div id="pfDesign"></div><div id="pfReady"></div><div id="pfList" class="pfList"></div><button id="pfClose">Close</button></div>`;document.body.appendChild(m);
 m.querySelector('#pfClose').onclick=()=>m.hidden=true;m.addEventListener('click',e=>{if(e.target===m)m.hidden=true;});build(m);}
 designSection(m);m.hidden=false;}
function build(m){const L=m.querySelector('#pfList'),items=catalog(),dpi=()=>+m.querySelector('#pfDpi').value;
 L.innerHTML=items.map((it,i)=>`<div class="pfRow" data-i="${i}"><canvas class="pfPrev" width="140" height="100" draggable="true" title="Drag (Chrome) or use ⬇️ PNG"></canvas><div class="pfInfo"><b>${esc(it.n)}</b><div class="pfCtl">${it.rec.map(k=>`<label>${k==='hair'?'Hair':'Color'} <input type="color" data-k="${k}" value="${it.s.colors[k]||it.s.colors.body}"></label>`).join('')||'<span class="hint">Fixed original colors</span>'}<label>Width/height (in) <input type="number" class="pfIn" min="0.5" max="16" step="0.25" value="${it.srcW?Math.max(0.5,Math.min(12,+(it.srcW/300).toFixed(2))):10}"></label></div><div class="pfQ hint"></div></div><button class="hot pfDl">⬇️ PNG</button></div>`).join('');
 const rowSt=row=>{const it=items[+row.dataset.i],col={};row.querySelectorAll('input[type=color]').forEach(x=>col[x.dataset.k]=x.value);return {it,col,inch:+row.querySelector('.pfIn').value||1};};
 const fname=(it,inch)=>`jimmi-${it.id}-${inch}in-${dpi()}dpi.png`;
 const paint=row=>{const {it,col,inch}=rowSt(row),q=quality(it,inch,dpi()),pc=row.querySelector('.pfPrev'),cv=render(it,col,600),c=pc.getContext('2d');c.clearRect(0,0,140,100);if(cv){const k=Math.min(130/cv.width,90/cv.height);c.drawImage(cv,70-cv.width*k/2,50-cv.height*k/2,cv.width*k,cv.height*k);}
  const qe=row.querySelector('.pfQ');qe.textContent=q.t+` → ${Math.round(inch*dpi())}px long side.`;qe.classList.toggle('warn',!q.ok);};
 const safe=r=>{try{paint(r);}catch(e){r.querySelector('.pfQ').textContent='Preview unavailable: '+e.message;}};L.querySelectorAll('.pfRow').forEach(safe);
 L.addEventListener('input',e=>{const r=e.target.closest('.pfRow');if(r)safe(r);});m.querySelector('#pfDpi').onchange=()=>L.querySelectorAll('.pfRow').forEach(paint);
 L.addEventListener('click',async e=>{const b=e.target.closest('.pfDl');if(!b)return;const row=b.closest('.pfRow'),{it,col,inch}=rowSt(row);b.disabled=true;try{const f=await pngFile(it,col,inch,dpi());save(f.blob,fname(it,inch));W.__pfLast={name:fname(it,inch),w:f.w,h:f.h,size:f.blob.size};}catch(err){alert('Export failed: '+err.message);}b.disabled=false;});
 /* drag-out: Chrome-only DownloadURL; everything else falls back to ⬇️ PNG */
 L.addEventListener('dragstart',e=>{const row=e.target.closest('.pfRow');if(!row)return;const {it,col,inch}=rowSt(row),cv=render(it,col,Math.min(Math.round(inch*dpi()),3000));if(!cv)return;try{e.dataTransfer.setData('DownloadURL','image/png:'+fname(it,inch)+':'+cv.toDataURL('image/png'));}catch(_){}});
 fetch('printful/manifest.json',{cache:'no-cache'}).then(r=>r.ok?r.json():null).then(j=>{if(!j||!Array.isArray(j.files)||!j.files.length)return;m.querySelector('#pfReady').innerHTML=`<h5>Ready-made files</h5><div class="pfList">${j.files.map(f=>`<div class="pfRow"><img class="pfPrev" src="printful/${encodeURI(f.png)}" alt=""><div class="pfInfo"><b>${esc(f.name)}</b><div class="pfQ hint${f.limited?' warn':''}">${esc(f.note||'')}</div></div><a class="chip hot" href="printful/${encodeURI(f.png)}" download>⬇️ PNG</a>${f.svg?`<a class="chip" href="printful/${encodeURI(f.svg)}" download title="Editable source for recoloring; upload the PNG to Printful">✏️ SVG source</a>`:''}</div>`).join('')}</div>`;}).catch(()=>{});}
const st=document.createElement('style');st.textContent=`#pfModal .box{max-height:calc(100dvh - 24px);overflow:auto;display:flex;flex-direction:column}#pfModal #pfClose{position:sticky;bottom:0;align-self:center;z-index:2;flex:none}#pfModal .pfList{max-height:none;overflow:visible}.warn{color:#ffb347}.pfList{display:flex;flex-direction:column;gap:8px;max-height:60vh;overflow:auto}.pfRow{display:flex;gap:10px;align-items:center;border:1px solid var(--neon,#f0f);border-radius:10px;padding:8px}.pfPrev{width:140px;height:100px;object-fit:contain;flex:none;border-radius:8px;background:repeating-conic-gradient(#2a2340 0 25%,#1a1530 0 50%) 0 0/16px 16px}.pfInfo{flex:1;min-width:0}.pfCtl{display:flex;flex-wrap:wrap;gap:8px;margin:4px 0}.pfCtl input[type=number]{width:70px}.pfQ.warn{color:#ffb347}.pfDl,.pfRow .chip{min-height:44px}`;document.head.appendChild(st);
W.JIMMI_PRINTFUL={open,LEG,xsAt,legPrintFile,legPreview,garmentZone,PRODUCTS,zoneArt,zoneWarnings,srcPx,slug,catalog,render,pngFile,withDpi,crc,quality,PF_URL};
document.addEventListener('DOMContentLoaded',()=>{const sb=$('.stagebar');if(sb&&!$('#pfBtn')){const b=document.createElement('button');b.id='pfBtn';b.textContent='🖨️ Use in Printful';b.title='Download artwork-only transparent PNGs for Printful';b.onclick=open;sb.appendChild(b);}
 const lb=$('#lib .box');if(lb&&!$('#pfBtn2')){const b=document.createElement('button');b.id='pfBtn2';b.className='hot';b.textContent='🖨️ Download these for Printful (transparent PNGs)';b.onclick=()=>{$('#lib').hidden=true;open();};lb.insertBefore(b,$('#libGrid'));}});
})();

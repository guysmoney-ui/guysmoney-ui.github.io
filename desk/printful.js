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
 leggings:[
  {id:559,n:'All-Over Print Leggings with Pockets',tech:'aop',map:{leftLeg:'leg_left',rightLeg:'leg_right',waistband:'belt_front',waistbandBack:'belt_back'}},
  {id:242,n:'All-Over Print Yoga Leggings',tech:'aop',map:{waistband:'belt_front',waistbandBack:'belt_back'},single:'default'},
  {id:189,n:'All-Over Print Leggings',tech:'aop',map:{},single:'default'}]};
PRODUCTS.zip=PRODUCTS.longsleeve=[];
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
function designSection(m){const host=m.querySelector('#pfDesign'),J=W.__jimmi,d=J&&J.get&&J.get();const r=R();
 if(!d||d.editor!=='tee'){host.innerHTML='<p class="hint">Open a design in a Tee, Hoodie or Leggings editor to export its print files.</p>';return;}
 const g=d.garment||'tee',prods=PRODUCTS[g]||[],zones=r.zk(d).filter(z=>(d.zones[z]||[]).length);
 const sel=host.dataset.p&&prods.find(p=>p.id==host.dataset.p)||prods[0];
 const aop=sel&&sel.tech==='aop',base=d.colors&&d.colors.base;
 host.innerHTML=`<h5>This design → Printful print files</h5>
 <p class="hint">One transparent PNG per print area of <b>${esc(d.name||'this design')}</b>: only your artwork, never the shirt picture or mockup.</p>
 ${prods.length?`<label class="hint">Printful product <select id="pfProd">${prods.map(p=>`<option value="${p.id}"${p===sel?' selected':''}>${esc(p.n)}</option>`).join('')}</select></label>`:`<p class="hint warn">No verified Printful product mapping for ${esc(g)} yet: files are named by Design Shop zone.</p>`}
 ${aop?`<p class="hint warn">All-over-print leggings are printed on white fabric and cut &amp; sewn from Printful's own panel template. These leg/waistband PNGs come from the Design Shop's flat preview, so they are <b>not</b> an exact cut template: place each one on the matching panel in Printful's Design Maker and check seams in Printful's preview. Guide: <a href="${AOP_GUIDE}" target="_blank" rel="noopener">Printful AOP file guide</a> · <a href="${AOP_URL}" target="_blank" rel="noopener">product page → File guidelines / template</a>.</p>
 ${d.colors&&d.colors.stripe?'<p class="hint warn">The leggings side-stripe color option is drawn on the flat silhouette and is not included in these files; add stripes as Stripe stickers, or recreate the side stripe in Printful.</p>':''}<label class="hint"><input type="checkbox" id="pfBase" ${host.dataset.nb?'':'checked'}> Fill background with the leggings base color <span class="sw" style="display:inline-block;width:14px;height:14px;background:${esc(base||'#000')};vertical-align:middle"></span> (AOP prints the whole panel; leave on so unprinted fabric isn't white)</label>${sel.single?`<p class="hint warn">This model takes one combined file ("${sel.single}") for the legs, so leg art can't be dropped in per leg: use Printful's template, or pick "with Pockets" which has separate leg_left / leg_right areas.</p>`:''}`
 :(prods.length?`<p class="hint">Printed on a real ${esc(g)} blank: the garment color is chosen in Printful, it can't be changed by a PNG. Only the artwork prints.</p>`:'')}
 ${zones.length?zones.map(z=>{const Z=r.ZONES[z],pl=sel&&(sel.map[z]||null),wn=zoneWarnings(d,z);const dw=Math.round(Z.inch[0]*300),dh=Math.round(Z.inch[1]*300),sv=(host.dataset['s_'+z]||'').split('x');
  return `<div class="pfRow pfZ" data-z="${z}"><div class="pfInfo"><b>${esc(Z.n)}</b> → ${pl?`Printful <code>${pl}</code>`:'<span class="warn">no matching Printful area (place manually)</span>'}
  <div class="pfCtl"><label>Width px <input type="number" class="pfW" min="100" max="20000" value="${sv[0]||dw}"></label><label>Height px <input type="number" class="pfH" min="100" max="20000" value="${sv[1]||dh}"></label></div>
  <div class="hint">Default = Design Shop zone ${Z.inch[0]}×${Z.inch[1]} in @300 dpi (not Printful's verified size). For an exact fit type the print-area pixel size Printful shows for <code>${pl||'this area'}</code>; art is centered to fit.</div>
  ${wn.length?`<div class="hint warn">⚠️ ${wn.map(esc).join('<br>⚠️ ')}</div>`:''}</div><button class="hot pfZdl">⬇️ PNG</button></div>`;}).join('')+`<button class="hot" id="pfAll">⬇️ Download all ${zones.length} print files + placement notes</button>`:'<p class="hint">This design has no artwork yet.</p>'}`;
 const ps=host.querySelector('#pfProd');if(ps)ps.onchange=()=>{host.dataset.p=ps.value;designSection(m);};
 const bx=host.querySelector('#pfBase');if(bx)bx.onchange=()=>{if(bx.checked)delete host.dataset.nb;else host.dataset.nb=1;};
 host.querySelectorAll('.pfZ input').forEach(i=>i.onchange=()=>{const row=i.closest('.pfZ');host.dataset['s_'+row.dataset.z]=row.querySelector('.pfW').value+'x'+row.querySelector('.pfH').value;});
 const job=row=>{const z=row.dataset.z,w=Math.max(100,Math.min(20000,+row.querySelector('.pfW').value||0)),h=Math.max(100,Math.min(20000,+row.querySelector('.pfH').value||0)),pl=sel&&sel.map[z]||null,useBase=aop&&!host.dataset.nb&&base;
  return {z,w,h,pl,base:useBase?base:null,name:`jimmi-${slug(d.name)}-${sel?sel.id+'-':''}${pl||kebab(z)}-${w}x${h}.png`};};
 const one=async j=>{const c=zoneArt(d,j.z,j);if(!hasArt(c)&&!j.base)throw new Error(r.ZONES[j.z].n+' export came out empty');const b=new Uint8Array(await (await blobOf(c)).arrayBuffer());save(new Blob([withDpi(b,300)],{type:'image/png'}),j.name);return j;};
 host.querySelectorAll('.pfZdl').forEach(b=>b.onclick=async()=>{b.disabled=true;try{W.__pfLastZone=await one(job(b.closest('.pfZ')));}catch(e){alert(e.message);}b.disabled=false;});
 const all=host.querySelector('#pfAll');if(all)all.onclick=async()=>{all.disabled=true;const done=[];try{for(const row of host.querySelectorAll('.pfZ')){done.push(await one(job(row)));await new Promise(t=>setTimeout(t,400));}
  const notes=[`Jimmi Design Shop → Printful placement notes`,`Design: ${d.name||''}`,`Product: ${sel?sel.n+' (Printful catalog id '+sel.id+')':'no verified mapping'}`,'',...done.map(j=>`${j.name}  →  ${j.pl?'Printful area "'+j.pl+'"':'no matching area: place manually'}  (${j.w}x${j.h}px, 300 dpi${j.base?', base fill '+j.base:', transparent'})`),'',
   'Steps: open the product in Printful (Design Maker), choose your blank/color, open each print area, Upload the matching file, fit it to the print area, then check Printful\'s own preview/mockups.',
   'Nothing was sent to Printful automatically. Sizes are Design Shop zone sizes unless you typed Printful\'s print-area size.',...(aop?['AOP leggings: Printful cuts and sews panels; these files come from a flat preview, so check seams/safe zone in Printful\'s preview before ordering.']:[])].join('\n');
  save(new Blob([notes],{type:'text/plain'}),`jimmi-${slug(d.name)}-printful-placements.txt`);W.__pfLastAll=done;}catch(e){alert(e.message);}all.disabled=false;};}
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
W.JIMMI_PRINTFUL={open,PRODUCTS,zoneArt,zoneWarnings,srcPx,slug,catalog,render,pngFile,withDpi,crc,quality,PF_URL};
document.addEventListener('DOMContentLoaded',()=>{const sb=$('.stagebar');if(sb&&!$('#pfBtn')){const b=document.createElement('button');b.id='pfBtn';b.textContent='🖨️ Use in Printful';b.title='Download artwork-only transparent PNGs for Printful';b.onclick=open;sb.appendChild(b);}
 const lb=$('#lib .box');if(lb&&!$('#pfBtn2')){const b=document.createElement('button');b.id='pfBtn2';b.className='hot';b.textContent='🖨️ Download these for Printful (transparent PNGs)';b.onclick=()=>{$('#lib').hidden=true;open();};lb.insertBefore(b,$('#libGrid'));}});
})();

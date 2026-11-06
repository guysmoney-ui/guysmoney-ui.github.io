/* Printful export: artwork-only transparent PNGs (no garment, no mockup, no background) for upload into Printful's Design Maker.
   Printful docs: PNG/JPEG upload; recoloring uploaded art is not documented, so pick colors HERE before exporting. Nothing is sent to Printful. */
(function(){const W=window,R=()=>W.JimmiRender,$=s=>document.querySelector(s);
const PF_URL='https://www.printful.com/dashboard/product-templates';
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
function open(){let m=$('#pfModal');if(!m){m=document.createElement('div');m.id='pfModal';m.className='modal lib';m.innerHTML=`<div class="box"><div class="store-sign"><span class="neon2">Use in Printful</span></div>
<ol class="hint pfSteps"><li>Pick an artwork, set its colors and print width here (Printful can't recolor an uploaded PNG).</li><li>Tap <b>⬇️ PNG</b>. You get <b>only the artwork</b> on a transparent background — no shirt, no mockup.</li><li>Open Printful, choose your real shirt blank, then <b>Upload</b> (or drag the downloaded file from your Downloads folder) onto the print area and place it.</li></ol>
<p><a class="chip" href="${PF_URL}" target="_blank" rel="noopener">↗ Open Printful (new tab)</a> <span class="hint">Nothing is sent to Printful automatically.</span></p>
<label class="hint">Print DPI <select id="pfDpi"><option>300</option><option>150</option></select></label>
<div id="pfReady"></div><div id="pfList" class="pfList"></div><button id="pfClose">Close</button></div>`;document.body.appendChild(m);
 m.querySelector('#pfClose').onclick=()=>m.hidden=true;m.addEventListener('click',e=>{if(e.target===m)m.hidden=true;});build(m);}
 m.hidden=false;}
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
const st=document.createElement('style');st.textContent=`.pfList{display:flex;flex-direction:column;gap:8px;max-height:60vh;overflow:auto}.pfRow{display:flex;gap:10px;align-items:center;border:1px solid var(--neon,#f0f);border-radius:10px;padding:8px}.pfPrev{width:140px;height:100px;object-fit:contain;flex:none;border-radius:8px;background:repeating-conic-gradient(#2a2340 0 25%,#1a1530 0 50%) 0 0/16px 16px}.pfInfo{flex:1;min-width:0}.pfCtl{display:flex;flex-wrap:wrap;gap:8px;margin:4px 0}.pfCtl input[type=number]{width:70px}.pfQ.warn{color:#ffb347}.pfDl,.pfRow .chip{min-height:44px}`;document.head.appendChild(st);
W.JIMMI_PRINTFUL={open,catalog,render,pngFile,withDpi,crc,quality,PF_URL};
document.addEventListener('DOMContentLoaded',()=>{const sb=$('.stagebar');if(sb&&!$('#pfBtn')){const b=document.createElement('button');b.id='pfBtn';b.textContent='🖨️ Use in Printful';b.title='Download artwork-only transparent PNGs for Printful';b.onclick=open;sb.appendChild(b);}
 const lb=$('#lib .box');if(lb&&!$('#pfBtn2')){const b=document.createElement('button');b.id='pfBtn2';b.className='hot';b.textContent='🖨️ Download these for Printful (transparent PNGs)';b.onclick=()=>{$('#lib').hidden=true;open();};lb.insertBefore(b,$('#libGrid'));}});
})();

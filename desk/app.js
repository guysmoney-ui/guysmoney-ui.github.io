(()=>{
const R=window.JimmiRender,{C,G}=R,$=s=>document.querySelector(s);
const cv=$('#cv'),ctx=cv.getContext('2d');ctx.scale(2,2);
let PROF=null;try{PROF=JSON.parse(localStorage.getItem('jimmiProfile')||'null');}catch(_){}
const me=()=>PROF?{name:PROF.name||(PROF.role==='owner'?'Guy':'Designer'),role:PROF.role}:{name:'Guy',role:'owner'};
const isOwner=()=>me().role==='owner';
let D=R.makeTee({designer:me(),author:me().name}),sel='logo',undo=[],redo=[],zone='front',sid='s-front1';
const tee=()=>D.editor==='tee';const hist=(action,note)=>{D.history=D.history||[];D.history.push({at:new Date().toISOString(),by:me().name,role:me().role,action,...(note?{note}:{})});};
const snap=()=>JSON.stringify(D);let last=snap();
function commit(){const s=snap();if(s===last)return;undo.push(last);if(undo.length>200)undo.shift();redo=[];last=s;D.updated=new Date().toISOString();}
function load(d,msg){const e=R.validate(d);if(e.length){toast('Could not open: '+e[0]);return false;}
 d=R.upgrade(d);d.colors.stripeWidth=d.colors.stripeWidth||7;d.view=d.view||'front';d.logo.side=d.logo.side||'front';d.wordmark.side=d.wordmark.side||'front';
 undo.push(last);redo=[];D=d;last=snap();if(tee()){zone=D.garment==='bottle'?(D.view==='back'?'bottleBack':'bottleFront'):R.isLegs(D)?R.bandOf(D,D.view==='back'):(D.view==='back'?'back':'front');sid=null;}
 if(isOwner()&&D.status==='submitted'){msg='Submission from '+((D.designer||{}).name||'a designer')+' — review it in Submissions';showTab('inbox');setTimeout(()=>{const x=document.querySelector('.subs');if(x)x.scrollIntoView({block:'start'});},60);}
 else if(!isOwner()&&D.status==='rejected'){msg='Guy sent this back: revise and resubmit';}
 ui();if(msg)toast(msg);return true;}
function doUndo(){if(!undo.length)return;redo.push(snap());D=JSON.parse(undo.pop());last=snap();fixSel();ui();}
function fixSel(){if(tee()&&sid&&!(D.zones[zone]||[]).some(s=>s.id===sid))sid=null;}
function doRedo(){if(!redo.length)return;undo.push(snap());D=JSON.parse(redo.pop());last=snap();fixSel();ui();}
/* ---- palettes ---- */
const swatches=(id,names,val,extra='')=>{$(id).innerHTML=extra+names.map(n=>`<button class="sw${(val||'').toLowerCase()===C[n].toLowerCase()?' on':''}" data-v="${C[n]}" title="${n}" aria-label="${n}" style="background:${C[n]}"></button>`).join('')+`<label class="sw custom" title="Custom color"><input type="color" value="${val||'#ffffff'}" aria-label="Custom color"></label>`;};
const chips=(id,arr,val,lab=v=>v)=>{$(id).innerHTML=arr.map(v=>`<button class="chip${val===v?' on':''}" data-v="${v}">${lab(v)}</button>`).join('');};
const STARTERS=[['Navy & Yellow · logo on the calf',{garment:'leggings',base:C.Navy,logo:C.Yellow,lp:'calf',wp:'down the leg'}],['Black & Red · stripe down the side',{garment:'leggings',base:C.Black,logo:C.Red,lp:'hip',wp:'down the leg',stripe:C.Red,stripeWidth:3}],['Teal & Coral · logo on the thigh',{garment:'leggings',base:C.Teal,logo:C.Coral,lp:'thigh',wp:'down the leg'}],['Cobalt & Orange · stripe',{garment:'leggings',base:C.Cobalt,logo:C.Orange,lp:'calf',wp:'under the logo',stripe:C.Orange}],['Red & Black tee',{garment:'tee',base:C.Red,logo:C.Black,lp:'chest',wp:'under the logo'}],['Blue & Yellow hoodie',{garment:'hoodie',base:C.Cobalt,logo:C.Yellow,lp:'chest',wp:'under the logo'}],['Purple & Gold long sleeve',{garment:'longsleeve',base:C.Purple,logo:C.Gold,lp:'chest',wp:'down the sleeve'}],['Black & Neon zip',{garment:'zip',base:C.Black,logo:C.Neon,hair:C.Pink,lp:'left chest',wp:'down the sleeve',stripe:C.Pink}],['Navy & Gold joggers',{garment:'joggers',base:C.Navy,logo:C.Gold,lp:'thigh',wp:'down the leg',stripe:C.Gold}]];
$('#starters').innerHTML=STARTERS.map((s,i)=>`<button class="starter" data-i="${i}" style="--a:${s[1].base};--b:${s[1].logo}">${s[0]}</button>`).join('');
$('#starters').onclick=e=>{const b=e.target.closest('.starter');if(!b)return;const s=STARTERS[b.dataset.i];const n=R.make({...s[1],name:s[0],notes:D.notes,author:me().name,designer:me()});n.colors.stripeWidth=s[1].stripeWidth||7;load(n);};
$('#surprise').onclick=()=>{const p=a=>a[Math.floor(Math.random()*a.length)];const s=p(STARTERS)[1],gs=Object.keys(G),g=p(gs);const n=R.make({...s,garment:g,lp:p(G[g].lp.filter(x=>x!=='back')),wp:p(G[g].wp.filter(x=>x!=='none')),stripe:Math.random()<.4?s.logo:null,name:'Surprise '+G[g].n,designer:me(),author:me().name});load(n);};
/* ---- inbox ---- */
let INBOX=window.JIMMI_INBOX||[];
function paintInbox(){$('#inbox').innerHTML=INBOX.map((x,i)=>`<button data-i="${i}" style="--a:${x.base};--b:${x.accent}"><i></i><span><b>${x.name}</b><small>${x.notes}</small>${(x.design&&x.design.designer&&x.design.designer.name)?`<small class="cr">designs by ${esc(x.design.designer.name)}</small>`:''}</span></button>`).join('')||'<p class="hint">Inbox is empty.</p>';}
$('#inbox').onclick=async e=>{const b=e.target.closest('[data-i]');if(!b)return;const x=INBOX[b.dataset.i];let d=x.design;
 if(location.protocol.startsWith('http')){try{d=await (await fetch('inbox/'+x.file,{cache:'no-store'})).json();}catch(_){}}load(d,'Loaded '+x.name+' from JimmiBot');};
if(location.protocol.startsWith('http'))fetch('inbox/index.json',{cache:'no-store'}).then(r=>r.json()).then(j=>{INBOX=j.designs.map(x=>({...x,design:(INBOX.find(y=>y.file===x.file)||{}).design}));paintInbox();}).catch(()=>{});
/* ---- save to My Designs (localStorage, works on file://) ---- */
const SK='jimmiDesigns';const getSaved=()=>{try{return JSON.parse(localStorage.getItem(SK)||'[]');}catch(_){return [];}};
function paintSaved(){const L=getSaved();$('#saved').innerHTML=L.map((x,i)=>`<button data-i="${i}" style="--a:${esc(x.base||'#000')};--b:#19c37d"><i></i><span><b>${esc(x.name)}</b><small>${esc(x.kind)} · ${new Date(x.at).toLocaleString()}</small>${x.design.pair?`<span class="pairb">🔗 Paired with ${esc(x.design.pair.name)}</span>`:''}</span>${x.design.pair?`<span class="chip setopen" data-set="${i}" title="Open both as a set">👯 Open as set</span><span class="chip del" data-unpair="${i}" title="Unpair">✂ Unpair</span>`:''}<span class="chip del" data-del="${i}" title="Delete">🗑</span></button>`).join('')||'<p class="hint">Nothing saved yet. Hit 💾 Save.</p>';}
function saveDesign(){commit();D.updated=new Date().toISOString();if(!D.saveId)D.saveId='d'+Date.now().toString(36);const L=getSaved().filter(x=>x.id!==D.saveId);
 const kind=(D.garment&&G[D.garment]?G[D.garment].n:D.garment)||D.editor||'design';
 const nm=D.name||('My '+kind);if(D.pair){const p=L.find(x=>x.id===D.pair.id);if(p&&p.design.pair&&p.design.pair.id===D.saveId){p.design.pair.name=nm;}}
 L.unshift({id:D.saveId,name:nm,kind,base:(D.colors||{}).base,at:D.updated,design:JSON.parse(JSON.stringify(D))});
 try{localStorage.setItem(SK,JSON.stringify(L));}catch(e){toast('Save failed: storage full');return;}last=snap();paintSaved();
 const b=$('#bSave');b.classList.add('done');b.innerHTML='✓<span> Saved ✓</span>';clearTimeout(b._t);b._t=setTimeout(()=>{b.classList.remove('done');b.innerHTML='💾<span> Save</span>';},2500);toast('Saved ✓ — find it in Inbox › 📂 Your designs');}
$('#bSave').onclick=()=>SET?saveSet():saveDesign();
function unpair(id){const L=getSaved();const a=L.find(x=>x.id===id);if(!a||!a.design.pair)return;const b=L.find(x=>x.id===a.design.pair.id);if(b&&b.design.pair&&b.design.pair.id===id)delete b.design.pair;delete a.design.pair;localStorage.setItem(SK,JSON.stringify(L));if(D.saveId&&(D.saveId===id||(b&&D.saveId===b.id))){delete D.pair;last=snap();}paintSaved();toast('Unpaired');}
function pairWith(pid){if(!D.saveId||!getSaved().some(x=>x.id===D.saveId))saveDesign();const L=getSaved();const a=L.find(x=>x.id===D.saveId),b=L.find(x=>x.id===pid);if(!a||!b)return;
 for(const x of [a,b])if(x.design.pair)unpair(x.id);const L2=getSaved();const A=L2.find(x=>x.id===a.id),B=L2.find(x=>x.id===b.id);const setId='set-'+Date.now().toString(36);
 A.design.pair={id:B.id,name:B.name,kind:B.kind,setId};B.design.pair={id:A.id,name:A.name,kind:A.kind,setId};localStorage.setItem(SK,JSON.stringify(L2));D.pair=A.design.pair;last=snap();paintSaved();
 $('#modal').hidden=true;toast('🔗 Paired with '+B.name+' — sold as a set, each still buyable alone');}
$('#bPair').onclick=()=>{const L=getSaved().filter(x=>x.id!==D.saveId);if(!L.length){modal('<h2>Pair with…</h2><p>Save another design first (💾 Save), then pair it.</p>');return;}
 modal(`<h2 class="neon" style="font-size:28px">🔗 Pair with…</h2><p>Pick a saved design to sell with this one as a matching set.${D.pair?` Currently paired with <b>${esc(D.pair.name)}</b>.`:''}</p><div class="pick" id="pick">${L.map(x=>`<button data-p="${x.id}" style="border-left:14px solid ${esc(x.base||'#000')}"><b>${esc(x.name)}</b> <small>${esc(x.kind)}</small>${x.design.pair?' <small>(paired with '+esc(x.design.pair.name)+')</small>':''}</button>`).join('')}</div>`);
 $('#pick').onclick=e=>{const b=e.target.closest('[data-p]');if(b)pairWith(b.dataset.p);};};

addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.shiftKey&&(e.key==='S'||e.key==='s')){e.preventDefault();e.stopImmediatePropagation();SET?saveSet():saveDesign();}},true);
$('#saved').onclick=e=>{const L=getSaved();const so=e.target.closest('[data-set]');if(so){e.stopPropagation();openSet(L[+so.dataset.set]);return;}const u=e.target.closest('[data-unpair]');if(u){e.stopPropagation();unpair(L[+u.dataset.unpair].id);return;}const d=e.target.closest('[data-del]');if(d){e.stopPropagation();if(confirm('Delete this saved design?')){unpair(L[+d.dataset.del].id);const L3=getSaved().filter(x=>x.id!==L[+d.dataset.del].id);localStorage.setItem(SK,JSON.stringify(L3));paintSaved();}return;}
 const b=e.target.closest('[data-i]');if(!b)return;const x=L[b.dataset.i];if(x)load(JSON.parse(JSON.stringify(x.design)),'Opened '+x.name);};
/* ---- UI ---- */
function ui(){const g=G[D.garment];document.body.classList.toggle('tee',tee());paintTee();paintReview();paintRole();
 chips('#g',Object.keys(G).filter(k=>!G[k].editorOnly),D.garment,k=>G[k].n);chips('#view',['front','back'],D.view,v=>v==='front'?'Front':'Back');
 swatches('#base',R.BASES,D.colors.base);swatches('#logoc',R.INKS,D.colors.logo);swatches('#hairc',R.INKS,D.colors.hair);
 swatches('#st',R.INKS.filter((n,i)=>i<8||i>11),D.colors.stripe,`<button class="chip${D.colors.stripe?'':' on'}" data-v="none">None</button>`);
 chips('#lp',g.lp,D.logo.placement);chips('#wp',g.wp,D.wordmark.hidden?'none':D.wordmark.placement);chips('#selRow',['logo','word'],sel,v=>v==='logo'?'Buff Jimmi logo':'Wordmark');
 $('#selName').textContent=sel==='logo'?'Logo':'Wordmark';
 $('#ls').value=D.logo.scale;$('#ws').value=D.wordmark.scale;$('#wr').value=D.wordmark.rotation||0;$('#sw').value=D.colors.stripeWidth||7;
 if(document.activeElement!==$('#nm'))$('#nm').value=D.name;if(document.activeElement!==$('#nt'))$('#nt').value=D.notes;
 $('#bUndo').disabled=!undo.length;$('#bRedo').disabled=!redo.length;draw();}
function draw(){if(tee())return drawT();R.draw(ctx,D,{sel});$('#cap').textContent='Dashed line = print area · '+G[D.garment].area+' · preview is approximate';
 $('#spec').textContent=`${G[D.garment].n} · base ${R.hexName(D.colors.base)}\nlogo ${R.hexName(D.colors.logo)} / hair ${R.hexName(D.colors.hair)} @ ${D.logo.side} ${Math.round(D.logo.x)},${Math.round(D.logo.y)} ×${(+D.logo.scale).toFixed(2)}\nwordmark ${D.wordmark.hidden?'none':`${D.wordmark.side} ${Math.round(D.wordmark.x)},${Math.round(D.wordmark.y)} ×${(+D.wordmark.scale).toFixed(2)} ${Math.round(D.wordmark.rotation)}°`}\nstripe ${D.colors.stripe?R.hexName(D.colors.stripe)+' '+D.colors.stripeWidth+'px':'none'}`;}
const on=(id,fn)=>$(id).addEventListener('click',e=>{const b=e.target.closest('[data-v]');if(b){fn(b.dataset.v);commit();ui();}});
on('#g',v=>{const n=R.make({designer:D.designer,garment:v,base:D.colors.base,logo:D.colors.logo,hair:D.colors.hair,stripe:D.colors.stripe,name:D.name,notes:D.notes,author:D.author});n.colors.stripeWidth=D.colors.stripeWidth;n.created=D.created;D=R.upgrade(n);if(tee()){zone=R.isLegs(D)?R.bandOf(D,0):'front';sid=null;}});
on('#view',v=>D.view=v);on('#base',v=>D.colors.base=v);on('#logoc',v=>{D.colors.logo=v;D.colors.hair=v;});on('#hairc',v=>D.colors.hair=v);on('#st',v=>D.colors.stripe=v==='none'?null:v);
on('#lp',v=>{D.logo=R.logoPreset(D.garment,v);D.view=D.logo.side;sel='logo';if(D.wordmark.placement==='under the logo')D.wordmark=R.wordPreset(D.garment,'under the logo',D.logo);});
on('#wp',v=>{D.wordmark=R.wordPreset(D.garment,v,D.logo);sel='word';if(!D.wordmark.hidden)D.view=D.wordmark.side;});
on('#selRow',v=>sel=v);
['#base','#logoc','#hairc','#st'].forEach(id=>$(id).addEventListener('change',e=>{if(e.target.type!=='color')return;const v=e.target.value;if(id==='#base')D.colors.base=v;else if(id==='#logoc'){D.colors.logo=v;D.colors.hair=v;}else if(id==='#hairc')D.colors.hair=v;else D.colors.stripe=v;commit();ui();}));
const slide=(id,fn)=>{$(id).addEventListener('input',e=>{fn(+e.target.value);draw();});$(id).addEventListener('change',()=>{commit();ui();});};
slide('#ls',v=>{D.logo.scale=v;sel='logo';});slide('#ws',v=>{D.wordmark.scale=v;sel='word';});slide('#wr',v=>{D.wordmark.rotation=v;sel='word';D.wordmark.placement='custom';});slide('#sw',v=>D.colors.stripeWidth=v);
$('#nm').oninput=e=>{D.name=e.target.value.slice(0,60);draw();};$('#nm').onchange=()=>commit();$('#nt').oninput=e=>D.notes=e.target.value;$('#nt').onchange=()=>commit();
/* ---- drag / pinch / wheel ---- */
const pts=new Map();let drag=null,pinch=null;
const toL=e=>{const r=cv.getBoundingClientRect();return [(e.clientX-r.left)*600/r.width,(e.clientY-r.top)*800/r.height];};
const el=()=>sel==='logo'?D.logo:D.wordmark;
cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);pts.set(e.pointerId,toL(e));if(tee())return tDown(e);
 if(pts.size===1){const [x,y]=pts.get(e.pointerId);const h=R.hit(D,x,y,D.view);if(h){sel=h;const o=el();drag={dx:x-o.x,dy:y-o.y};ui();}else drag=null;}
 else if(pts.size===2){const [a,b]=[...pts.values()];pinch={d:Math.hypot(a[0]-b[0],a[1]-b[1]),s:el().scale};drag=null;}});
cv.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,toL(e));if(tee())return tMove(e);
 if(pinch&&pts.size===2){const [a,b]=[...pts.values()];el().scale=Math.max(.2,Math.min(2,pinch.s*Math.hypot(a[0]-b[0],a[1]-b[1])/pinch.d));draw();}
 else if(drag){const [x,y]=pts.get(e.pointerId);const o=el();o.x=Math.max(0,Math.min(600,x-drag.dx));o.y=Math.max(0,Math.min(800,y-drag.dy));o.placement='custom';o.side=D.view;draw();}});
const up=e=>{pts.delete(e.pointerId);if(pts.size<2){pinch=null;tp=null;}if(!pts.size){drag=null;td=null;commit();ui();}};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
cv.addEventListener('wheel',e=>{e.preventDefault();if(tee()){const t=cur();if(t){t.scale=clampS(t.scale*(e.deltaY<0?1.05:1/1.05));draw();clearTimeout(cv._w);cv._w=setTimeout(()=>{commit();ui();},300);}return;}const o=el();o.scale=Math.max(.2,Math.min(2,o.scale*(e.deltaY<0?1.05:1/1.05)));draw();clearTimeout(cv._w);cv._w=setTimeout(()=>{commit();ui();},300);},{passive:false});
/* ---- share link / open ---- */
const b64u={enc:s=>btoa(unescape(encodeURIComponent(s))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''),dec:s=>decodeURIComponent(escape(atob(s.replace(/-/g,'+').replace(/_/g,'/'))))};
function shareLink(){const base=location.protocol.startsWith('http')?location.origin+location.pathname:'https://guysmoney-ui.github.io/desk/';return base+'?d='+b64u.enc(JSON.stringify(D));}
$('#bLink').onclick=async()=>{const u=shareLink();try{await navigator.clipboard.writeText(u);toast('Share link copied');}catch(_){prompt('Copy this link:',u);}};
function readFile(f){if(!f)return;const r=new FileReader();r.onload=()=>{try{load(JSON.parse(r.result),'Opened '+f.name);}catch(_){toast('That file is not a valid .jimmi.json');}};r.readAsText(f);}
$('#bOpen').onclick=()=>$('#file').click();$('#file').onchange=e=>{readFile(e.target.files[0]);e.target.value='';};
let dc=0;addEventListener('dragenter',e=>{e.preventDefault();dc++;$('#drop').hidden=false;});addEventListener('dragleave',()=>{if(--dc<=0){dc=0;$('#drop').hidden=true;}});
addEventListener('dragover',e=>e.preventDefault());addEventListener('drop',e=>{e.preventDefault();dc=0;$('#drop').hidden=true;readFile(e.dataTransfer.files[0]);});
if('launchQueue' in window)launchQueue.setConsumer(async p=>{if(p.files&&p.files[0])readFile(await p.files[0].getFile());});
/* ---- send to JimmiBot ---- */
const slug=()=>(D.name||'jimmi').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'jimmi';
const blob=c=>new Promise(r=>c.toBlob(r,'image/png'));
async function bundle(only){D.updated=new Date().toISOString();const s=slug();const out=[new File([JSON.stringify(D,null,2)],s+'.jimmi.json',{type:'application/json'})];
 for(const x of R.exportsOf(D,{px:2000})){if(only&&!only.includes(x.suffix))continue;out.push(new File([await blob(x.canvas)],s+'-'+x.suffix+'.png',{type:'image/png'}));}return out;}
window.__jimmi={newShorts:()=>$('#shortsBtn').click(),addStripe:(z,o)=>{zone=z;const s=R.sticker('stripe',{body:o.color||'#ffffff'},z,o);s.z=zmax()+1;(D.zones[z]=D.zones[z]||[]).push(s);sid=s.id;const Z=R.ZONES[z];if(Z.view&&Z.view!==D.view)D.view=Z.view;commit();ui();return s.id;},badge:()=>addBadge(),addText:(t,f,c,col)=>{const s=R.textSticker(t,f,c,{body:col||'#ffffff'},zone);s.z=zmax()+1;(D.zones[zone]=D.zones[zone]||[]).push(s);sid=s.id;commit();ui();return s.id;},repeat:(m,c,g)=>doRepeat(m,c,g),newBottle:()=>$('#botBtn').click(),newLeggings:()=>$('#legBtn').click(),select:(z,id)=>{zone=z;sid=id;const Z=R.ZONES[z];if(Z.view&&Z.view!==D.view)D.view=Z.view;ui();},openLib:()=>openLib(),get:()=>D,load,bundle,shareLink,undo:doUndo,redo:doRedo,state:()=>({zone,sid}),selectZone:z=>{zone=z;sid=null;ui();},addSticker:(el,c)=>addSticker(el,c),flip:()=>flip(),commit:()=>{commit();ui();},submit:()=>submit(),approve:()=>approve(),reject:n=>reject(n),setProfile:p=>setProfile(p),lastSent:()=>window.__lastSent};
const dl=fs=>fs.forEach((f,i)=>setTimeout(()=>{const a=document.createElement('a');a.href=URL.createObjectURL(f);a.download=f.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);},i*400));
const touch=matchMedia('(max-width:1000px), (pointer:coarse)').matches;
$('#bSend').onclick=()=>isOwner()?sendBot():submit();
async function sendBot(){hist('exported');commit();const fs=await bundle();window.__lastSent=fs.map(f=>f.name);
 if(touch&&navigator.canShare&&navigator.canShare({files:fs.slice(0,2)})){try{await navigator.share({files:fs.slice(0,2),title:"Jimmi's Design Shop: "+D.name,text:"Refurbish and publish to mall (or main site): "+D.name});toast('Shared!');return;}catch(e){if(e.name==='AbortError')return;}}
 dl(fs);
 modal(`<h2 class="neon" style="font-size:30px">Sent to your Downloads</h2>${D.designer&&D.designer.name?`<p>Credit: <b>designs by ${esc(D.designer.name)}</b> (on the mockup footer${D.creditTag?' and print tag':''}).</p>`:''}<p>Saved ${fs.length} files:</p><ul>${fs.map(f=>`<li><code>${f.name}</code></li>`).join('')}</ul><p><b>Drop these files in your JimmiBot chat and say "refurbish and publish to mall" or "main site".</b></p><p class="hint">Print PNGs are transparent print layers (tee: front, back and each sleeve at 150 dpi); the mockup PNG shows it on the garment.</p>`);}
/* ---- Tee Editor (schema v2 sticker objects) ---- */
const esc=t=>String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let td=null,tp=null,shiftHeld=false;addEventListener('keydown',e=>{if(e.key==='Shift')shiftHeld=true;});addEventListener('keyup',e=>{if(e.key==='Shift')shiftHeld=false;});
const cur=()=>tee()&&sid?(D.zones[zone]||[]).find(s=>s.id===sid):null;
const clampS=v=>Math.max(.1,Math.min(3,v));const normA=a=>{a=((a+180)%360+360)%360-180;return Math.round(a*10)/10;};const snap45=a=>Math.round(a/45)*45;
const mirrored=()=>R.toScreen(zone,D.view,{x:0,rotation:1}).rotation===-1;
function clampPos(s){const [x,y,w,h]=R.ZONES[zone].rect;s.x=Math.max(x,Math.min(x+w,s.x));s.y=Math.max(y,Math.min(y+h,s.y));}
function drawT(){R.drawTee(ctx,D,{zone,sel:sid});const Z=R.ZONES[zone];
 $('#cap').textContent=`${R.isLegs(D)?G[D.garment].n+' · ':''}Selected zone: ${Z.n} (${Z.inch[0]}″ × ${Z.inch[1]}″ print) · tap another zone to switch · preview is approximate`;
 const cnt=R.zk(D).map(k=>`${R.ZONES[k].n}: ${(D.zones[k]||[]).length}`).join(' · ');const s=cur();
 $('#spec2').textContent=`${G[D.garment].n} · base ${R.hexName(D.colors.base)}\n${cnt}${s?`\nselected: ${R.EL[s.el].n} @ ${Math.round(s.x)},${Math.round(s.y)} ×${s.scale.toFixed(2)} ${Math.round(s.rotation)}°`:''}${D.designer&&D.designer.name?'\ndesigns by '+D.designer.name:''}`;
 $('#spec').textContent=$('#spec2').textContent;}
function paintTee(){document.body.classList.toggle('bottle',D.garment==='bottle');document.body.classList.toggle('legs',tee()&&R.isLegs(D));if(tee()&&R.isLegs(D)){swatches('#st2',R.INKS.filter((n,i)=>i<8||i>11),D.colors.stripe,`<button class="chip${D.colors.stripe?'':' on'}" data-v="none">None</button>`);$('#sw2').value=D.colors.stripeWidth||7;}if(!tee())return;if(D.garment==='bottle'){$('#botPre').innerHTML=R.BP.map(([b,l])=>`<button class="chip${D.colors.base===C[b]&&D.colors.lid===C[l]?' on':''}" data-v="${b}|${l}"><i style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${C[b]};border:2px solid ${C[l]}"></i> ${b} / ${l}</button>`).join('');swatches('#lidc',R.INKS.concat(['Black','Navy']).filter((v,i,a)=>a.indexOf(v)===i),D.colors.lid);chips('#botSize',['24','28'],String(D.size||24),v=>v+' oz');}const s=cur();
 {const T=['tee','longsleeve','hoodie','zip'],L=['leggings','joggers','shorts'],arr=T.includes(D.garment)?T:L.includes(D.garment)?L:[];chips('#teeStyle',arr,D.garment,k=>G[k].n);}paintTxt();paintRep();chips('#zones',R.zk(D),zone,k=>R.ZONES[k].n);$('#flipLab').textContent=D.view==='back'?'Back':'Front';$('#flip').firstChild.textContent=D.garment==='bottle'?'⟲ Turn: ':'⟲ Flip: ';
 $('#sName').textContent=s?R.EL[s.el].n:'none — tap a sticker';['#sSize','#sAng'].forEach(i=>$(i).disabled=!s);[...$('#sActs').children].forEach(b=>b.disabled=!s);
 if(s){$('#sSize').value=s.scale;$('#sAng').value=s.rotation||0;$('#sAngV').textContent=Math.round(s.rotation||0)+'°';}
 swatches('#sBody',R.INKS,s?s.colors.body:'');swatches('#sHair',R.INKS,s?s.colors.hair:'');
 if(document.activeElement!==$('#nm2'))$('#nm2').value=D.name;$('#creditTag').checked=!!D.creditTag;$('#libZone').textContent=R.ZONES[zone].n.toLowerCase();}
on('#zones',v=>{zone=v;sid=null;const Z=R.ZONES[v];if(Z.view&&Z.view!==D.view)D.view=Z.view;});
const setC=(k,v)=>{const s=cur();if(!s){toast('Tap a sticker first');return;}s.colors[k]=v;if(k==='body'&&s.el==='word')s.colors.hair=v;};
on('#sBody',v=>setC('body',v));on('#sHair',v=>setC('hair',v));
['#sBody','#sHair'].forEach(id=>$(id).addEventListener('change',e=>{if(e.target.type!=='color')return;setC(id==='#sBody'?'body':'hair',e.target.value);commit();ui();}));
slide('#sSize',v=>{const s=cur();if(s)s.scale=clampS(v);});
slide('#sAng',v=>{const s=cur();if(!s)return;s.rotation=shiftHeld?snap45(v):v;$('#sAngV').textContent=Math.round(s.rotation)+'°';});
$('#nm2').oninput=e=>{D.name=e.target.value.slice(0,60);draw();};$('#nm2').onchange=()=>commit();
$('#creditTag').onchange=e=>{D.creditTag=e.target.checked;commit();ui();};
function zmax(){return Math.max(0,...(D.zones[zone]||[]).map(s=>s.z||0));}
function addSticker(el,c){const s=R.sticker(el,c,zone);s.z=zmax()+1;(D.zones[zone]=D.zones[zone]||[]).push(s);sid=s.id;const Z=R.ZONES[zone];if(Z.view&&Z.view!==D.view)D.view=Z.view;commit();ui();return s.id;}
$('#sActs').onclick=e=>{const b=e.target.closest('[data-a]'),s=cur();if(!b||!s)return;const a=D.zones[zone],i=a.indexOf(s);
 if(b.dataset.a==='del'){a.splice(i,1);sid=null;}else if(b.dataset.a==='dup'){const n=JSON.parse(JSON.stringify(s));n.id='s'+Math.random().toString(36).slice(2,8);n.x+=14;n.y+=14;n.z=zmax()+1;clampPosFor(n);a.push(n);sid=n.id;}
 else if(b.dataset.a==='fwd')s.z=zmax()+1;else if(b.dataset.a==='bwd')s.z=Math.min(0,...a.map(q=>q.z||0))-1;commit();ui();};
function clampPosFor(s){clampPos(s);}
function tDown(e){const p=[...pts.values()];
 if(pts.size===2){const s=cur();if(s){tp={d:Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]),a:Math.atan2(p[1][1]-p[0][1],p[1][0]-p[0][0]),s:s.scale,r:s.rotation||0};td=null;}return;}
 const [x,y]=pts.get(e.pointerId),h=R.teeHit(D,x,y,D.view,zone,sid);
 if(!h){sid=null;ui();return;}zone=h.zone;if(h.kind==='zone'){sid=null;ui();return;}sid=h.id;const s=cur(),b=R.toScreen(zone,D.view,s);
 td={kind:h.kind,cx:b.x,cy:b.y,dx:x-b.x,dy:y-b.y,s0:s.scale,l0:s.len,ux:Math.cos((b.rotation||0)*Math.PI/180),uy:Math.sin((b.rotation||0)*Math.PI/180),d0:Math.max(8,Math.hypot(x-b.x,y-b.y))};ui();}
function tMove(e){const s=cur();if(!s)return;const m=mirrored()?-1:1;
 if(tp&&pts.size===2){const p=[...pts.values()];s.scale=clampS(tp.s*Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1])/tp.d);let a=tp.r+m*(Math.atan2(p[1][1]-p[0][1],p[1][0]-p[0][0])-tp.a)*180/Math.PI;s.rotation=normA(e.shiftKey?snap45(a):a);draw();return;}
 if(!td)return;const [x,y]=pts.get(e.pointerId);
 if(td.kind==='sticker'){s.x=R.fromScreen(zone,D.view,x-td.dx);s.y=y-td.dy;clampPos(s);}
 else if(td.kind==='size'&&s.el==='stripe'){const p0=Math.max(4,Math.abs(td.dx*td.ux+td.dy*td.uy)),p=Math.abs((x-td.cx)*td.ux+(y-td.cy)*td.uy);s.len=Math.round(Math.max(6,Math.min(760,td.l0*p/p0)));}
 else if(td.kind==='size')s.scale=clampS(td.s0*Math.hypot(x-td.cx,y-td.cy)/td.d0);
 else if(td.kind==='rot'){let a=Math.atan2(y-td.cy,x-td.cx)*180/Math.PI+90;if(e.shiftKey)a=snap45(a);s.rotation=normA(m*a);}
 draw();}
function tKey(e){const k=e.key,s=cur();if(e.ctrlKey||e.metaKey)return false;
 if(k==='f'||k==='F'){flip();return true;}if(!s)return false;const st=e.shiftKey?10:2;let hit=1;
 if(k==='ArrowLeft')s.x-=st*(mirrored()?-1:1);else if(k==='ArrowRight')s.x+=st*(mirrored()?-1:1);else if(k==='ArrowUp')s.y-=st;else if(k==='ArrowDown')s.y+=st;
 else if(k==='+'||k==='=')s.scale=clampS(s.scale*1.05);else if(k==='-')s.scale=clampS(s.scale/1.05);
 else if(k===']')s.rotation=normA((s.rotation||0)+(e.shiftKey?45:5));else if(k==='[')s.rotation=normA((s.rotation||0)-(e.shiftKey?45:5));
 else if(k==='Delete'||k==='Backspace'){D.zones[zone]=D.zones[zone].filter(q=>q!==s);sid=null;}else hit=0;
 if(hit){e.preventDefault();clampPos(s);commit();ui();}return !!hit;}
let flipping=false;
async function flip(){if(flipping)return;flipping=true;const T=(a,b)=>cv.animate([{transform:`perspective(1200px) rotateY(${a}deg)`},{transform:`perspective(1200px) rotateY(${b}deg)`}],{duration:200,easing:'ease-in-out'}).finished;
 try{await T(0,90);}catch(_){}D.view=D.view==='back'?'front':'back';if(D.garment==='bottle'){if(!R.ZONES[zone].lid&&R.ZONES[zone].view!==D.view){zone=D.view==='back'?'bottleBack':'bottleFront';sid=null;}}else if(R.isLegs(D)){if(R.ZONES[zone].view!==D.view){zone=R.bandOf(D,D.view==='back');sid=null;}}else if(!R.ZONES[zone].sleeve){zone=D.view;sid=null;}commit();ui();try{await T(-90,0);}catch(_){}flipping=false;}
$('#flip').onclick=flip;
on('#st2',v=>D.colors.stripe=v==='none'?null:v);slide('#sw2',v=>D.colors.stripeWidth=v);$('#st2').addEventListener('change',e=>{if(e.target.type==='color'){D.colors.stripe=e.target.value;commit();ui();}});
on('#teeStyle',v=>{const k=R.zk(D).indexOf(zone);R.restyle(D,v);zone=R.zk(D)[k]||(R.isLegs(D)?R.bandOf(D,0):D.view);if(!(D.zones[zone]||[]).some(q=>q.id===sid))sid=null;});
$('#hoodBtn').onclick=()=>{const n=R.makeEditor('hoodie',{designer:me(),author:me().name,base:C.Black});n.notes=D.notes||'';load(n,'Hoodie Editor: pick a color, add stickers');zone='front';sid='s-front1';ui();showTab('colors');};
/* ---- curved text ---- */
const th2v=t=>100*Math.log(t*32)/Math.log(64),v2th=v=>Math.round(Math.pow(64,v/100)/32*1024)/1024;
const inch=t=>{const n=Math.round(t*32);if(Math.abs(n/32-t)>.004)return t.toFixed(3)+'″';let a=n,b=32;while(a%2===0&&b>1){a/=2;b/=2;}const w=Math.floor(a/b),r=a%b;return (w?w+(r?' ':''):'')+(r?r+'/'+b:'')+'″';};
function paintStr(){const s=cur(),t=s&&s.el==='stripe';document.body.classList.toggle('strSel',!!t);if(!t)return;
 chips('#stLines',['1','2','3'],String(s.lines),v=>['','Single','Double','Triple'][v]);$('#stTh').value=th2v(s.thick);$('#stThV').textContent=inch(s.thick);$('#stLen').value=s.len;$('#stLenV').textContent=(s.len/R.PPI).toFixed(1)+'″';}
on('#stLines',v=>{const s=cur();if(s)s.lines=+v;});
slide('#stTh',v=>{const s=cur();if(s){s.thick=Math.max(R.STH[0],Math.min(R.STH[1],v2th(v)));$('#stThV').textContent=inch(s.thick);}});
slide('#stLen',v=>{const s=cur();if(s){s.len=v;$('#stLenV').textContent=(v/R.PPI).toFixed(1)+'″';}});
function paintTxt(){paintStr();const s=cur(),t=s&&s.el==='text';document.body.classList.toggle('txtSel',!!t);if(!t)return;
 chips('#tWord',R.TEXTS,s.text);chips('#tFont',['script','round'],s.font,v=>v==='script'?'Script':'Rounded');$('#tCurve').value=s.curve||0;$('#tCurveV').textContent=Math.round(s.curve||0)+'°';$('#tSp').value=s.spacing||0;$('#tSpV').textContent=s.spacing||0;}
on('#tWord',v=>{const s=cur();if(s)s.text=v;});on('#tFont',v=>{const s=cur();if(s)s.font=v;});
slide('#tCurve',v=>{const s=cur();if(s){s.curve=v;$('#tCurveV').textContent=v+'°';}});slide('#tSp',v=>{const s=cur();if(s){s.spacing=v;$('#tSpV').textContent=v;}});
function addBadge(){const s=cur(),col=s?s.colors:{body:R.C.Black,hair:R.C.Black};const out=R.badge(D,zone,{body:col.body,hair:col.hair||col.body});sid=out[0].id;const Z=R.ZONES[zone];if(Z.view&&Z.view!==D.view)D.view=Z.view;commit();ui();toast('Badge added to '+Z.n.toLowerCase());}
$('#badgeBtn').onclick=addBadge;
on('#botPre',v=>{const [b,l]=v.split('|');D.colors.base=C[b];D.colors.lid=C[l];});on('#lidc',v=>D.colors.lid=v);on('#botSize',v=>D.size=+v);
$('#lidc').addEventListener('change',e=>{if(e.target.type==='color'){D.colors.lid=e.target.value;commit();ui();}});
$('#botBtn').onclick=()=>{const n=R.makeBottle({designer:me(),author:me().name});n.notes=D.notes||'';load(n,'Bottle Editor: tap the front, back or lid');zone='bottleFront';sid='s-bot1';ui();showTab('place');};
/* ---- repeat / pattern ---- */
let repMode='row';
function paintRep(){const L=R.isLegs(D),modes=L?['wrap','row','column']:['row','column'];if(!modes.includes(repMode))repMode=L?'wrap':'row';
 chips('#repMode',modes,repMode,v=>({wrap:'Around waistband',row:'Row across',column:'Column down'})[v]);const s=cur();
 $('#repGo').disabled=!s;$('#repUn').disabled=$('#repDel').disabled=!(s&&s.group);
 $('#repHint').textContent=s&&s.group?`Part of a repeat group (${R.zk(D).reduce((n,z)=>n+(D.zones[z]||[]).filter(q=>q.group===s.group).length,0)} copies). Change count/spacing and tap Repeat to re-tile.`:'Pick a sticker, then repeat it. Copies tile evenly and stay linked as a group, so repeating again re-tiles them.';}
on('#repMode',v=>repMode=v);
$('#repN').oninput=e=>$('#repNV').textContent=e.target.value;$('#repG').oninput=e=>$('#repGV').textContent=e.target.value;
function doRepeat(mode,count,gap){repMode=mode;const s=cur();if(!s){toast('Tap a sticker first');return 0;}const out=R.repeat(D,zone,s,{mode,count,gap});sid=out[0].id;zone=R.zk(D).find(z=>(D.zones[z]||[]).includes(out[0]));commit();ui();toast(mode==='wrap'?`Wrapped ${out.length} around the waistband`:`Repeated ×${out.length}`);return out.length;}
$('#repGo').onclick=()=>doRepeat(repMode,+$('#repN').value,+$('#repG').value);
$('#repUn').onclick=()=>{const s=cur();if(s&&s.group){R.ungroup(D,s.group);commit();ui();toast('Ungrouped: each copy moves on its own now');}};
$('#repDel').onclick=()=>{const s=cur();if(!s||!s.group)return;const g=s.group;R.zk(D).forEach(z=>D.zones[z]=(D.zones[z]||[]).filter(q=>q.group!==g));sid=null;commit();ui();};
$('#shortsBtn').onclick=()=>{const n=R.makeShorts({designer:me(),author:me().name});n.notes=D.notes||'';load(n,'Shorts Editor: tap the waistband or a leg');zone='shLeftLeg';sid='s-sh1';ui();showTab('place');};
$('#legBtn').onclick=()=>{const n=R.makeLeggings({designer:me(),author:me().name});n.notes=D.notes||'';load(n,'Leggings Editor: tap the waistband or a leg');zone='leftLeg';sid='s-leg1';ui();showTab('place');};
$('#teeBtn').onclick=()=>{const n=R.makeEditor('tee',{designer:me(),author:me().name});n.notes=D.notes||'';load(n,'Tee Editor: black tee ready');zone='front';sid='s-front1';ui();showTab('place');};
/* sticker page */
function openLib(){const g=$('#libGrid');if(!g.dataset.done){let h='';for(const el of ['head','skinny','leg',...Object.keys(R.EL).filter(k=>!['head','skinny','leg'].includes(k))]){h+=`<h5>${R.EL[el].n}${['head','skinny','leg'].includes(el)?' <i class="new">NEW</i>':''}</h5>`;R.PRESETS.forEach(([b,hr],i)=>{h+=`<button data-el="${el}" data-b="${C[b]}" data-h="${C[hr]}" title="${R.EL[el].n} · ${b}${b!==hr?' / '+hr+' hair':''}" aria-label="${R.EL[el].n} ${b}"><canvas width="120" height="120"></canvas></button>`;});}
  h=`<h5>Stripes <i class="new">NEW</i></h5>`+[1,2,3].map(n=>`<button data-el="stripe" data-n="${n}" data-b="#ffffff" data-h="#ffffff" title="${['','Single','Double','Triple'][n]} stripe"><canvas width="120" height="120"></canvas></button>`).join('')+`<h5>Curved text <i class="new">NEW</i></h5><button class="badgeLib" data-badge="1" title="Badge">🏅 Badge</button>`+R.TEXTS.flatMap(t=>['script','round'].map(f=>`<button data-el="text" data-t="${t}" data-f="${f}" data-b="#ffffff" data-h="#ffffff" title="${t} · ${f}"><canvas width="120" height="120"></canvas></button>`)).join('')+h;g.innerHTML=h;g.dataset.done=1;g.querySelectorAll('button[data-el]').forEach(b=>{const c=b.firstChild.getContext('2d'),s={el:b.dataset.el,colors:{body:b.dataset.b,hair:b.dataset.h},x:60,y:60,scale:1,rotation:0,text:b.dataset.t,font:b.dataset.f,curve:b.dataset.t?120:0,lines:+b.dataset.n||1,thick:.3,len:110,spacing:b.dataset.f==='round'?4:0},[w,hh]=R.dims(s);s.scale=Math.min(100/w,100/hh);R.drawEl(c,s,0);});}
 $('#libZone').textContent=R.ZONES[zone].n.toLowerCase();$('#lib').hidden=false;}
$('#stkBtn').onclick=openLib;$('#stkBtn2').onclick=openLib;$('#libClose').onclick=()=>$('#lib').hidden=true;
$('#libGrid').onclick=e=>{if(e.target.closest('[data-badge]')){$('#lib').hidden=true;addBadge();return;}const b=e.target.closest('[data-el]');if(!b)return;if(b.dataset.el==='stripe'){const s=R.sticker('stripe',{body:R.C.White},zone,{lines:+b.dataset.n});s.z=zmax()+1;(D.zones[zone]=D.zones[zone]||[]).push(s);sid=s.id;commit();ui();}else if(b.dataset.el==='text'){const s=R.textSticker(b.dataset.t,b.dataset.f,120,{body:R.C.White},zone);s.z=zmax()+1;(D.zones[zone]=D.zones[zone]||[]).push(s);sid=s.id;commit();ui();}else addSticker(b.dataset.el,{body:b.dataset.b,hair:b.dataset.h});$('#lib').hidden=true;toast('Stuck on '+R.ZONES[zone].n.toLowerCase());};
/* ---- profile + designer credit + review (file/link based; no accounts) ---- */
function paintRole(){const m=me();$('#whoName').textContent=`${m.name} · ${m.role==='owner'?'Owner':'Designer'}`;
 $('#bSend').innerHTML=m.role==='owner'?'🚀<span> Send to JimmiBot</span>':'📨<span> Submit to Guy</span>';$('#bSend').title=m.role==='owner'?'Send to JimmiBot (Ctrl+S)':'Submit to Guy for review (Ctrl+S)';
 $('#subsSign').textContent=m.role==='owner'?'Submissions':'My Submissions';$('#tabInbox').textContent=m.role==='owner'?'Review':'Inbox';}
let rvKey='';
function paintReview(){const m=me(),d=D,k=[m.role,d.status,(d.history||[]).length,d.reviewNotes,(d.designer||{}).name,d.name].join('|');if(k===rvKey)return;rvKey=k;
 const who=d.designer&&d.designer.name?`<b class="credit">designs by ${esc(d.designer.name)}</b>`:'<i>no credit</i>';
 if(!(d.status==='submitted'||d.reviewNotes||(m.role!=='owner'&&d.status==='rejected'))){$('#review').innerHTML='<button id="ydBtn" class="wide yd">📂 Your designs</button>';$('#ydBtn').onclick=()=>{const s=$('#yourDesigns');s.classList.add('flash');s.scrollIntoView({behavior:'smooth',block:'start'});setTimeout(()=>s.classList.remove('flash'),1500);};return;}
 let h=`<div class="rv"><div>${esc(d.name)}</div><div>${who} <span class="pill ${d.status}">${d.status}</span></div>`;
 if(d.reviewNotes)h+=`<p><b>Guy's notes:</b> ${esc(d.reviewNotes)}</p>`;
 if(m.role==='owner'&&d.status==='submitted')h+=`<textarea id="rvNotes" rows="3" placeholder="Review notes (required to reject)"></textarea><div class="acts"><button class="ok" id="rvOk">✔ Approve</button><button class="no" id="rvNo">✖ Reject</button></div>`;
  else if(d.status==='rejected')h+=`<p class="hint">Revise the design, then tap <b>Submit to Guy</b> to resubmit.</p>`;
 else h+=`<p class="hint">${d.status==='submitted'?'Waiting on Guy.':'When it\'s ready, tap <b>Submit to Guy</b>.'}</p>`;
 const hs=(d.history||[]).slice(-6);if(hs.length)h+=`<ol>${hs.map(x=>`<li>${esc(x.action)} · ${esc(x.by)} · ${new Date(x.at).toLocaleString()}${x.note?' — '+esc(x.note):''}</li>`).join('')}</ol>`;
 $('#review').innerHTML=h+'</div>';const ok=$('#rvOk');if(ok){ok.onclick=()=>approve($('#rvNotes').value);$('#rvNo').onclick=()=>reject($('#rvNotes').value);}}
async function shareOut(fs,title,text,mail){window.__lastSent=fs.map(f=>f.name);
 if(touch&&navigator.canShare&&navigator.canShare({files:fs})){try{await navigator.share({files:fs,title,text});toast('Shared!');return 'shared';}catch(e){if(e.name==='AbortError')return 'aborted';}}
 dl(fs);modal(`<h2 class="neon" style="font-size:30px">${esc(title)}</h2><p>Saved ${fs.length} files to Downloads:</p><ul>${fs.map(f=>`<li><code>${f.name}</code></li>`).join('')}</ul><p><a class="hot mail" id="mailLink" href="${mail}" style="display:inline-block;padding:10px 16px;border-radius:99px;color:#fff;text-decoration:none">✉️ Email the link</a></p><p class="hint">Attach the downloaded files to the email if you like; the link alone reopens the design.</p>`);return 'downloaded';}
async function submit(){if(isOwner()){toast('Owner mode: use Send to JimmiBot');return;}const was=D.status;D.designer=me();D.author=me().name;D.status='submitted';hist(was==='rejected'?'resubmitted':'submitted');commit();ui();
 const fs=await bundle(['mockup']),link=shareLink(),sub=`Jimmi design for review: ${D.name} (designs by ${me().name})`;
 return shareOut(fs,'Submitted to Guy',`${sub}\n${link}`,`mailto:guysmoney@gmail.com?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(`Hey Guy, here's my Jimmi design for review:\n${link}\n\n— ${me().name}`)}`);}
async function approve(notes){if(!isOwner())return;D.status='approved';if(notes)D.reviewNotes=notes;hist('approved',notes||'');commit();ui();await sendBot();}
async function reject(notes){if(!isOwner())return false;notes=(notes||'').trim();if(!notes){toast('Add notes so the designer knows what to fix');const t=$('#rvNotes');if(t)t.focus();return false;}
 D.status='rejected';D.reviewNotes=notes;hist('rejected',notes);commit();ui();const fs=await bundle(['mockup']),link=shareLink(),sub=`Jimmi design sent back: ${D.name}`;
 await shareOut(fs,'Sent back to '+((D.designer||{}).name||'designer'),`${sub}\nNotes: ${notes}\n${link}`,`mailto:?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(`Notes from Guy: ${notes}\n\nOpen, revise and resubmit:\n${link}`)}`);return true;}
function setProfile(p){PROF={role:p.role==='designer'?'designer':'owner',name:(p.name||'').trim().slice(0,40)||(p.role==='designer'?'Designer':'Guy')};localStorage.setItem('jimmiProfile',JSON.stringify(PROF));
 if(D.status==='draft'&&!(D.history||[]).some(h=>h.action!=='created'))D.designer=me();rvKey='';ui();}
function profileModal(first){let role=me().role;const paint=()=>{$('#mBody').innerHTML=`<div class="prof"><h2 class="neon" style="font-size:30px">Who's designing?</h2><p>Jimmi line creator's tool. Pick your role; you can change it later with ⚙.</p>
 <div class="row"><button class="chip${role==='owner'?' on':''}" data-r="owner">👑 Owner (Guy)</button><button class="chip${role==='designer'?' on':''}" data-r="designer">🎨 Designer</button></div>
 <label class="fld">Your name (shown as "designs by …")<input id="pName" maxlength="40" value="${esc(PROF?PROF.name:(role==='owner'?'Guy':''))}" placeholder="e.g. Janelle"></label>
 <p class="hint">No logins: this just labels your work. Guy approves before anything is published.</p></div>`;
 $('#mBody').querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{const n=$('#pName').value;role=b.dataset.r;paint();$('#pName').value=(role==='owner'&&!n)?'Guy':n;});};
 paint();$('#modal').hidden=false;$('#mClose').textContent='Save';$('#mClose').onclick=()=>{setProfile({role,name:$('#pName').value});$('#modal').hidden=true;$('#mClose').textContent='Got it';$('#mClose').onclick=()=>$('#modal').hidden=true;toast('Designing as '+me().name);};}
$('#bProf').onclick=()=>profileModal(false);
$('#rOpen').onclick=()=>$('#file').click();
$('#rLink').onclick=()=>{const u=prompt('Paste the design link (…/desk/?d=…):');if(!u)return;try{const q=new URL(u.trim()).searchParams.get('d');load(JSON.parse(b64u.dec(q)),'Opened design from link');}catch(_){toast('That link has a broken design');}};
/* ---- music (off by default on desktop) ---- */
const bgm=$('#bgm');let music=localStorage.getItem('jimmiDeskMusic')==='1';
function paintM(){$('#bMusic').textContent=music?'🔊':'🔇';$('#bMusic').title=music?'Mute music (M)':'Play soft music (M)';}
function play(){bgm.volume=0;bgm.play().then(()=>{const t0=performance.now();const st=t=>{const k=Math.min(1,(t-t0)/3000);bgm.volume=.22*k;if(k<1&&!bgm.paused)requestAnimationFrame(st);};requestAnimationFrame(st);}).catch(()=>{});}
function toggleM(){music=!music;localStorage.setItem('jimmiDeskMusic',music?'1':'0');paintM();music?play():bgm.pause();}
$('#bMusic').onclick=toggleM;paintM();if(music)addEventListener('pointerdown',function f(){removeEventListener('pointerdown',f);if(music&&bgm.paused)play();});
/* ---- tabs, modal, toast, help ---- */
document.body.dataset.tab='garment';$('#tabbar').onclick=e=>{const b=e.target.closest('[data-t]');if(!b)return;document.body.dataset.tab=b.dataset.t;[...$('#tabbar').children].forEach(x=>x.classList.toggle('on',x===b));};
function modal(h){$('#mBody').innerHTML=h;$('#modal').hidden=false;$('#mClose').focus();}$('#mClose').onclick=()=>$('#modal').hidden=true;
function showTab(t){document.body.dataset.tab=t;[...$('#tabbar').children].forEach(x=>x.classList.toggle('on',x.dataset.t===t));}
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('on'),2200);}
const HELP=`<h2 class="neon" style="font-size:30px">Shortcuts</h2><p><code>Ctrl+Z</code> undo · <code>Ctrl+Y</code>/<code>Ctrl+Shift+Z</code> redo<br><code>Ctrl+O</code> open · <code>Ctrl+S</code> send to JimmiBot · <code>Ctrl+Shift+C</code> copy link<br><code>Tab</code> switch logo/wordmark · <code>Arrows</code> nudge (Shift = 10px)<br><code>+</code>/<code>-</code> resize · <code>[</code>/<code>]</code> rotate wordmark · <code>F</code> front/back · <code>H</code> hide/show wordmark · <code>M</code> music</p><p class="hint">Brand rule: only the Buff Jimmi logo and the "Jimmi / at the gym" wordmark. No other text or graphics.</p>`;
$('#bHelp').onclick=()=>modal(HELP);$('#bUndo').onclick=doUndo;$('#bRedo').onclick=doRedo;
addEventListener('keydown',e=>{if(/INPUT|TEXTAREA/.test(e.target.tagName)&&e.target.type!=='range')return;const k=e.key,c=e.ctrlKey||e.metaKey;
 if(c&&k.toLowerCase()==='z'){e.preventDefault();e.shiftKey?doRedo():doUndo();return;}if(c&&k.toLowerCase()==='y'){e.preventDefault();doRedo();return;}
 if(c&&k.toLowerCase()==='o'){e.preventDefault();$('#file').click();return;}if(c&&k.toLowerCase()==='s'){e.preventDefault();$('#bSend').click();return;}
 if(c&&e.shiftKey&&k.toLowerCase()==='c'){e.preventDefault();$('#bLink').click();return;}if(c)return;
 if(tee()&&tKey(e))return;
 const o=el(),st=e.shiftKey?10:2;let hit=1;
 if(k==='ArrowLeft')o.x-=st;else if(k==='ArrowRight')o.x+=st;else if(k==='ArrowUp')o.y-=st;else if(k==='ArrowDown')o.y+=st;
 else if(k==='+'||k==='=')o.scale=Math.min(2,o.scale*1.05);else if(k==='-')o.scale=Math.max(.2,o.scale/1.05);
 else if(k===']'){D.wordmark.rotation=(D.wordmark.rotation||0)+5;sel='word';}else if(k==='['){D.wordmark.rotation=(D.wordmark.rotation||0)-5;sel='word';}
 else if(k==='Tab'){sel=sel==='logo'?'word':'logo';}else if(k==='f'||k==='F'){D.view=D.view==='front'?'back':'front';}
 else if(k==='h'||k==='H'){D.wordmark.hidden=!D.wordmark.hidden;if(D.wordmark.hidden)D.wordmark.placement='none';}else if(k==='m'||k==='M'){toggleM();return;}else if(k==='?'){modal(HELP);return;}else if(k==='Escape'){$('#modal').hidden=true;return;}else hit=0;
 if(hit){e.preventDefault();if(k.startsWith('Arrow'))o.placement='custom';commit();ui();}});

/* ---- Set mode: top + bottom stacked as one outfit ---- */
const TOPS={tee:'Tee',crop:"Crop / women's tee",longsleeve:'Long Sleeve',hoodie:'Hoodie',zip:'Zip Jacket'},BOTS={leggings:'Leggings',joggers:'Joggers',shorts:'Gym Shorts',pants:'Track Pants'};
let SET=null;
const pieceKey=d=>d.cut||d.garment;
function mkPiece(k,base){const g=k==='crop'?'tee':k==='pants'?'joggers':k;const d=R.makeEditor(g,{designer:me(),author:me().name,base:base||undefined});if(k==='joggers')d.name='New Jimmi joggers';if(k==='crop'||k==='pants'){d.cut=k;d.name='New Jimmi '+(k==='crop'?'crop tee':'track pants');}return d;}
function firstZone(d){return d.garment==='shorts'?'shLeftLeg':R.isLegs(d)?'leftLeg':'front';}
function setActive(w){if(!SET)return;SET[SET.active]=D;SET.active=w;D=SET[w];last=snap();undo=[];redo=[];zone=firstZone(D);sid=null;}
function enterSet(top,bot,active){SET={top,bottom:bot,active:'top',target:'top'};D=top;last=snap();undo=[];redo=[];zone=firstZone(D);sid=null;if(active==='bottom')setActive('bottom');SET.target=SET.active;document.body.classList.add('setmode');paintSetBar();ui();showTab('colors');toast('👯 Set mode: tap Top, Bottom or Both, then design');}
function exitSet(){if(!SET)return;SET[SET.active]=D;SET=null;document.body.classList.remove('setmode');ui();}
function paintSetBar(){if(!SET)return;const t=pieceKey(SET.active==='top'?D:SET.top),b=pieceKey(SET.active==='bottom'?D:SET.bottom);
 $('#setTop').innerHTML=Object.entries(TOPS).map(([k,n])=>`<option value="${k}"${k===t?' selected':''}>${n}</option>`).join('');
 $('#setBot').innerHTML=Object.entries(BOTS).map(([k,n])=>`<option value="${k}"${k===b?' selected':''}>${n}</option>`).join('');
 [...$('#setTgt').children].forEach(x=>x.classList.toggle('on',x.dataset.t===SET.target));}
const other=()=>SET.active==='top'?SET.bottom:SET.top;
function mirror(prev){const O=other();if(!O||!prev)return;const pc=prev.colors||{},dc=D.colors||{};
 if(pc.base!==dc.base)O.colors.base=dc.base;if(pc.stripe!==dc.stripe)O.colors.stripe=dc.stripe;if(pc.stripeWidth!==dc.stripeWidth)O.colors.stripeWidth=dc.stripeWidth;
 const all=d=>Object.entries(d.zones||{}).flatMap(([z,a])=>(a||[]).map(s=>[z,s]));const P=new Map(all(prev).map(([z,s])=>[s.id,s])),N=new Map(all(D).map(([z,s])=>[s.id,[z,s]]));
 const twin=id=>{for(const [z,s] of all(O))if(s.mirrorOf===id||s.id===(N.get(id)||[])[1]?.mirrorOf)return [z,s];return null;};
 for(const [id,[z,s]] of N){const p=P.get(id);if(!p){const oz=O.zones[z]!==undefined?z:firstZone(O);const Z=R.ZONES[oz];const c=JSON.parse(JSON.stringify(s));c.id='s'+Math.random().toString(36).slice(2,8);c.mirrorOf=s.id;if(!O.zones[z]&&Z&&Z.rect){const [rx,ry,rw,rh]=Z.rect;c.x=rx+rw/2;c.y=ry+rh/2;}(O.zones[oz]=O.zones[oz]||[]).push(c);}
  else if(JSON.stringify(p.colors)!==JSON.stringify(s.colors)||p.scale!==s.scale||p.rotation!==s.rotation){const t=twin(id);if(t){t[1].colors={...s.colors};t[1].scale=s.scale;t[1].rotation=s.rotation;}}}
 for(const [id] of P)if(!N.has(id)){const t=twin(id);if(t)O.zones[t[0]]=O.zones[t[0]].filter(x=>x!==t[1]);}
 O.updated=new Date().toISOString();}
const _commit=commit;commit=function(){let prev=null;if(SET&&SET.target==='both'){try{prev=JSON.parse(last);}catch(_){}}_commit();if(prev)mirror(prev);};
function bbox(c){const w=c.width,h=c.height,px=c.getContext('2d').getImageData(0,0,w,h).data;const fg=(x,y)=>{const t=y/h,i=(y*w+x)*4;const r=29+(11-29)*t,g=18+(6-18)*t,b=56+(24-56)*t;return Math.abs(px[i]-r)+Math.abs(px[i+1]-g)+Math.abs(px[i+2]-b)>40;};
 const bgm=new Uint8Array(w*h),q=[];const seed=(x,y)=>{const k=y*w+x;if(!bgm[k]&&!fg(x,y)){bgm[k]=1;q.push(k);}};for(let x=0;x<w;x++){seed(x,0);seed(x,h-1);}for(let y=0;y<h;y++){seed(0,y);seed(w-1,y);}while(q.length){const k=q.pop(),x=k%w,y=(k-x)/w;if(x>0)seed(x-1,y);if(x<w-1)seed(x+1,y);if(y>0)seed(x,y-1);if(y<h-1)seed(x,y+1);}
 const im=c.getContext('2d').getImageData(0,0,w,h);for(let k=0;k<w*h;k++)if(bgm[k])im.data[k*4+3]=0;c.getContext('2d').putImageData(im,0,0);const fg0=fg;
 let x0=w,x1=0,y0=h,y1=0;for(let y=0;y<h;y+=2)for(let x=0;x<w;x+=2)if(!bgm[y*w+x]){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
 const row=y=>{let a=-1,b=-1;for(let x=0;x<w;x++)if(!bgm[y*w+x]){if(a<0)a=x;b=x;}return a<0?[x0,x1]:[a,b];};return {x0,x1,y0,y1,row};}
let OUT={split:550};
function drawOutfit(){if(!SET)return;const T=SET.active==='top'?D:SET.top,B=SET.active==='bottom'?D:SET.bottom,view=D.view==='back'?'back':'front';
 const tv=d=>{const c=document.createElement('canvas');c.width=600;c.height=800;R.drawTee(c.getContext('2d'),d,{view,label:false,guides:false});return c;},tc=tv(T),bc=tv(B),tb=bbox(tc),bb=bbox(bc);let ty1=tb.y1;if(T.cut==='crop')ty1=Math.round(tb.y0+(tb.y1-tb.y0)*.78);
 const hem=tb.row(Math.max(tb.y0,ty1-8)),waist=bb.row(Math.min(bb.y1,bb.y0+8));const s=(hem[1]-hem[0])/Math.max(1,waist[1]-waist[0]);
 const th=ty1-tb.y0,bh=(bb.y1-bb.y0)*s,ov=6,tw=tb.x1-tb.x0,bw=(bb.x1-bb.x0)*s,hc=(hem[0]+hem[1])/2,wc=(waist[0]+waist[1])/2;
 const W=600,H=1100,tot=th+bh-ov,f=Math.min((W-40)/Math.max(tw,bw),(H-40)/tot),oy=(H-tot*f)/2,cx=W/2;
 const o=$('#outfit'),x=o.getContext('2d');x.setTransform(1,0,0,1,0,0);const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1d1238');g.addColorStop(1,'#0b0618');x.fillStyle=g;x.fillRect(0,0,W,H);
 const bY=oy+(th-ov)*f;x.drawImage(bc,bb.x0,bb.y0,bb.x1-bb.x0,bb.y1-bb.y0,cx-(wc-bb.x0)*s*f,bY,(bb.x1-bb.x0)*s*f,bh*f);
 x.drawImage(tc,tb.x0,tb.y0,tw,th,cx-(hc-tb.x0)*f,oy,tw*f,th*f);OUT.split=bY;
 const lab=(t,y,on)=>{x.font='bold 22px system-ui';x.fillStyle=on?'#b06cff':'#ffffff88';x.fillText(t,14,y);};lab((SET.target==='both'?'◆ ':SET.active==='top'?'▶ ':'')+'TOP · '+TOPS[pieceKey(T)],30,SET.active==='top'||SET.target==='both');lab((SET.target==='both'?'◆ ':SET.active==='bottom'?'▶ ':'')+'BOTTOM · '+BOTS[pieceKey(B)],H-16,SET.active==='bottom'||SET.target==='both');}
const _ui=ui;ui=function(){_ui.apply(this,arguments);if(SET){paintSetBar();drawOutfit();}};
const _draw=draw;draw=function(){_draw.apply(this,arguments);if(SET)drawOutfit();};
function saveSet(){SET[SET.active]=D;const act=SET.active;D=SET.top;last=snap();saveDesign();SET.top=D;D=SET.bottom;last=snap();saveDesign();SET.bottom=D;pairWith(SET.top.saveId);
 const L=getSaved();for(const k of ['top','bottom']){const x=L.find(y=>y.id===SET[k].saveId);if(x)SET[k].pair=x.design.pair;}D=SET[act];last=snap();ui();toast('👯 Set saved — both pieces are in 📂 Your designs, paired as a set');}
function openSet(x){if(!x||!x.design.pair)return;const y=getSaved().find(z=>z.id===x.design.pair.id);if(!y){toast('Its pair is missing');return;}const a=JSON.parse(JSON.stringify(x.design)),b=JSON.parse(JSON.stringify(y.design));
 const isTop=d=>!R.isLegs(d)&&d.garment!=='bottle';const top=isTop(a)?a:b,bot=isTop(a)?b:a;if(!isTop(top)||isTop(bot)){toast('Open as set needs one top and one bottom');return;}
 for(const d of [top,bot]){d.colors.stripeWidth=d.colors.stripeWidth||7;d.view=d.view||'front';}enterSet(R.upgrade(top),R.upgrade(bot),'top');toast('👯 Opened '+top.name+' + '+bot.name+' as a set');}
const startSet=()=>{if(SET)return exitSet();const base=D.colors&&D.colors.base;const cur=pieceKey(D);let top,bot;
 if(TOPS[cur]&&tee()){top=JSON.parse(JSON.stringify(D));delete top.saveId;delete top.pair;bot=mkPiece('joggers',base);}else if(BOTS[cur]){bot=JSON.parse(JSON.stringify(D));delete bot.saveId;delete bot.pair;top=mkPiece('tee',base);}else{top=mkPiece('tee');bot=mkPiece('joggers');}
 enterSet(top,bot,'top');};
$('#bSet').onclick=startSet;$('#setBtn').onclick=startSet;$('#setExit').onclick=exitSet;
$('#setTgt').onclick=e=>{const b=e.target.closest('[data-t]');if(!b||!SET)return;const t=b.dataset.t;SET.target=t;if(t!=='both'&&t!==SET.active)setActive(t);ui();};
$('#setTop').onchange=e=>{SET[SET.active]=D;const n=mkPiece(e.target.value,SET.top.colors.base);SET.top=n;if(SET.active==='top'){D=n;last=snap();zone=firstZone(D);sid=null;}ui();};
$('#setBot').onchange=e=>{SET[SET.active]=D;const n=mkPiece(e.target.value,SET.bottom.colors.base);SET.bottom=n;if(SET.active==='bottom'){D=n;last=snap();zone=firstZone(D);sid=null;}ui();};
$('#outfit').onclick=e=>{if(!SET)return;const r=e.target.getBoundingClientRect(),y=(e.clientY-r.top)*1100/r.height,w=y<OUT.split?'top':'bottom';if(SET.target!=='both'){SET.target=w;}if(w!==SET.active)setActive(w);ui();};
window.__jimmiSet={get:()=>SET&&{...SET,[SET.active]:D},start:startSet,save:()=>saveSet(),exit:exitSet};

/* ---- 🪞 Mirror: paired left/right zones ---- */
const MP={leftSleeve:'rightSleeve',leftArm:'rightArm',leftWrist:'rightWrist',leftForearm:'rightForearm',leftLeg:'rightLeg',shLeftLeg:'shRightLeg'};Object.entries(MP).forEach(([a,b])=>MP[b]=a);
const hasPairs=()=>tee()&&R.zk(D).some(z=>MP[z]&&R.zk(D).includes(MP[z]));
function mirSync(prev){const zs=d=>{const m=new Map();for(const [z,a] of Object.entries(d.zones||{}))(a||[]).forEach(s=>m.set(s.id,[z,s]));return m;};const P=zs(prev),N=zs(D);
 const mk=(s,t)=>{const c=JSON.parse(JSON.stringify(s));c.id=t?t.id:'s'+Math.random().toString(36).slice(2,8);c.mir=s.id;c.x=600-s.x;c.rotation=-(s.rotation||0);if(s.curve)c.curve=s.curve;return c;};
 const same=(a,b)=>{const x={...a},y={...b};delete x.mir;delete y.mir;return JSON.stringify(x)===JSON.stringify(y);};
 for(const [id,[z,s]] of N){const oz=MP[z];if(!oz||!D.zones[oz])continue;const p=P.get(id);if(p&&p[0]===z&&same(p[1],s)&&s.mir&&N.has(s.mir))continue;
  if(p&&s.mir&&!N.has(s.mir)&&P.has(s.mir))continue;/* twin was just deleted by user: handled below */
  const arr=D.zones[oz],i=arr.findIndex(q=>q.id===s.mir);const t=i>=0?arr[i]:null;if(t&&p&&same(p[1],s))continue;const c=mk(s,t);if(t)arr[i]=c;else{arr.push(c);s.mir=c.id;}}
 for(const [id,[z,s]] of P)if(!N.has(id)&&s.mir&&MP[z]){const oz=MP[z];if(D.zones[oz])D.zones[oz]=D.zones[oz].filter(q=>q.id!==s.mir);}
 for(const [id,[z,s]] of zs(D))if(s.mir&&!zs(D).has(s.mir))delete s.mir;}
const _commitM=commit;commit=function(){let prev=null;if(D.mirror&&hasPairs()){try{prev=JSON.parse(last);}catch(_){}}_commitM();if(prev){mirSync(prev);last=snap();}};
function paintMir(){const b=$('#mirBtn');b.hidden=!hasPairs();b.classList.toggle('on',!!D.mirror);b.innerHTML='🪞 Mirror: <b>'+(D.mirror?'On':'Off')+'</b>';}
$('#mirBtn').onclick=()=>{if(D.mirror){delete D.mirror;for(const a of Object.values(D.zones||{}))(a||[]).forEach(s=>delete s.mir);toast('🪞 Mirror off — both sides are now independent');}else{D.mirror=true;toast('🪞 Mirror on — changes copy to the opposite side');}commit();ui();};
const _uiM=ui;ui=function(){_uiM.apply(this,arguments);paintMir();};
/* ---- boot ---- */
R.ready(()=>{paintInbox();paintSaved();if(!PROF)setTimeout(()=>profileModal(true),50);const q=new URLSearchParams(location.search).get('d')||new URLSearchParams(location.hash.slice(1)).get('d');
 if(q){try{load(JSON.parse(b64u.dec(q)),'Opened design from link');undo=[];}catch(_){toast('That link has a broken design');}}
 ui();window.__jimmiReady=true;});
})();

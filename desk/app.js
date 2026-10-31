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
 undo.push(last);redo=[];D=d;last=snap();if(tee()){zone=D.garment==='leggings'?(D.view==='back'?'waistbandBack':'waistband'):(D.view==='back'?'back':'front');sid=null;}
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
/* ---- UI ---- */
function ui(){const g=G[D.garment];document.body.classList.toggle('tee',tee());paintTee();paintReview();paintRole();
 chips('#g',Object.keys(G),D.garment,k=>G[k].n);chips('#view',['front','back'],D.view,v=>v==='front'?'Front':'Back');
 swatches('#base',R.BASES,D.colors.base);swatches('#logoc',R.INKS,D.colors.logo);swatches('#hairc',R.INKS,D.colors.hair);
 swatches('#st',R.INKS.slice(0,8),D.colors.stripe,`<button class="chip${D.colors.stripe?'':' on'}" data-v="none">None</button>`);
 chips('#lp',g.lp,D.logo.placement);chips('#wp',g.wp,D.wordmark.hidden?'none':D.wordmark.placement);chips('#selRow',['logo','word'],sel,v=>v==='logo'?'Buff Jimmi logo':'Wordmark');
 $('#selName').textContent=sel==='logo'?'Logo':'Wordmark';
 $('#ls').value=D.logo.scale;$('#ws').value=D.wordmark.scale;$('#wr').value=D.wordmark.rotation||0;$('#sw').value=D.colors.stripeWidth||7;
 if(document.activeElement!==$('#nm'))$('#nm').value=D.name;if(document.activeElement!==$('#nt'))$('#nt').value=D.notes;
 $('#bUndo').disabled=!undo.length;$('#bRedo').disabled=!redo.length;draw();}
function draw(){if(tee())return drawT();R.draw(ctx,D,{sel});$('#cap').textContent='Dashed line = print area · '+G[D.garment].area+' · preview is approximate';
 $('#spec').textContent=`${G[D.garment].n} · base ${R.hexName(D.colors.base)}\nlogo ${R.hexName(D.colors.logo)} / hair ${R.hexName(D.colors.hair)} @ ${D.logo.side} ${Math.round(D.logo.x)},${Math.round(D.logo.y)} ×${(+D.logo.scale).toFixed(2)}\nwordmark ${D.wordmark.hidden?'none':`${D.wordmark.side} ${Math.round(D.wordmark.x)},${Math.round(D.wordmark.y)} ×${(+D.wordmark.scale).toFixed(2)} ${Math.round(D.wordmark.rotation)}°`}\nstripe ${D.colors.stripe?R.hexName(D.colors.stripe)+' '+D.colors.stripeWidth+'px':'none'}`;}
const on=(id,fn)=>$(id).addEventListener('click',e=>{const b=e.target.closest('[data-v]');if(b){fn(b.dataset.v);commit();ui();}});
on('#g',v=>{const n=R.make({designer:D.designer,garment:v,base:D.colors.base,logo:D.colors.logo,hair:D.colors.hair,stripe:D.colors.stripe,name:D.name,notes:D.notes,author:D.author});n.colors.stripeWidth=D.colors.stripeWidth;n.created=D.created;D=n;});
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
window.__jimmi={repeat:(m,c,g)=>doRepeat(m,c,g),newLeggings:()=>$('#legBtn').click(),select:(z,id)=>{zone=z;sid=id;ui();},openLib:()=>openLib(),get:()=>D,load,bundle,shareLink,undo:doUndo,redo:doRedo,state:()=>({zone,sid}),selectZone:z=>{zone=z;sid=null;ui();},addSticker:(el,c)=>addSticker(el,c),flip:()=>flip(),commit:()=>{commit();ui();},submit:()=>submit(),approve:()=>approve(),reject:n=>reject(n),setProfile:p=>setProfile(p),lastSent:()=>window.__lastSent};
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
 $('#cap').textContent=`${D.garment==='leggings'?'Leggings · ':''}Selected zone: ${Z.n} (${Z.inch[0]}″ × ${Z.inch[1]}″ print) · tap another zone to switch · preview is approximate`;
 const cnt=R.zk(D).map(k=>`${R.ZONES[k].n}: ${(D.zones[k]||[]).length}`).join(' · ');const s=cur();
 $('#spec2').textContent=`${D.garment==='leggings'?'Leggings':'Tee'} · base ${R.hexName(D.colors.base)}\n${cnt}${s?`\nselected: ${R.EL[s.el].n} @ ${Math.round(s.x)},${Math.round(s.y)} ×${s.scale.toFixed(2)} ${Math.round(s.rotation)}°`:''}${D.designer&&D.designer.name?'\ndesigns by '+D.designer.name:''}`;
 $('#spec').textContent=$('#spec2').textContent;}
function paintTee(){if(!tee())return;const s=cur();
 paintRep();chips('#zones',R.zk(D),zone,k=>R.ZONES[k].n);$('#flipLab').textContent=D.view==='back'?'Back':'Front';
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
 td={kind:h.kind,cx:b.x,cy:b.y,dx:x-b.x,dy:y-b.y,s0:s.scale,d0:Math.max(8,Math.hypot(x-b.x,y-b.y))};ui();}
function tMove(e){const s=cur();if(!s)return;const m=mirrored()?-1:1;
 if(tp&&pts.size===2){const p=[...pts.values()];s.scale=clampS(tp.s*Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1])/tp.d);let a=tp.r+m*(Math.atan2(p[1][1]-p[0][1],p[1][0]-p[0][0])-tp.a)*180/Math.PI;s.rotation=normA(e.shiftKey?snap45(a):a);draw();return;}
 if(!td)return;const [x,y]=pts.get(e.pointerId);
 if(td.kind==='sticker'){s.x=R.fromScreen(zone,D.view,x-td.dx);s.y=y-td.dy;clampPos(s);}
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
 try{await T(0,90);}catch(_){}D.view=D.view==='back'?'front':'back';if(D.garment==='leggings'){if(R.ZONES[zone].view!==D.view){zone=D.view==='back'?'waistbandBack':'waistband';sid=null;}}else if(!R.ZONES[zone].sleeve){zone=D.view;sid=null;}commit();ui();try{await T(-90,0);}catch(_){}flipping=false;}
$('#flip').onclick=flip;
/* ---- repeat / pattern ---- */
let repMode='row';
function paintRep(){const L=D.garment==='leggings',modes=L?['wrap','row','column']:['row','column'];if(!modes.includes(repMode))repMode=L?'wrap':'row';
 chips('#repMode',modes,repMode,v=>({wrap:'Around waistband',row:'Row across',column:'Column down'})[v]);const s=cur();
 $('#repGo').disabled=!s;$('#repUn').disabled=$('#repDel').disabled=!(s&&s.group);
 $('#repHint').textContent=s&&s.group?`Part of a repeat group (${R.zk(D).reduce((n,z)=>n+(D.zones[z]||[]).filter(q=>q.group===s.group).length,0)} copies). Change count/spacing and tap Repeat to re-tile.`:'Pick a sticker, then repeat it. Copies tile evenly and stay linked as a group, so repeating again re-tiles them.';}
on('#repMode',v=>repMode=v);
$('#repN').oninput=e=>$('#repNV').textContent=e.target.value;$('#repG').oninput=e=>$('#repGV').textContent=e.target.value;
function doRepeat(mode,count,gap){repMode=mode;const s=cur();if(!s){toast('Tap a sticker first');return 0;}const out=R.repeat(D,zone,s,{mode,count,gap});sid=out[0].id;zone=R.zk(D).find(z=>(D.zones[z]||[]).includes(out[0]));commit();ui();toast(mode==='wrap'?`Wrapped ${out.length} around the waistband`:`Repeated ×${out.length}`);return out.length;}
$('#repGo').onclick=()=>doRepeat(repMode,+$('#repN').value,+$('#repG').value);
$('#repUn').onclick=()=>{const s=cur();if(s&&s.group){R.ungroup(D,s.group);commit();ui();toast('Ungrouped: each copy moves on its own now');}};
$('#repDel').onclick=()=>{const s=cur();if(!s||!s.group)return;const g=s.group;R.zk(D).forEach(z=>D.zones[z]=(D.zones[z]||[]).filter(q=>q.group!==g));sid=null;commit();ui();};
$('#legBtn').onclick=()=>{const n=R.makeLeggings({designer:me(),author:me().name});n.notes=D.notes||'';load(n,'Leggings Editor: tap the waistband or a leg');zone='leftLeg';sid='s-leg1';ui();showTab('place');};
$('#teeBtn').onclick=()=>{const n=R.makeTee({designer:me(),author:me().name});n.notes=D.notes||'';load(n,'Tee Editor: black tee ready');zone='front';sid='s-front1';ui();showTab('place');};
/* sticker page */
function openLib(){const g=$('#libGrid');if(!g.dataset.done){let h='';for(const el of ['head','skinny','leg',...Object.keys(R.EL).filter(k=>!['head','skinny','leg'].includes(k))]){h+=`<h5>${R.EL[el].n}${['head','skinny','leg'].includes(el)?' <i class="new">NEW</i>':''}</h5>`;R.PRESETS.forEach(([b,hr],i)=>{h+=`<button data-el="${el}" data-b="${C[b]}" data-h="${C[hr]}" title="${R.EL[el].n} · ${b}${b!==hr?' / '+hr+' hair':''}" aria-label="${R.EL[el].n} ${b}"><canvas width="120" height="120"></canvas></button>`;});}
  g.innerHTML=h;g.dataset.done=1;g.querySelectorAll('button').forEach(b=>{const c=b.firstChild.getContext('2d'),s={el:b.dataset.el,colors:{body:b.dataset.b,hair:b.dataset.h},x:60,y:60,scale:1,rotation:0},[w,hh]=R.dims(s);s.scale=Math.min(100/w,100/hh);R.drawEl(c,s,0);});}
 $('#libZone').textContent=R.ZONES[zone].n.toLowerCase();$('#lib').hidden=false;}
$('#stkBtn').onclick=openLib;$('#stkBtn2').onclick=openLib;$('#libClose').onclick=()=>$('#lib').hidden=true;
$('#libGrid').onclick=e=>{const b=e.target.closest('[data-el]');if(!b)return;addSticker(b.dataset.el,{body:b.dataset.b,hair:b.dataset.h});$('#lib').hidden=true;toast('Stuck on '+R.ZONES[zone].n.toLowerCase());};
/* ---- profile + designer credit + review (file/link based; no accounts) ---- */
function paintRole(){const m=me();$('#whoName').textContent=`${m.name} · ${m.role==='owner'?'Owner':'Designer'}`;
 $('#bSend').innerHTML=m.role==='owner'?'🚀<span> Send to JimmiBot</span>':'📨<span> Submit to Guy</span>';$('#bSend').title=m.role==='owner'?'Send to JimmiBot (Ctrl+S)':'Submit to Guy for review (Ctrl+S)';
 $('#subsSign').textContent=m.role==='owner'?'Submissions':'My Submissions';$('#tabInbox').textContent=m.role==='owner'?'Review':'Inbox';}
let rvKey='';
function paintReview(){const m=me(),d=D,k=[m.role,d.status,(d.history||[]).length,d.reviewNotes,(d.designer||{}).name,d.name].join('|');if(k===rvKey)return;rvKey=k;
 const who=d.designer&&d.designer.name?`<b class="credit">designs by ${esc(d.designer.name)}</b>`:'<i>no credit</i>';
 let h=`<div class="rv"><div>${esc(d.name)}</div><div>${who} <span class="pill ${d.status}">${d.status}</span></div>`;
 if(d.reviewNotes)h+=`<p><b>Guy's notes:</b> ${esc(d.reviewNotes)}</p>`;
 if(m.role==='owner'&&d.status==='submitted')h+=`<textarea id="rvNotes" rows="3" placeholder="Review notes (required to reject)"></textarea><div class="acts"><button class="ok" id="rvOk">✔ Approve</button><button class="no" id="rvNo">✖ Reject</button></div>`;
 else if(m.role==='owner')h+=`<p class="hint">Open a designer's submitted file or link to review it here.</p>`;
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
/* ---- boot ---- */
R.ready(()=>{paintInbox();if(!PROF)setTimeout(()=>profileModal(true),50);const q=new URLSearchParams(location.search).get('d')||new URLSearchParams(location.hash.slice(1)).get('d');
 if(q){try{load(JSON.parse(b64u.dec(q)),'Opened design from link');undo=[];}catch(_){toast('That link has a broken design');}}
 ui();window.__jimmiReady=true;});
})();

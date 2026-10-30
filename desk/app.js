(()=>{
const R=window.JimmiRender,{C,G}=R,$=s=>document.querySelector(s);
const cv=$('#cv'),ctx=cv.getContext('2d');ctx.scale(2,2);
let D=R.make({garment:'leggings',lp:'calf',wp:'down the leg',name:'New Jimmi leggings'}),sel='logo',undo=[],redo=[];
const snap=()=>JSON.stringify(D);let last=snap();
function commit(){const s=snap();if(s===last)return;undo.push(last);if(undo.length>200)undo.shift();redo=[];last=s;D.updated=new Date().toISOString();}
function load(d,msg){const e=R.validate(d);if(e.length){toast('Could not open: '+e[0]);return false;}
 d=JSON.parse(JSON.stringify(d));d.colors.stripeWidth=d.colors.stripeWidth||7;d.view=d.view||'front';d.logo.side=d.logo.side||'front';d.wordmark.side=d.wordmark.side||'front';
 undo.push(last);redo=[];D=d;last=snap();ui();if(msg)toast(msg);return true;}
function doUndo(){if(!undo.length)return;redo.push(snap());D=JSON.parse(undo.pop());last=snap();ui();}
function doRedo(){if(!redo.length)return;undo.push(snap());D=JSON.parse(redo.pop());last=snap();ui();}
/* ---- palettes ---- */
const swatches=(id,names,val,extra='')=>{$(id).innerHTML=extra+names.map(n=>`<button class="sw${(val||'').toLowerCase()===C[n].toLowerCase()?' on':''}" data-v="${C[n]}" title="${n}" aria-label="${n}" style="background:${C[n]}"></button>`).join('')+`<label class="sw custom" title="Custom color"><input type="color" value="${val||'#ffffff'}" aria-label="Custom color"></label>`;};
const chips=(id,arr,val,lab=v=>v)=>{$(id).innerHTML=arr.map(v=>`<button class="chip${val===v?' on':''}" data-v="${v}">${lab(v)}</button>`).join('');};
const STARTERS=[['Navy & Yellow · logo on the calf',{garment:'leggings',base:C.Navy,logo:C.Yellow,lp:'calf',wp:'down the leg'}],['Black & Red · stripe down the side',{garment:'leggings',base:C.Black,logo:C.Red,lp:'hip',wp:'down the leg',stripe:C.Red,stripeWidth:3}],['Teal & Coral · logo on the thigh',{garment:'leggings',base:C.Teal,logo:C.Coral,lp:'thigh',wp:'down the leg'}],['Cobalt & Orange · stripe',{garment:'leggings',base:C.Cobalt,logo:C.Orange,lp:'calf',wp:'under the logo',stripe:C.Orange}],['Red & Black tee',{garment:'tee',base:C.Red,logo:C.Black,lp:'chest',wp:'under the logo'}],['Blue & Yellow hoodie',{garment:'hoodie',base:C.Cobalt,logo:C.Yellow,lp:'chest',wp:'under the logo'}],['Purple & Gold long sleeve',{garment:'longsleeve',base:C.Purple,logo:C.Gold,lp:'chest',wp:'down the sleeve'}],['Black & Neon zip',{garment:'zip',base:C.Black,logo:C.Neon,hair:C.Pink,lp:'left chest',wp:'down the sleeve',stripe:C.Pink}],['Navy & Gold joggers',{garment:'joggers',base:C.Navy,logo:C.Gold,lp:'thigh',wp:'down the leg',stripe:C.Gold}]];
$('#starters').innerHTML=STARTERS.map((s,i)=>`<button class="starter" data-i="${i}" style="--a:${s[1].base};--b:${s[1].logo}">${s[0]}</button>`).join('');
$('#starters').onclick=e=>{const b=e.target.closest('.starter');if(!b)return;const s=STARTERS[b.dataset.i];const n=R.make({...s[1],name:s[0],notes:D.notes,author:'Guy'});n.colors.stripeWidth=s[1].stripeWidth||7;load(n);};
$('#surprise').onclick=()=>{const p=a=>a[Math.floor(Math.random()*a.length)];const s=p(STARTERS)[1],gs=Object.keys(G),g=p(gs);const n=R.make({...s,garment:g,lp:p(G[g].lp.filter(x=>x!=='back')),wp:p(G[g].wp.filter(x=>x!=='none')),stripe:Math.random()<.4?s.logo:null,name:'Surprise '+G[g].n});load(n);};
/* ---- inbox ---- */
let INBOX=window.JIMMI_INBOX||[];
function paintInbox(){$('#inbox').innerHTML=INBOX.map((x,i)=>`<button data-i="${i}" style="--a:${x.base};--b:${x.accent}"><i></i><span><b>${x.name}</b><small>${x.notes}</small></span></button>`).join('')||'<p class="hint">Inbox is empty.</p>';}
$('#inbox').onclick=async e=>{const b=e.target.closest('[data-i]');if(!b)return;const x=INBOX[b.dataset.i];let d=x.design;
 if(location.protocol.startsWith('http')){try{d=await (await fetch('inbox/'+x.file,{cache:'no-store'})).json();}catch(_){}}load(d,'Loaded '+x.name+' from JimmiBot');};
if(location.protocol.startsWith('http'))fetch('inbox/index.json',{cache:'no-store'}).then(r=>r.json()).then(j=>{INBOX=j.designs.map(x=>({...x,design:(INBOX.find(y=>y.file===x.file)||{}).design}));paintInbox();}).catch(()=>{});
/* ---- UI ---- */
function ui(){const g=G[D.garment];
 chips('#g',Object.keys(G),D.garment,k=>G[k].n);chips('#view',['front','back'],D.view,v=>v==='front'?'Front':'Back');
 swatches('#base',R.BASES,D.colors.base);swatches('#logoc',R.INKS,D.colors.logo);swatches('#hairc',R.INKS,D.colors.hair);
 swatches('#st',R.INKS.slice(0,8),D.colors.stripe,`<button class="chip${D.colors.stripe?'':' on'}" data-v="none">None</button>`);
 chips('#lp',g.lp,D.logo.placement);chips('#wp',g.wp,D.wordmark.hidden?'none':D.wordmark.placement);chips('#selRow',['logo','word'],sel,v=>v==='logo'?'Buff Jimmi logo':'Wordmark');
 $('#selName').textContent=sel==='logo'?'Logo':'Wordmark';
 $('#ls').value=D.logo.scale;$('#ws').value=D.wordmark.scale;$('#wr').value=D.wordmark.rotation||0;$('#sw').value=D.colors.stripeWidth||7;
 if(document.activeElement!==$('#nm'))$('#nm').value=D.name;if(document.activeElement!==$('#nt'))$('#nt').value=D.notes;
 $('#bUndo').disabled=!undo.length;$('#bRedo').disabled=!redo.length;draw();}
function draw(){R.draw(ctx,D,{sel});$('#cap').textContent='Dashed line = print area · '+G[D.garment].area+' · preview is approximate';
 $('#spec').textContent=`${G[D.garment].n} · base ${R.hexName(D.colors.base)}\nlogo ${R.hexName(D.colors.logo)} / hair ${R.hexName(D.colors.hair)} @ ${D.logo.side} ${Math.round(D.logo.x)},${Math.round(D.logo.y)} ×${(+D.logo.scale).toFixed(2)}\nwordmark ${D.wordmark.hidden?'none':`${D.wordmark.side} ${Math.round(D.wordmark.x)},${Math.round(D.wordmark.y)} ×${(+D.wordmark.scale).toFixed(2)} ${Math.round(D.wordmark.rotation)}°`}\nstripe ${D.colors.stripe?R.hexName(D.colors.stripe)+' '+D.colors.stripeWidth+'px':'none'}`;}
const on=(id,fn)=>$(id).addEventListener('click',e=>{const b=e.target.closest('[data-v]');if(b){fn(b.dataset.v);commit();ui();}});
on('#g',v=>{const n=R.make({garment:v,base:D.colors.base,logo:D.colors.logo,hair:D.colors.hair,stripe:D.colors.stripe,name:D.name,notes:D.notes,author:D.author});n.colors.stripeWidth=D.colors.stripeWidth;n.created=D.created;D=n;});
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
cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);pts.set(e.pointerId,toL(e));
 if(pts.size===1){const [x,y]=pts.get(e.pointerId);const h=R.hit(D,x,y,D.view);if(h){sel=h;const o=el();drag={dx:x-o.x,dy:y-o.y};ui();}else drag=null;}
 else if(pts.size===2){const [a,b]=[...pts.values()];pinch={d:Math.hypot(a[0]-b[0],a[1]-b[1]),s:el().scale};drag=null;}});
cv.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,toL(e));
 if(pinch&&pts.size===2){const [a,b]=[...pts.values()];el().scale=Math.max(.2,Math.min(2,pinch.s*Math.hypot(a[0]-b[0],a[1]-b[1])/pinch.d));draw();}
 else if(drag){const [x,y]=pts.get(e.pointerId);const o=el();o.x=Math.max(0,Math.min(600,x-drag.dx));o.y=Math.max(0,Math.min(800,y-drag.dy));o.placement='custom';o.side=D.view;draw();}});
const up=e=>{pts.delete(e.pointerId);if(pts.size<2)pinch=null;if(!pts.size){drag=null;commit();ui();}};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
cv.addEventListener('wheel',e=>{e.preventDefault();const o=el();o.scale=Math.max(.2,Math.min(2,o.scale*(e.deltaY<0?1.05:1/1.05)));draw();clearTimeout(cv._w);cv._w=setTimeout(()=>{commit();ui();},300);},{passive:false});
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
function sides(){return [...new Set([D.logo.side,D.wordmark.hidden?D.logo.side:D.wordmark.side,D.view])];}
function sheet(print){const vs=sides().sort();const cs=vs.map(v=>R.render(D,{print,view:v,px:2000}));if(cs.length===1)return cs[0];const c=document.createElement('canvas');c.width=cs[0].width*2;c.height=2000;const x=c.getContext('2d');cs.forEach((s,i)=>x.drawImage(s,i*s.width,0));return c;}
async function bundle(){D.updated=new Date().toISOString();const s=slug();
 return [new File([JSON.stringify(D,null,2)],s+'.jimmi.json',{type:'application/json'}),new File([await blob(sheet(false))],s+'-mockup.png',{type:'image/png'}),new File([await blob(sheet(true))],s+'-print.png',{type:'image/png'})];}
window.__jimmi={get:()=>D,load,bundle,shareLink,undo:doUndo,redo:doRedo};
const touch=matchMedia('(max-width:1000px), (pointer:coarse)').matches;
$('#bSend').onclick=async()=>{const fs=await bundle();
 if(touch&&navigator.canShare&&navigator.canShare({files:fs.slice(0,2)})){try{await navigator.share({files:fs.slice(0,2),title:"Jimmi's Design Shop: "+D.name,text:"Refurbish and publish to mall (or main site): "+D.name});toast('Shared!');return;}catch(e){if(e.name==='AbortError')return;}}
 fs.forEach((f,i)=>setTimeout(()=>{const a=document.createElement('a');a.href=URL.createObjectURL(f);a.download=f.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);},i*400));
 modal(`<h2 class="neon" style="font-size:30px">Sent to your Downloads</h2><p>Saved 3 files:</p><ul>${fs.map(f=>`<li><code>${f.name}</code></li>`).join('')}</ul><p><b>Drop these files in your JimmiBot chat and say "refurbish and publish to mall" or "main site".</b></p><p class="hint">The print PNG is a transparent 2000px print layer; the mockup PNG shows it on the garment.</p>`);};
/* ---- music (off by default on desktop) ---- */
const bgm=$('#bgm');let music=localStorage.getItem('jimmiDeskMusic')==='1';
function paintM(){$('#bMusic').textContent=music?'🔊':'🔇';$('#bMusic').title=music?'Mute music (M)':'Play soft music (M)';}
function play(){bgm.volume=0;bgm.play().then(()=>{const t0=performance.now();const st=t=>{const k=Math.min(1,(t-t0)/3000);bgm.volume=.22*k;if(k<1&&!bgm.paused)requestAnimationFrame(st);};requestAnimationFrame(st);}).catch(()=>{});}
function toggleM(){music=!music;localStorage.setItem('jimmiDeskMusic',music?'1':'0');paintM();music?play():bgm.pause();}
$('#bMusic').onclick=toggleM;paintM();if(music)addEventListener('pointerdown',function f(){removeEventListener('pointerdown',f);if(music&&bgm.paused)play();});
/* ---- tabs, modal, toast, help ---- */
document.body.dataset.tab='garment';$('#tabbar').onclick=e=>{const b=e.target.closest('[data-t]');if(!b)return;document.body.dataset.tab=b.dataset.t;[...$('#tabbar').children].forEach(x=>x.classList.toggle('on',x===b));};
function modal(h){$('#mBody').innerHTML=h;$('#modal').hidden=false;$('#mClose').focus();}$('#mClose').onclick=()=>$('#modal').hidden=true;
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('on'),2200);}
const HELP=`<h2 class="neon" style="font-size:30px">Shortcuts</h2><p><code>Ctrl+Z</code> undo · <code>Ctrl+Y</code>/<code>Ctrl+Shift+Z</code> redo<br><code>Ctrl+O</code> open · <code>Ctrl+S</code> send to JimmiBot · <code>Ctrl+Shift+C</code> copy link<br><code>Tab</code> switch logo/wordmark · <code>Arrows</code> nudge (Shift = 10px)<br><code>+</code>/<code>-</code> resize · <code>[</code>/<code>]</code> rotate wordmark · <code>F</code> front/back · <code>H</code> hide/show wordmark · <code>M</code> music</p><p class="hint">Brand rule: only the Buff Jimmi logo and the "Jimmi / at the gym" wordmark. No other text or graphics.</p>`;
$('#bHelp').onclick=()=>modal(HELP);$('#bUndo').onclick=doUndo;$('#bRedo').onclick=doRedo;
addEventListener('keydown',e=>{if(/INPUT|TEXTAREA/.test(e.target.tagName)&&e.target.type!=='range')return;const k=e.key,c=e.ctrlKey||e.metaKey;
 if(c&&k.toLowerCase()==='z'){e.preventDefault();e.shiftKey?doRedo():doUndo();return;}if(c&&k.toLowerCase()==='y'){e.preventDefault();doRedo();return;}
 if(c&&k.toLowerCase()==='o'){e.preventDefault();$('#file').click();return;}if(c&&k.toLowerCase()==='s'){e.preventDefault();$('#bSend').click();return;}
 if(c&&e.shiftKey&&k.toLowerCase()==='c'){e.preventDefault();$('#bLink').click();return;}if(c)return;
 const o=el(),st=e.shiftKey?10:2;let hit=1;
 if(k==='ArrowLeft')o.x-=st;else if(k==='ArrowRight')o.x+=st;else if(k==='ArrowUp')o.y-=st;else if(k==='ArrowDown')o.y+=st;
 else if(k==='+'||k==='=')o.scale=Math.min(2,o.scale*1.05);else if(k==='-')o.scale=Math.max(.2,o.scale/1.05);
 else if(k===']'){D.wordmark.rotation=(D.wordmark.rotation||0)+5;sel='word';}else if(k==='['){D.wordmark.rotation=(D.wordmark.rotation||0)-5;sel='word';}
 else if(k==='Tab'){sel=sel==='logo'?'word':'logo';}else if(k==='f'||k==='F'){D.view=D.view==='front'?'back':'front';}
 else if(k==='h'||k==='H'){D.wordmark.hidden=!D.wordmark.hidden;if(D.wordmark.hidden)D.wordmark.placement='none';}else if(k==='m'||k==='M'){toggleM();return;}else if(k==='?'){modal(HELP);return;}else if(k==='Escape'){$('#modal').hidden=true;return;}else hit=0;
 if(hit){e.preventDefault();if(k.startsWith('Arrow'))o.placement='custom';commit();ui();}});
/* ---- boot ---- */
R.ready(()=>{paintInbox();const q=new URLSearchParams(location.search).get('d')||new URLSearchParams(location.hash.slice(1)).get('d');
 if(q){try{load(JSON.parse(b64u.dec(q)),'Opened design from link');undo=[];}catch(_){toast('That link has a broken design');}}
 ui();window.__jimmiReady=true;});
})();

(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
/* ---------- music ---------- */
const bgm=$('#bgm'),muteBtn=$('#mute'),door=$('#door'),TARGET=0.25;
let muted=localStorage.getItem('jimmiMuted')==='1';
const paint=()=>{muteBtn.textContent=muted?'🔇':'🔊';muteBtn.setAttribute('aria-label',muted?'Unmute music':'Mute music');};
function fadeIn(){bgm.volume=0;const t0=performance.now();const step=t=>{const k=Math.min(1,(t-t0)/3000);bgm.volume=TARGET*k;if(k<1&&!bgm.paused)requestAnimationFrame(step);};requestAnimationFrame(step);}
function start(){if(muted)return;bgm.muted=false;bgm.play().then(fadeIn).catch(()=>{});}
function enter(){door.classList.add('gone');sessionStorage.setItem('jimmiIn','1');start();setTimeout(()=>door.hidden=true,600);route(true);}
$('#doorBtn').addEventListener('click',enter);
muteBtn.addEventListener('click',()=>{muted=!muted;localStorage.setItem('jimmiMuted',muted?'1':'0');paint();if(muted)bgm.pause();else start();});
paint();
/* ---------- routing (one page so music keeps playing across sections) ---------- */
const P=window.JIMMI_PRODUCTS||[];
const isW=p=>/Women|leggings|crop|pants/i.test(p.tag+p.id+p.name),isM=p=>/Men'|Men$|· Men|Tee|Long Sleeve|Tracksuit/.test(p.tag)&&!(/Women/i.test(p.tag)&&!/Men/i.test(p.tag))&&!/women/i.test(p.id);
const lists={mens:P.filter(isM),womens:P.filter(p=>isW(p)||/Tracksuit/.test(p.tag))};
const card=p=>`<article class="pc${p.soldOut?' sold-out':''}"><div class="pc-img"><img src="${p.image}" alt="${p.name}" loading="lazy">${p.soldOut?'<div class="sold-overlay" aria-hidden="true"></div><span class="sold-badge">SOLD OUT</span>':''}</div><div><small>${p.tag}</small><br><b>${p.name}</b><br><span class="sku">${p.price!=null?(p.soldOut?'<s>$'+p.price+'</s>':'$'+p.price):(p.sku||'')}</span><br>${p.soldOut?'<span class="btn-soldout" aria-disabled="true">SOLD OUT</span>':`<a href="${p.etsyUrl}" target="_blank" rel="noopener">Buy on Etsy</a>`}</div></article>`;
for(const k in lists){$(`[data-grid=${k}]`).innerHTML=lists[k].map(card).join('');$(`[data-win=${k}]`).innerHTML=lists[k].slice(0,3).map(p=>`<img src="${p.image}" alt="">`).join('');}
function route(entering){const v=(location.hash.slice(1)||'studio');const name=['concourse','mens','womens','studio'].includes(v)?v:'studio';
 $$('.view').forEach(s=>s.classList.toggle('on',s.id==='v-'+name));$$('.mtop nav a').forEach(a=>a.classList.toggle('on',a.dataset.v===name));
 if(name==='mens'&&!door.hidden&&!door.classList.contains('gone'))return;
 if(name==='mens'){const w=$('#walker');w.classList.remove('go');void w.offsetWidth;w.classList.add('go');}
 if(name==='studio')draw();scrollTo(0,0);}
addEventListener('hashchange',()=>route());
/* ---------- studio ---------- */
const C={Black:'#111114',Navy:'#14204a',Cobalt:'#1f4fd1',Teal:'#0f8f8c',Purple:'#5b2a9e',Red:'#c8102e',White:'#f2f2f2',Heather:'#9a9aa2',Peach:'#ffb48a','Sky Blue':'#7cc8ff',Yellow:'#ffd400',Gold:'#e0a526',Coral:'#ff6f61',Orange:'#ff7a00',Neon:'#22e6ff',Pink:'#ff2bd6',Cream:'#f3e7c9'};
const BASES=['Black','Navy','Cobalt','Teal','Purple','Red','White','Heather','Peach','Sky Blue'];
const INKS=['Yellow','Gold','Red','Coral','Orange','Neon','Pink','White','Black','Cream','Cobalt','Teal'];
const G={
 leggings:{n:'Leggings',area:'All-over print (Printful AOP leggings, full panels)',lp:['hip','thigh','calf','waistband','back'],wp:['down the leg','under the logo','none']},
 joggers:{n:'Joggers',area:'All-over print joggers (approx. print panels)',lp:['hip','thigh','calf','waistband','back'],wp:['down the leg','under the logo','none']},
 tee:{n:'Tee',area:'DTG front/back print area 12″ × 16″',lp:['chest','left chest','back','hip'],wp:['under the logo','chest','none']},
 longsleeve:{n:'Long Sleeve',area:'DTG front/back 12″ × 16″ · sleeve print area approx.',lp:['chest','left chest','back','hip'],wp:['under the logo','chest','down the sleeve','none']},
 hoodie:{n:'Hoodie',area:'DTG front ~12″ × 10″ (above pocket) · back 12″ × 16″',lp:['chest','left chest','back'],wp:['under the logo','chest','down the sleeve','none']},
 zip:{n:'Zip Jacket',area:'Left-chest ~4″ × 4″ · back 12″ × 16″ (zip splits the front)',lp:['left chest','back'],wp:['under the logo','down the sleeve','none']}};
let S={g:'leggings',base:'Navy',logo:'Yellow',hair:'Yellow',lp:'calf',wp:'down the leg',stripe:'none'};
const STARTERS=[
 {t:'Navy & Yellow · logo on the calf',s:{g:'leggings',base:'Navy',logo:'Yellow',hair:'Yellow',lp:'calf',wp:'down the leg',stripe:'none'}},
 {t:'Black & Red · stripe down the side',s:{g:'leggings',base:'Black',logo:'Red',hair:'Red',lp:'hip',wp:'down the leg',stripe:'Red'}},
 {t:'Teal & Coral · logo on the thigh',s:{g:'leggings',base:'Teal',logo:'Coral',hair:'Coral',lp:'thigh',wp:'down the leg',stripe:'none'}},
 {t:'Cobalt & Orange · logo near the knee',s:{g:'leggings',base:'Cobalt',logo:'Orange',hair:'Orange',lp:'calf',wp:'under the logo',stripe:'Orange'}},
 {t:'Red & Black tee',s:{g:'tee',base:'Red',logo:'Black',hair:'Black',lp:'chest',wp:'under the logo',stripe:'none'}},
 {t:'Blue & Yellow hoodie',s:{g:'hoodie',base:'Cobalt',logo:'Yellow',hair:'Yellow',lp:'chest',wp:'under the logo',stripe:'none'}},
 {t:'Purple & Gold long sleeve',s:{g:'longsleeve',base:'Purple',logo:'Gold',hair:'Gold',lp:'chest',wp:'down the sleeve',stripe:'none'}},
 {t:'Black & Neon zip',s:{g:'zip',base:'Black',logo:'Neon',hair:'Pink',lp:'left chest',wp:'down the sleeve',stripe:'Pink'}},
 {t:'Navy & Gold joggers',s:{g:'joggers',base:'Navy',logo:'Gold',hair:'Gold',lp:'thigh',wp:'down the leg',stripe:'Gold'}}];
$('#starters').innerHTML=STARTERS.map((x,i)=>`<button type="button" class="starter" data-i="${i}" style="--a:${C[x.s.base]};--b:${C[x.s.logo]}">${x.t}</button>`).join('');
$('#starters').addEventListener('click',e=>{const b=e.target.closest('.starter');if(b){S={...STARTERS[b.dataset.i].s};ui();}});
$('#surprise').addEventListener('click',()=>{const x=STARTERS[Math.floor(Math.random()*STARTERS.length)].s;const gs=Object.keys(G),g=gs[Math.floor(Math.random()*gs.length)];const pick=a=>a[Math.floor(Math.random()*a.length)];
 S={...x,g,lp:pick(G[g].lp.filter(p=>p!=='back')),wp:pick(G[g].wp.filter(p=>p!=='none')),stripe:Math.random()<.4?x.logo:'none'};ui();});
function chips(id,arr,key,lab=v=>v){$(id).innerHTML=arr.map(v=>`<button type="button" class="chip${S[key]===v?' on':''}" data-v="${v}">${lab(v)}</button>`).join('');}
function swatches(id,arr,key){$(id).innerHTML=arr.map(v=>`<button type="button" class="sw${S[key]===v?' on':''}" data-v="${v}" title="${v}" aria-label="${v}" style="background:${C[v]}"></button>`).join('');}
function ui(){const g=G[S.g];if(!g.lp.includes(S.lp))S.lp=g.lp[0];if(!g.wp.includes(S.wp))S.wp=g.wp[0];
 chips('#g',Object.keys(G),'g',k=>G[k].n);swatches('#base',BASES,'base');swatches('#logoc',INKS,'logo');swatches('#hairc',INKS,'hair');chips('#lp',g.lp,'lp');chips('#wp',g.wp,'wp');
 $('#st').innerHTML=['none',...INKS.slice(0,7)].map(v=>v==='none'?`<button type="button" class="chip${S.stripe==='none'?' on':''}" data-v="none">None</button>`:`<button type="button" class="sw${S.stripe===v?' on':''}" data-v="${v}" title="${v}" style="background:${C[v]}"></button>`).join('');
 draw();}
const bind=(id,key,also)=>$(id).addEventListener('click',e=>{const b=e.target.closest('[data-v]');if(!b)return;S[key]=b.dataset.v;if(also)S[also]=b.dataset.v;ui();});
bind('#g','g');bind('#base','base');bind('#logoc','logo','hair');bind('#hairc','hair');bind('#lp','lp');bind('#wp','wp');bind('#st','stripe');
/* assets */
const img=src=>{const i=new Image();i.src=src;i.onload=()=>draw();return i;};
const A={body:img('assets/studio/logo-body.png'),hair:img('assets/studio/logo-hair.png'),word:img('assets/studio/wordmark.png')};
function tint(im,col){const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;const x=c.getContext('2d');x.drawImage(im,0,0);x.globalCompositeOperation='source-in';x.fillStyle=col;x.fillRect(0,0,c.width,c.height);return c;}
const cv=$('#cv'),ctx=cv.getContext('2d');
function shade(hex,a){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=v=>Math.max(0,Math.min(255,Math.round(v+a)));return `rgb(${f(r)},${f(g)},${f(b)})`;}
function path(g,back){const p=new Path2D();
 if(g==='leggings'||g==='joggers'){const w=g==='joggers'?18:0;p.moveTo(165-w,80);p.lineTo(435+w,80);p.lineTo(445+w,300);p.lineTo(410+w/2,750);p.lineTo(330-w/2,750);p.lineTo(305,330);p.lineTo(295,330);p.lineTo(270+w/2,750);p.lineTo(190-w/2,750);p.lineTo(155-w,300);p.closePath();}
 else{const long=g!=='tee';p.moveTo(205,120);p.lineTo(255,100);if(back)p.quadraticCurveTo(300,108,345,100);else p.quadraticCurveTo(300,140,345,100);p.lineTo(395,120);
  if(long){p.lineTo(470,200);p.lineTo(520,560);p.lineTo(470,570);p.lineTo(425,300);}else{p.lineTo(500,200);p.lineTo(460,265);p.lineTo(420,240);}
  p.lineTo(425,690);p.lineTo(175,690);
  if(long){p.lineTo(175,300);p.lineTo(130,570);p.lineTo(80,560);p.lineTo(130,200);}else{p.lineTo(180,240);p.lineTo(140,265);p.lineTo(100,200);}
  p.closePath();}
 return p;}
function logo(cx,cy,h,rot){const b=A.body,hr=A.hair;if(!b.complete||!b.naturalWidth)return;const s=h/b.naturalHeight,w=b.naturalWidth*s;
 ctx.save();ctx.translate(cx,cy);if(rot)ctx.rotate(rot);ctx.shadowColor=C[S.logo];ctx.shadowBlur=h/40;
 ctx.drawImage(tint(b,C[S.logo]),-w/2,-h/2,w,h);
 if(hr.naturalWidth){ctx.shadowColor=C[S.hair];const hw=hr.naturalWidth*s,hh=hr.naturalHeight*s;ctx.drawImage(tint(hr,C[S.hair]),-w/2,-h/2,w,h);}
 ctx.restore();}
function word(cx,cy,wd,rot){const m=A.word;if(!m.naturalWidth)return;const h=wd*m.naturalHeight/m.naturalWidth;ctx.save();ctx.translate(cx,cy);if(rot)ctx.rotate(rot);ctx.shadowColor=C[S.logo];ctx.shadowBlur=3;ctx.drawImage(tint(m,C[S.logo]),-wd/2,-h/2,wd,h);ctx.restore();}
function draw(){if(!ctx)return;const g=S.g,pants=g==='leggings'||g==='joggers',back=S.lp==='back';
 ctx.clearRect(0,0,600,800);const bg=ctx.createLinearGradient(0,0,0,800);bg.addColorStop(0,'#1d1238');bg.addColorStop(1,'#0b0618');ctx.fillStyle=bg;ctx.fillRect(0,0,600,800);
 const p=path(g,back),base=C[S.base];
 const gr=ctx.createLinearGradient(100,0,500,0);gr.addColorStop(0,shade(base,-28));gr.addColorStop(.5,shade(base,14));gr.addColorStop(1,shade(base,-28));
 ctx.save();ctx.shadowColor='#000';ctx.shadowBlur=24;ctx.fillStyle=gr;ctx.fill(p);ctx.restore();
 ctx.save();ctx.clip(p);
 ctx.strokeStyle=shade(base,-45);ctx.lineWidth=2;
 if(pants){ctx.fillStyle=shade(base,-22);ctx.fillRect(0,80,600,g==='joggers'?40:55);ctx.beginPath();ctx.moveTo(300,135);ctx.lineTo(300,330);ctx.stroke();
  if(g==='joggers'){ctx.fillRect(0,720,600,40);}}
 else{ctx.beginPath();ctx.moveTo(175,660);ctx.lineTo(425,660);ctx.stroke();
  if(g==='hoodie'||g==='zip'){ctx.fillStyle=shade(base,-20);ctx.fillRect(175,640,250,60);if(!back&&g==='hoodie'){ctx.beginPath();ctx.moveTo(220,520);ctx.lineTo(380,520);ctx.lineTo(400,620);ctx.lineTo(200,620);ctx.closePath();ctx.stroke();}
   if(!back){ctx.beginPath();ctx.moveTo(275,140);ctx.lineTo(270,300);ctx.moveTo(325,140);ctx.lineTo(330,300);ctx.stroke();}}
  if(g==='zip'&&!back){ctx.strokeStyle='#ccc';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(300,118);ctx.lineTo(300,690);ctx.stroke();}}
 if(S.stripe!=='none'){ctx.strokeStyle=C[S.stripe];ctx.lineWidth=7;ctx.beginPath();
  if(pants){ctx.moveTo(162,100);ctx.lineTo(160,300);ctx.lineTo(195,750);ctx.moveTo(438,100);ctx.lineTo(440,300);ctx.lineTo(405,750);}
  else if(g!=='tee'){ctx.moveTo(140,200);ctx.lineTo(95,565);ctx.moveTo(460,200);ctx.lineTo(505,565);}else{ctx.moveTo(230,110);ctx.lineTo(120,232);ctx.moveTo(370,110);ctx.lineTo(480,232);}
  ctx.stroke();}
 // placements
 const L={hip:pants?[220,200,110]:[370,600,80],thigh:[230,345,170],calf:[240,585,150],waistband:pants?[300,107,46]:[300,660,40],back:pants?[300,240,170]:[300,360,240],chest:g==='hoodie'?[300,280,170]:[300,330,230],'left chest':[365,215,80]}[S.lp];
 let wordAt=null;
 if(S.wp==='down the leg')wordAt=[372,440,290,Math.PI/2*-1+Math.PI*0.03];
 else if(S.wp==='under the logo')wordAt=[L[0],L[1]+L[2]*0.62,L[2]*0.85,0];
 else if(S.wp==='chest')wordAt=[300,215,200,0];
 else if(S.wp==='down the sleeve')wordAt=[490,390,240,Math.PI/2+0.14];
 if(S.wp==='chest'&&S.lp==='chest'){L[1]=380;L[2]=200;}
 if(S.wp==='down the leg'&&S.lp==='back')wordAt=null;
 ctx.restore();
 ctx.save();ctx.clip(p);logo(L[0],L[1],L[2]);if(wordAt)word(...wordAt);ctx.restore();
 // print area hint
 ctx.setLineDash([6,6]);ctx.strokeStyle='#ffffff40';ctx.lineWidth=1.5;
 if(pants)ctx.stroke(p);else if(g==='zip'&&!back)ctx.strokeRect(325,165,85,85);else if(g==='hoodie'&&!back)ctx.strokeRect(195,180,210,180);else ctx.strokeRect(195,160,210,280);ctx.setLineDash([]);
 ctx.fillStyle='#fff';ctx.font='bold 22px system-ui';ctx.textAlign='center';ctx.fillText(`${S.base} ${G[g].n}${back?' · BACK VIEW':''}`,300,40);
 $('#cap').textContent='Dashed line = print area · '+G[g].area+' · preview is approximate';
 const spec=specText();$('#spec').textContent=spec.replace(/\n/g,' · ');
 $('#req').href='mailto:guysmoney@gmail.com?subject='+encodeURIComponent('Jimmi design request: '+S.base+' '+G[g].n)+'&body='+encodeURIComponent('Hi Jimmi at the Gym! I want this custom piece:\n\n'+spec+'\n\nSize: \nName: \nNotes: \n');}
function specText(){return `Garment: ${G[S.g].n}\nBase color: ${S.base} (${C[S.base]})\nLogo: Buff Jimmi in ${S.logo} (${C[S.logo]}), hair ${S.hair} (${C[S.hair]})\nLogo placement: ${S.lp}\nWordmark "Jimmi / at the gym": ${S.wp}${S.wp==='none'?'':' in '+S.logo}\nSide stripe: ${S.stripe}`;}
/* boot */
ui();
if(sessionStorage.getItem('jimmiIn')==='skip'){door.hidden=true;}
route();
})();

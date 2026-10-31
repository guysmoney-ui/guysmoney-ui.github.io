/* Jimmi's Design Shop — shared renderer (browser + headless tool). No modules, works on file:// */
(function(W){
const C={Black:'#111114',Navy:'#14204a',Cobalt:'#1f4fd1',Teal:'#0f8f8c',Purple:'#5b2a9e',Red:'#c8102e',White:'#f2f2f2',Heather:'#9a9aa2',Peach:'#ffb48a','Sky Blue':'#7cc8ff',Yellow:'#ffd400',Gold:'#e0a526',Coral:'#ff6f61',Orange:'#ff7a00',Neon:'#22e6ff',Pink:'#ff2bd6',Cream:'#f3e7c9'};
const BASES=['Black','Navy','Cobalt','Teal','Purple','Red','White','Heather','Peach','Sky Blue'];
const INKS=['Yellow','Gold','Red','Coral','Orange','Neon','Pink','White','Black','Cream','Cobalt','Teal'];
const G={
 leggings:{n:'Leggings',pants:1,area:'All-over print (Printful AOP leggings, full panels)',lp:['hip','thigh','calf','waistband','back'],wp:['down the leg','under the logo','none']},
 joggers:{n:'Joggers',pants:1,area:'All-over print joggers (approx. print panels)',lp:['hip','thigh','calf','waistband','back'],wp:['down the leg','under the logo','none']},
 tee:{n:'Tee',area:'DTG front/back print area 12″ × 16″',lp:['chest','left chest','back','hip'],wp:['under the logo','chest','none']},
 longsleeve:{n:'Long Sleeve',area:'DTG front/back 12″ × 16″ · sleeve approx.',lp:['chest','left chest','back','hip'],wp:['under the logo','chest','down the sleeve','none']},
 hoodie:{n:'Hoodie',area:'DTG front ~12″ × 10″ · back 12″ × 16″',lp:['chest','left chest','back'],wp:['under the logo','chest','down the sleeve','none']},
 zip:{n:'Zip Jacket',area:'Left-chest ~4″ × 4″ · back 12″ × 16″',lp:['left chest','back'],wp:['under the logo','down the sleeve','none']}};
const LOGO_H=150,WORD_W=290;
function logoPreset(g,p){const pants=G[g].pants;const t={hip:pants?[220,200,110]:[370,600,80],thigh:[230,345,170],calf:[240,585,150],waistband:pants?[300,107,46]:[300,660,40],back:pants?[300,240,170]:[300,360,240],chest:g==='hoodie'?[300,280,170]:[300,330,230],'left chest':[365,215,80]}[p]||[300,330,150];
 return {placement:p,side:p==='back'?'back':'front',x:t[0],y:t[1],scale:+(t[2]/LOGO_H).toFixed(3)};}
function wordPreset(g,p,L){const lh=L.scale*LOGO_H;let t;
 if(p==='down the leg')t=[372,440,290,-90+5.4];else if(p==='under the logo')t=[L.x,L.y+lh*.62,lh*.85,0];else if(p==='chest')t=[300,215,200,0];else if(p==='down the sleeve')t=[490,390,240,98];else return {placement:'none',side:'front',x:300,y:400,scale:1,rotation:0,hidden:true};
 return {placement:p,side:p==='under the logo'?L.side:'front',x:t[0],y:t[1],scale:+(t[2]/WORD_W).toFixed(3),rotation:t[3],hidden:false};}
function make(o){o=o||{};const g=o.garment||'leggings',lp=o.lp||G[g].lp[0],wp=o.wp||G[g].wp[0];const logo=logoPreset(g,lp);
 return {schema:'jimmi.design',version:1,name:o.name||'Untitled Jimmi',notes:o.notes||'',author:o.author||'Guy',created:new Date().toISOString(),updated:new Date().toISOString(),
  garment:g,view:logo.side,colors:{base:o.base||C.Navy,logo:o.logo||C.Yellow,hair:o.hair||o.logo||C.Yellow,stripe:o.stripe||null,stripeWidth:o.stripeWidth||7},
  logo,wordmark:wordPreset(g,wp,logo)};}
function validate(d){const e=[];if(!d||d.schema!=='jimmi.design')e.push('schema must be "jimmi.design"');if(d&&d.version!==1)e.push('unsupported version '+(d&&d.version));
 if(d&&!G[d.garment])e.push('unknown garment '+(d&&d.garment));const hx=/^#[0-9a-fA-F]{6}$/;if(d&&d.colors)['base','logo','hair'].forEach(k=>{if(!hx.test(d.colors[k]||''))e.push('colors.'+k+' must be #rrggbb')});else e.push('colors missing');
 if(d&&(!d.logo||typeof d.logo.x!=='number'))e.push('logo.x/y/scale missing');if(d&&!d.wordmark)e.push('wordmark missing');return e;}
function shade(hex,a){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=v=>Math.max(0,Math.min(255,Math.round(v+a)));return `rgb(${f(r)},${f(g)},${f(b)})`;}
function path(g,back){const p=new Path2D();
 if(G[g].pants){const w=g==='joggers'?18:0;p.moveTo(165-w,80);p.lineTo(435+w,80);p.lineTo(445+w,300);p.lineTo(410+w/2,750);p.lineTo(330-w/2,750);p.lineTo(305,330);p.lineTo(295,330);p.lineTo(270+w/2,750);p.lineTo(190-w/2,750);p.lineTo(155-w,300);p.closePath();}
 else{const long=g!=='tee';p.moveTo(205,120);p.lineTo(255,100);if(back)p.quadraticCurveTo(300,108,345,100);else p.quadraticCurveTo(300,140,345,100);p.lineTo(395,120);
  if(long){p.lineTo(470,200);p.lineTo(520,560);p.lineTo(470,570);p.lineTo(425,300);}else{p.lineTo(500,200);p.lineTo(460,265);p.lineTo(420,240);}
  p.lineTo(425,690);p.lineTo(175,690);
  if(long){p.lineTo(175,300);p.lineTo(130,570);p.lineTo(80,560);p.lineTo(130,200);}else{p.lineTo(180,240);p.lineTo(140,265);p.lineTo(100,200);}
  p.closePath();}return p;}
const tc={};function tint(im,col){const k=im.src.length+im.src.slice(-40)+col;if(tc[k])return tc[k];const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;const x=c.getContext('2d');x.drawImage(im,0,0);x.globalCompositeOperation='source-in';x.fillStyle=col;x.fillRect(0,0,c.width,c.height);return tc[k]=c;}
function logoBox(d){const b=W.JIMMI_IMG.body,h=d.logo.scale*LOGO_H,w=h*b.naturalWidth/b.naturalHeight;return {x:d.logo.x,y:d.logo.y,w,h,r:0};}
function wordBox(d){const m=W.JIMMI_IMG.word,w=d.wordmark.scale*WORD_W;return {x:d.wordmark.x,y:d.wordmark.y,w,h:w*m.naturalHeight/m.naturalWidth,r:(d.wordmark.rotation||0)*Math.PI/180};}
/* draw(ctx,d,{print:bool,view:'front'|'back',sel:'logo'|'word'|null,grid:bool}) in 600x800 logical units */
function draw(ctx,d,o){o=o||{};const g=d.garment,back=(o.view||d.view)==='back',side=back?'back':'front',A=W.JIMMI_IMG,col=d.colors,pants=G[g].pants;
 ctx.clearRect(0,0,600,800);
 const p=path(g,back);
 if(!o.print){const bg=ctx.createLinearGradient(0,0,0,800);bg.addColorStop(0,'#1d1238');bg.addColorStop(1,'#0b0618');ctx.fillStyle=bg;ctx.fillRect(0,0,600,800);
  const gl=ctx.createRadialGradient(300,0,20,300,0,520);gl.addColorStop(0,'#ffd9a055');gl.addColorStop(1,'#0000');ctx.fillStyle=gl;ctx.fillRect(0,0,600,800);
  const base=col.base,gr=ctx.createLinearGradient(100,0,500,0);gr.addColorStop(0,shade(base,-28));gr.addColorStop(.5,shade(base,14));gr.addColorStop(1,shade(base,-28));
  ctx.save();ctx.shadowColor='#000';ctx.shadowBlur=24;ctx.fillStyle=gr;ctx.fill(p);ctx.restore();
  ctx.save();ctx.clip(p);ctx.strokeStyle=shade(base,-45);ctx.lineWidth=2;
  if(pants){ctx.fillStyle=shade(base,-22);ctx.fillRect(0,80,600,g==='joggers'?40:55);ctx.beginPath();ctx.moveTo(300,135);ctx.lineTo(300,330);ctx.stroke();if(g==='joggers')ctx.fillRect(0,720,600,40);}
  else{ctx.beginPath();ctx.moveTo(175,660);ctx.lineTo(425,660);ctx.stroke();
   if(g==='hoodie'||g==='zip'){ctx.fillStyle=shade(base,-20);ctx.fillRect(175,640,250,60);if(!back&&g==='hoodie'){ctx.beginPath();ctx.moveTo(220,520);ctx.lineTo(380,520);ctx.lineTo(400,620);ctx.lineTo(200,620);ctx.closePath();ctx.stroke();}
    if(!back){ctx.beginPath();ctx.moveTo(275,140);ctx.lineTo(270,300);ctx.moveTo(325,140);ctx.lineTo(330,300);ctx.stroke();}}
   if(g==='zip'&&!back){ctx.strokeStyle='#ccc';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(300,118);ctx.lineTo(300,690);ctx.stroke();}}
  ctx.restore();}
 ctx.save();ctx.clip(p);
 if(col.stripe){ctx.strokeStyle=col.stripe;ctx.lineWidth=col.stripeWidth||7;ctx.beginPath();
  if(pants){ctx.moveTo(162,100);ctx.lineTo(160,300);ctx.lineTo(195,750);ctx.moveTo(438,100);ctx.lineTo(440,300);ctx.lineTo(405,750);}
  else if(g!=='tee'){ctx.moveTo(140,200);ctx.lineTo(95,565);ctx.moveTo(460,200);ctx.lineTo(505,565);}else{ctx.moveTo(230,110);ctx.lineTo(120,232);ctx.moveTo(370,110);ctx.lineTo(480,232);}ctx.stroke();}
 const glow=o.print?0:1;
 if(A.body.naturalWidth&&(d.logo.side||'front')===side){const b=logoBox(d);ctx.save();ctx.translate(b.x,b.y);ctx.shadowColor=col.logo;ctx.shadowBlur=glow*b.h/40;ctx.drawImage(tint(A.body,col.logo),-b.w/2,-b.h/2,b.w,b.h);ctx.shadowColor=col.hair;ctx.drawImage(tint(A.hair,col.hair),-b.w/2,-b.h/2,b.w,b.h);ctx.restore();}
 if(A.word.naturalWidth&&!d.wordmark.hidden&&(d.wordmark.side||'front')===side){const b=wordBox(d);ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.r);ctx.shadowColor=col.logo;ctx.shadowBlur=glow*3;ctx.drawImage(tint(A.word,col.logo),-b.w/2,-b.h/2,b.w,b.h);ctx.restore();}
 ctx.restore();
 if(!o.print){ctx.setLineDash([6,6]);ctx.strokeStyle='#ffffff40';ctx.lineWidth=1.5;
  if(pants)ctx.stroke(p);else if(g==='zip'&&!back)ctx.strokeRect(325,165,85,85);else if(g==='hoodie'&&!back)ctx.strokeRect(195,180,210,180);else ctx.strokeRect(195,160,210,280);ctx.setLineDash([]);
  if(o.sel){const b=o.sel==='logo'?logoBox(d):wordBox(d);const s=o.sel==='logo'?d.logo.side:d.wordmark.side;if((s||'front')===side&&!(o.sel==='word'&&d.wordmark.hidden)){ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.r);ctx.strokeStyle='#ffe14a';ctx.lineWidth=2;ctx.setLineDash([8,5]);ctx.strokeRect(-b.w/2-6,-b.h/2-6,b.w+12,b.h+12);ctx.restore();}}
  if(o.label!==false){ctx.fillStyle='#fff';ctx.font='bold 22px system-ui,sans-serif';ctx.textAlign='center';ctx.fillText(`${d.name} · ${G[g].n}${back?' · BACK':''}`,300,40);}}}
function hit(d,x,y,view){const side=view||d.view;const t=(b)=>{const dx=x-b.x,dy=y-b.y,c=Math.cos(-b.r),s=Math.sin(-b.r);const u=dx*c-dy*s,v=dx*s+dy*c;return Math.abs(u)<=b.w/2+8&&Math.abs(v)<=b.h/2+8;};
 if(!d.wordmark.hidden&&d.wordmark.side===side&&t(wordBox(d)))return 'word';if(d.logo.side===side&&t(logoBox(d)))return 'logo';return null;}
/* render(d,{print,view,px}) -> canvas; px = output height (default 2000) */
function render(d,o){o=o||{};const px=o.px||2000,k=px/800;const c=document.createElement('canvas');c.width=Math.round(600*k);c.height=px;const x=c.getContext('2d');x.scale(k,k);draw(x,d,{print:o.print,view:o.view,label:false});return c;}
function ready(cb){const A=W.JIMMI_ASSETS;if(!W.JIMMI_IMG){W.JIMMI_IMG={};for(const k in A){const i=new Image();i.src=A[k];W.JIMMI_IMG[k]=i;}}
 Promise.all(Object.values(W.JIMMI_IMG).map(i=>i.decode?i.decode().catch(()=>{}):0)).then(cb);}
function hexName(h){for(const k in C)if(C[k].toLowerCase()===(h||'').toLowerCase())return k;return h;}
W.JimmiRender={_tint:tint,path,C,BASES,INKS,G,LOGO_H,WORD_W,logoPreset,wordPreset,make,validate,draw,render,hit,ready,hexName};
})(window);

/* "Got your jimmies on?" die-cut text stickers (full-color PNGs, not recolored) + curve tool */
(function(){const S=[['condensed','Bold Condensed'],['script','Script'],['neon','80s Neon'],['varsity','Varsity'],['typewriter','Typewriter'],['arched','Arched'],['dipped','Dipped'],['arched-print','Arched, print only'],['dipped-print','Dipped, print only']];
window.JIMMI_GYJ=S.map(([k,n])=>({key:'gyj_'+k,n:'Got Your Jimmies On? ('+n+')',src:'assets/stickers/got-your-jimmies-'+k+'.png'}));
window.JIMMI_GYJ.forEach(g=>window.JIMMI_ASSETS[g.key]=g.src);
const F=[['GYJBebas','BebasNeue-Regular.ttf','Bold Condensed'],['GYJPacifico','Pacifico-Regular.ttf','Script'],['GYJMonoton','Monoton-Regular.ttf','80s Neon'],['GYJGraduate','Graduate-Regular.ttf','Varsity'],['GYJElite','SpecialElite-Regular.ttf','Typewriter']];
const st=document.createElement('style');st.textContent=F.map(([f,u])=>`@font-face{font-family:${f};src:url(fonts/${u});font-display:swap}`).join('')+`.gyjc{border:2px solid var(--neon);border-radius:10px;padding:10px;margin:10px 0;background:#0b0618}.gyjc canvas{width:100%;height:auto;display:block;background:repeating-conic-gradient(#2a2340 0 25%,#1a1530 0 50%) 0 0/20px 20px;border-radius:8px}.gyjc label{display:flex;align-items:center;gap:8px;margin:8px 0;font-size:15px}.gyjc input[type=range]{flex:1;height:36px;accent-color:var(--neon)}.gyjc select,.gyjc input[type=color]{min-height:40px;font-size:16px;flex:1}.gyjc button{min-height:44px;width:100%;font-size:16px}.libgrid .gyjb{width:auto;grid-column:1/-1}.libgrid .gyjb img{max-width:100%;max-height:70px}`;document.head.appendChild(st);
const T='Got your jimmies on?';
function draw(cv,o){const c=cv.getContext('2d'),fs=96,font=`${fs}px ${o.font}`;c.font=font;const ch=[...T],ws=ch.map(x=>c.measureText(x).width),L=ws.reduce((a,b)=>a+b,0),th=Math.abs(o.curve)/100*Math.PI*0.9,pad=40,bw=14;
 const g=[];let p=-L/2;for(let i=0;i<ch.length;i++){const m=p+ws[i]/2;p+=ws[i];if(th<0.01)g.push([m,0,0]);else{const R=L/th,a=m/R,s=o.curve>0?1:-1;g.push([R*Math.sin(a),s*R*(1-Math.cos(a)),s*a]);}}
 const ys=g.map(q=>q[1]),W=Math.ceil(L+2*pad+fs*.4),H=Math.ceil(Math.max(...ys)-Math.min(...ys)+fs*1.3+2*pad);cv.width=W;cv.height=H;
 const oy=H/2-(Math.max(...ys)+Math.min(...ys))/2+fs*.3;const glyphs=(cx,fn)=>{g.forEach((q,i)=>{cx.save();cx.translate(W/2+q[0],oy+q[1]);cx.rotate(o.curve>0?-q[2]:q[2]*-1);fn(cx,ch[i]);cx.restore();});};
 c.clearRect(0,0,W,H);c.font=font;c.textAlign='center';c.textBaseline='alphabetic';c.lineJoin='round';
 /* fix rotation sign: arch tilts glyphs outward */
 const rot=q=>o.curve>0?-q[2]:-q[2];
 c.strokeStyle='#fff';c.fillStyle='#fff';c.lineWidth=bw*2;g.forEach((q,i)=>{c.save();c.translate(W/2+q[0],oy+q[1]);c.rotate(q[2]);c.strokeText(ch[i],0,0);c.fillText(ch[i],0,0);c.restore();});
 c.strokeStyle='#111';c.lineWidth=5;c.fillStyle=o.color;g.forEach((q,i)=>{c.save();c.translate(W/2+q[0],oy+q[1]);c.rotate(q[2]);c.strokeText(ch[i],0,0);c.fillText(ch[i],0,0);c.restore();});}
window.JIMMI_GYJ_TOOL=function(host){host.innerHTML=`<div class="gyjc"><b>Curve "Got your jimmies on?"</b><canvas id="gyjCv"></canvas><label>Curve <input id="gyjCurve" type="range" min="-100" max="100" step="1" value="0"><output id="gyjVal">0</output></label><label>Font <select id="gyjFont">${F.map(([f,,n])=>`<option value="${f}">${n}</option>`).join('')}</select></label><label>Color <input id="gyjCol" type="color" value="#e10600"></label><button id="gyjDl">⬇️ Download PNG</button></div>`;
 const q=s=>host.querySelector(s),cv=q('#gyjCv'),go=()=>{q('#gyjVal').textContent=q('#gyjCurve').value;draw(cv,{curve:+q('#gyjCurve').value,font:q('#gyjFont').value,color:q('#gyjCol').value});};
 ['input','change'].forEach(e=>host.addEventListener(e,go));q('#gyjDl').onclick=()=>{const a=document.createElement('a');a.download='got-your-jimmies-on-curve'+q('#gyjCurve').value+'.png';a.href=cv.toDataURL('image/png');a.click();};
 window.__gyjSet=v=>{q('#gyjCurve').value=v;go();};document.fonts.load('96px GYJBebas').then(go);F.forEach(f=>document.fonts.load('96px '+f[0]).then(go));go();};
})();

#!/usr/bin/env node
/* Render a .jimmi.json (v1 or v2) to <stem>-mockup.png + print PNGs (v1/legacy: <stem>-print.png; v2 Tee Editor: -print-front/-print-back/-print-left-sleeve/-print-right-sleeve) using headless Chrome over CDP.
   Usage: node render_design.js design.jimmi.json [-o OUTDIR] [--px 2000]   (Node 22+, Chrome/Chromium installed) */
const fs=require('fs'),path=require('path'),os=require('os'),{spawn}=require('child_process');
const args=process.argv.slice(2);if(!args[0]){console.error('usage: render_design.js design.jimmi.json [-o dir] [--px 2000]');process.exit(2);}
const opt=k=>{const i=args.indexOf(k);return i>=0?args[i+1]:null;};
const file=path.resolve(args[0]),out=path.resolve(opt('-o')||path.dirname(file)),px=+(opt('--px')||2000);
const d=JSON.parse(fs.readFileSync(file,'utf8'));if(d.schema!=='jimmi.design'||![1,2].includes(d.version)){console.error('not a jimmi.design v1/v2 file');process.exit(1);}
const chrome=['google-chrome','chromium','chromium-browser'].find(c=>{try{require('child_process').execSync('command -v '+c,{stdio:'ignore'});return 1;}catch(_){}})||process.exit(console.error('chrome not found')||1);
const b=Buffer.from(JSON.stringify(d)).toString('base64url'),url='file://'+path.join(__dirname,'render.html')+`#px=${px}&d=${b}`;
const port=9400+Math.floor(Math.random()*500),prof=fs.mkdtempSync(path.join(os.tmpdir(),'jr-'));
const p=spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu','--allow-file-access-from-files','--remote-debugging-port='+port,'--user-data-dir='+prof,'about:blank'],{stdio:'ignore'});
const done=c=>{p.kill();setTimeout(()=>{try{fs.rmSync(prof,{recursive:true,force:true});}catch(_){}process.exit(c);},500);};
setTimeout(()=>{console.error('timeout');done(1);},60000);
(async()=>{let ws;for(let i=0;i<60&&!ws;i++){try{const t=(await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(x=>x.type==='page');if(t)ws=t.webSocketDebuggerUrl;}catch(_){}if(!ws)await new Promise(r=>setTimeout(r,200));}
 const s=new WebSocket(ws);await new Promise(r=>s.onopen=r);let id=0;const pend={};s.onmessage=m=>{const x=JSON.parse(m.data);if(pend[x.id]){pend[x.id](x);delete pend[x.id];}};
 const send=(method,params={})=>new Promise(r=>{pend[++id]=r;s.send(JSON.stringify({id,method,params}));});
 await send('Page.navigate',{url});let res;
 for(let i=0;i<100;i++){await new Promise(r=>setTimeout(r,200));const r=await send('Runtime.evaluate',{expression:"document.getElementById('out')&&document.getElementById('out').textContent",returnByValue:true});const v=r.result&&r.result.result.value;if(v&&v!=='pending'){res=JSON.parse(v);break;}}
 if(!res||!res.ok){console.error('render error:',res&&res.error);done(1);}
 fs.mkdirSync(out,{recursive:true});const stem=path.basename(file).replace(/\.jimmi\.json$|\.json$/,'');
 for(const k in res.files){const f=path.join(out,`${stem}-${k}.png`);fs.writeFileSync(f,Buffer.from(res.files[k].split(',')[1],'base64'));console.log(f);}done(0);})().catch(e=>{console.error(e);done(1);});

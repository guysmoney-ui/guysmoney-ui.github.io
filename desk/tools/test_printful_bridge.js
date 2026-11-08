// node desk/tools/test_printful_bridge.js — private bridge client: gating, popup-before-export order, origin/source/nonce binding, idempotency, render allowlist.
const fs=require('fs'),path=require('path'),assert=require('assert');const D=path.join(__dirname,'..');
const log=[],L={};let popup;const W={JimmiRender:{C:{}},addEventListener:(t,f)=>(L[t]=f),removeEventListener:t=>delete L[t],
 open:(u,n,f)=>{log.push('open:'+u);popup={closed:false,sent:[],postMessage:(m,o)=>popup.sent.push([m,o]),close(){this.closed=true;}};return popup;}};
const doc={querySelector:()=>null,createElement:()=>({}),head:{appendChild(){}},addEventListener(){},body:{}};
new Function('window','document',fs.readFileSync(path.join(D,'printful.js'),'utf8'))(W,doc);const P=W.JIMMI_PRINTFUL,src=fs.readFileSync(path.join(D,'printful.js'),'utf8');
(async()=>{
 // dormant by default: not enabled, empty origin, no secrets
 assert.strictEqual(P.BRIDGE.enabled,false);assert.strictEqual(P.BRIDGE.origin,'');assert.ok(!P.bridgeOn());
 assert.ok(!/OWNER_KEY|SESSION_SECRET|PRINTFUL_TOKEN|Bearer |localStorage\.setItem\([^)]*(token|secret)/i.test(src),'no secrets');
 await assert.rejects(P.bridgeSend(()=>null),/not set up/);assert.strictEqual(log.length,0,'no popup when dormant');
 // guard: only standard AOP leggings
 const leg={editor:'tee',garment:'leggings'};assert.ok(P.isStdLeg(leg));P.setLegChoice('yoga');assert.ok(!P.isStdLeg(leg));P.setLegChoice('aop');
 for(const g of ['shorts','joggers','tee','hoodie'])assert.ok(!P.isStdLeg({editor:'tee',garment:g}),g+' stays manual');
 // enable for test
 const O='https://bridge.example.workers.dev';P.BRIDGE.enabled=true;P.BRIDGE.origin=O;assert.ok(P.bridgeOn());
 P.BRIDGE.origin='http://x.example';assert.ok(!P.bridgeOn(),'https only');P.BRIDGE.origin=O+'/';assert.ok(!P.bridgeOn(),'exact origin');P.BRIDGE.origin=O;
 const png=new Blob([new Uint8Array([137,80,78,71,1,2,3])],{type:'image/png'});let made=false;
 const pr=P.bridgeSend(async()=>{log.push('export');made=true;return png;},{});
 assert.ok(log[0].startsWith('open:'+O+'/?nonce='),'popup opened synchronously');assert.ok(!made,'export not started before popup');
 const nonce=decodeURIComponent(log[0].split('nonce=')[1]);assert.ok(nonce.length>=32);
 const again=P.bridgeSend(async()=>png,{});assert.strictEqual(again,pr,'double click reuses in-flight transfer');assert.strictEqual(log.filter(x=>x.startsWith('open')).length,1,'one popup');
 await new Promise(r=>setTimeout(r,20));
 const msg=(data,o={})=>L.message({origin:o.origin||O,source:o.source||popup,data:{nonce,...data}});
 msg({type:'jimmi:ready'},{origin:'https://evil.example'});msg({type:'jimmi:ready'},{source:{}});L.message({origin:O,source:popup,data:{type:'jimmi:ready',nonce:'x'.repeat(36)}});
 assert.strictEqual(popup.sent.length,0,'wrong origin/source/nonce ignored');
 msg({type:'jimmi:ready'});assert.strictEqual(popup.sent.length,1);const [m,to]=popup.sent[0];assert.strictEqual(to,O);
 assert.deepStrictEqual([m.type,m.design.profile,m.design.placement],['jimmi:design','standard-aop-leggings-7200x6225-v1','default']);assert.ok(/^[a-f0-9]{64}$/.test(m.design.idempotencyKey),'stable content id');assert.strictEqual(m.design.blob,png);
 msg({type:'jimmi:ready'});assert.strictEqual(popup.sent.length,1,'no resend on repeated ready');
 msg({type:'jimmi:complete',job:{renders:['https://evil.example/a.png']}});await assert.rejects(pr,/no usable mockup/);
 // retry same PNG: same id; success with allowlisted render; then a third click returns cached job without posting again
 const p2=P.bridgeSend(async()=>png,{});await new Promise(r=>setTimeout(r,20));const n2=decodeURIComponent(log.at(-1).split('nonce=')[1]);
 L.message({origin:O,source:popup,data:{type:'jimmi:ready',nonce:n2}});assert.strictEqual(popup.sent[0][0].design.idempotencyKey,m.design.idempotencyKey,'same id on retry');
 L.message({origin:O,source:popup,data:{type:'jimmi:complete',nonce:n2,job:{renders:['https://files.cdn.printful.com/x.png']}}});const job=await p2;assert.strictEqual(job.renders.length,1);
 const p3=P.bridgeSend(async()=>png,{});await new Promise(r=>setTimeout(r,20));assert.strictEqual(popup.sent.length,0,'completed id not resent');assert.strictEqual(await p3,job);
 // error + popup blocked
 const p4=P.bridgeSend(async()=>new Blob([new Uint8Array([1,2])],{type:'image/png'}),{});await new Promise(r=>setTimeout(r,20));const n4=decodeURIComponent(log.at(-1).split('nonce=')[1]);
 L.message({origin:O,source:popup,data:{type:'jimmi:error',nonce:n4,error:'Printful said no'}});await assert.rejects(p4,/Printful said no/);
 W.open=()=>null;await assert.rejects(P.bridgeSend(async()=>png),/blocked the private Printful popup/);
 assert.ok(P.okRender('https://printful-upload.s3-accelerate.amazonaws.com/a')&&!P.okRender('http://files.cdn.printful.com/a')&&!P.okRender('https://files.cdn.printful.com:444/a'));
 console.log('bridge client tests OK');process.exit(0);})().catch(e=>{console.error(e);process.exit(1);});

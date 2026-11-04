const C='jimmi-v20';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./','index.html','styles.css','products.js','manifest.webmanifest','icon-192.png','studio.html','studio.css','studio.js','assets/studio/logo-body.png','assets/studio/logo-hair.png','assets/studio/wordmark.png'])));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim();});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||r.headers.has('range'))return;
e.respondWith(fetch(r).then(res=>{if(res.ok&&new URL(r.url).origin===location.origin){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp));}return res;})
.catch(()=>caches.match(r).then(m=>m||(r.mode==='navigate'?caches.match('index.html'):undefined))));});

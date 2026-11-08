// node desk/tools/test_printful.js — unit tests for the Printful export helpers (no browser)
const fs=require('fs'),path=require('path'),zlib=require('zlib'),assert=require('assert');const D=path.join(__dirname,'..');
const W={JimmiRender:{C:{}},addEventListener(){}};const doc={querySelector:()=>null,createElement:()=>({}),head:{appendChild(){}},addEventListener(){},body:{}};
new Function('window','document',fs.readFileSync(path.join(D,'printful.js'),'utf8'))(W,doc);const P=W.JIMMI_PRINTFUL;
assert.strictEqual(P.crc(Buffer.from('IEND')),0xae426082);
// build a 2x1 RGBA png, inject DPI, check structure
const chunk=(t,d)=>{const b=Buffer.alloc(12+d.length);b.writeUInt32BE(d.length);b.write(t,4);d.copy(b,8);b.writeUInt32BE(P.crc(b.subarray(4,8+d.length)),8+d.length);return b;};
const ih=Buffer.alloc(13);ih.writeUInt32BE(2);ih.writeUInt32BE(1,4);ih[8]=8;ih[9]=6;
const png=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ih),chunk('IDAT',zlib.deflateSync(Buffer.from([0,255,0,0,255,0,0,0,0])) ),chunk('IEND',Buffer.alloc(0))]);
const o=Buffer.from(P.withDpi(new Uint8Array(png),300));assert.strictEqual(o.subarray(37,41).toString(),'pHYs');assert.strictEqual(o.readUInt32BE(41),11811);
fs.writeFileSync('/tmp/pf-dpi-test.png',o);
assert.ok(P.quality({srcW:153},2,300).ok===0);assert.ok(P.quality({srcW:3000},10,300).ok===1);assert.ok(P.quality({srcW:null},16,300).ok===1);
const idx=fs.readFileSync(path.join(D,'index.html'),'utf8'),sw=fs.readFileSync(path.join(D,'sw.js'),'utf8');
assert.ok(idx.indexOf('printful.js')>idx.indexOf('app.js'));assert.ok(sw.includes("'printful.js'"));assert.ok(!/jimmi-desk-v30'/.test(sw));
console.log('printful tests OK');
// v32: per-placement design export
{const PR=P.PRODUCTS;assert.strictEqual(PR.leggings.length,0,'no unverified leggings mappings');const L=P.LEG;assert.deepStrictEqual([L.W,L.H,L.dpi],[7200,6225,150]);for(const p of ['right','left']){const xs=P.xsAt(L.safe[p],3500);assert.ok(xs[0]<L.cx[p]&&L.cx[p]<xs[1],'side line inside safe area');}
 assert.strictEqual(PR.tee[0].map.leftSleeve,'sleeve_left');assert.strictEqual(PR.hoodie[0].id,146);
 assert.strictEqual(P.slug('My Teal & Brick Hoodie!'),'my-teal-brick-hoodie');
 const src=fs.readFileSync(path.join(D,'printful.js'),'utf8');assert.ok(!/api\.printful\.com\/(mockup|store|orders|files)/.test(src.replace(/GET https:\/\/api\.printful\.com\/products/,'')),'no Printful API calls');
 assert.ok(!/(token|apikey|api_key|Bearer)\s*[:=]\s*['"][A-Za-z0-9_]{8,}/i.test(src),'no secrets');
 assert.ok(/#pfModal #pfClose\{position:sticky/.test(src),'close button sticky');assert.ok(sw.includes("jimmi-desk-v32"));
 console.log('placement export tests OK');}
{const Y=P.YOGA;assert.deepStrictEqual([Y.W,Y.H,Y.bands.front.W,Y.bands.front.H,Y.bands.back.W,Y.bands.back.H],[7050,6150,3000,1050,2400,900]);assert.strictEqual(P.LEG_PROFILES.length,3);
 for(const p of ['right','left']){const xs=P.xsAt(Y.safe[p],3000);assert.ok(xs[0]<Y.cx[p]&&Y.cx[p]<xs[1]);}assert.ok(/AOP_Yoga_leggings_guideline\.zip/.test(Y.tpl));console.log('yoga profile tests OK');}
{const S=P.SHORTS;assert.deepStrictEqual([S.W,S.H,S.dpi,S.cx.right,S.cx.left],[8400,3300,150,2382,6012]);assert.strictEqual(P.LEG_PROFILES.filter(p=>p.garment==='shorts').length,1);for(const p of ['right','left']){const xs=P.xsAt(S.safe[p],2000);assert.ok(xs[0]<S.cx[p]&&S.cx[p]<xs[1]);}console.log('shorts profile tests OK');}

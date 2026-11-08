// node desk/tools/test_printful_canvas.js — pixel/alpha/position test of zoneArt (needs @napi-rs/canvas; skips if absent)
const fs=require('fs'),path=require('path'),assert=require('assert');let CV;try{CV=require(process.env.NAPI_CANVAS||'@napi-rs/canvas');}catch(e){console.log('skip: @napi-rs/canvas not installed');process.exit(0);}
const {createCanvas,Path2D}=CV;global.Path2D=Path2D;
const doc={querySelector:()=>null,createElement:t=>t==='canvas'?createCanvas(1,1):{},head:{appendChild(){}},addEventListener(){},body:{}};
const ZONES={front:{n:'Front body',rect:[178,170,244,325],inch:[12,16]},leftLeg:{n:'Left leg',rect:[300,138,150,612],inch:[7,30]}};
const W={JimmiRender:{C:{},ZONES,EL:{logo:{n:'Logo'}},dims:()=>[20,20],drawEl:(x,s)=>{x.fillStyle=s.colors.body;x.fillRect(s.x-10,s.y-10,20,20);}},JIMMI_IMG:{body:{naturalWidth:684,naturalHeight:737}}};
new Function('window','document',fs.readFileSync(path.join(__dirname,'..','printful.js'),'utf8'))(W,doc);const P=W.JIMMI_PRINTFUL;
const d={zones:{front:[{el:'logo',x:300,y:332.5,colors:{body:'#ff0000'},z:1}],leftLeg:[{el:'logo',x:375,y:200,colors:{body:'#00ff00'}}]}};
let c=P.zoneArt(d,'front',{w:3600,h:4800}),x=c.getContext('2d'),a=(X,Y)=>x.getImageData(X,Y,1,1).data;
assert.strictEqual(c.width,3600);assert.strictEqual(c.height,4800);
assert.deepStrictEqual([...a(1800,2400)],[255,0,0,255],'art centered where it sits in the zone');
assert.strictEqual(a(0,0)[3],0);assert.strictEqual(a(3599,4799)[3],0);assert.strictEqual(a(1800,2400+200)[3],0,'nothing outside the sticker');
c=P.zoneArt(d,'front',{w:3600,h:4800,base:'#112233'});assert.deepStrictEqual([...c.getContext('2d').getImageData(0,0,1,1).data],[17,34,51,255],'AOP base fill');
// non-matching aspect: centered contain
c=P.zoneArt(d,'leftLeg',{w:2000,h:2000});const k=2000/612,ox=(2000-150*k)/2,px=Math.round(ox+(375-300)*k),py=Math.round((200-138)*k);assert.strictEqual(c.getContext('2d').getImageData(px,py,1,1).data[1],255);
// source-based warning: logo 684/737px stretched across ~12in -> soft
assert.strictEqual(P.zoneWarnings({zones:{front:[{el:'logo'}]}},'front').length,0,'20 units ~1in -> sharp');
W.JimmiRender.dims=()=>[244,244];assert.strictEqual(P.zoneWarnings({zones:{front:[{el:'logo'}]}},'front').length,1,'12in from 737px -> warn');
console.log('canvas zoneArt tests OK');

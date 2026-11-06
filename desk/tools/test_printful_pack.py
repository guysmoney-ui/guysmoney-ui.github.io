# python3 desk/tools/test_printful_pack.py — checks every Printful download is a real transparent artwork-only PNG
import json,os
from PIL import Image
D=os.path.join(os.path.dirname(__file__),'..','printful');m=json.load(open(os.path.join(D,'manifest.json')))
assert len(m['files'])==19
for f in m['files']:
  assert 'preview' not in f['png'].lower() and 'contact' not in f['png'].lower()
  im=Image.open(os.path.join(D,f['png']));assert im.mode=='RGBA',f
  a=im.getchannel('A');lo,hi=a.getextrema();assert lo==0 and hi==255,f   # real transparency + real art
  for c in [(0,0),(im.width-1,0),(0,im.height-1),(im.width-1,im.height-1)]:assert a.getpixel(c)==0,(f,c)  # no background
  if 'svg' in f:assert os.path.getsize(os.path.join(D,f['svg']))>200
print('pack OK')

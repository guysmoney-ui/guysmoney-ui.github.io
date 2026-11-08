#!/usr/bin/env python3
"""Rebuild inbox/index.json + inbox/inbox.js from inbox/*.jimmi.json"""
import json,glob,os,datetime
here=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','inbox');items=[]
for f in sorted(glob.glob(os.path.join(here,'*.jimmi.json'))):
  d=json.load(open(f));items.append(dict(file=os.path.basename(f),name=d['name'],notes=d.get('notes',''),base=d['colors']['base'],accent=d['colors']['logo'],design=d))
json.dump(dict(updated=datetime.datetime.now().astimezone().isoformat(timespec='seconds'),designs=[{k:v for k,v in i.items() if k!='design'} for i in items]),open(os.path.join(here,'index.json'),'w'),indent=2)
open(os.path.join(here,'inbox.js'),'w').write('window.JIMMI_INBOX='+json.dumps(items)+';');print(len(items),'designs')

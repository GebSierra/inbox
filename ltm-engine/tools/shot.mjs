import { chromium } from '/home/claude/colossae/node_modules/playwright-core/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const root='/home/claude/colossae', out=process.argv[2];
const srv=http.createServer((q,r)=>{const u=q.url.split('?')[0];const f=path.join(root,decodeURIComponent(u==='/'?'index.html':u));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);return r.end()}const ct={'.js':'text/javascript','.json':'application/json','.gltf':'model/gltf+json','.glb':'model/gltf-binary','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp'}[path.extname(f)]||(f.endsWith('.html')?'text/html':'application/octet-stream');r.writeHead(200,{'content-type':ct});r.end(d)})}).listen(8765);
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1280,height:720}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('http://localhost:8765/?notut');await p.waitForFunction(()=>window.__ready,null,{timeout:60000}).catch(()=>{});
const views={aerial:[-40,70,140,30,0,0],market:[1.2,1.75,68.5,-7,1.3,64],house:[24,13,30,32,3,0],bridge:[66,3.5,34,63,0,1],temple:[0,4.5,16,0,3,-6]};
for(const [k,v] of Object.entries(views)){await p.evaluate(v=>window.__cam(...v),v);await p.waitForTimeout(4000);await p.screenshot({path:`${out}/${k}.png`});}
console.log('ERR',errs.join('\n'));await b.close();srv.close();

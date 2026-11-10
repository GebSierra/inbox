import { chromium } from '/home/claude/colossae/node_modules/playwright-core/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const root='/home/claude/colossae';
const srv=http.createServer((q,r)=>{const u=q.url.split('?')[0];const f=path.join(root,decodeURIComponent(u==='/'?'index.html':u));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);return r.end()}const ct={'.js':'text/javascript','.glb':'model/gltf-binary','.webp':'image/webp','.json':'application/json','.gltf':'model/gltf+json','.jpg':'image/jpeg','.png':'image/png'}[path.extname(f)]||(f.endsWith('.html')?'text/html':'application/octet-stream');r.writeHead(200,{'content-type':ct});r.end(d)})}).listen(8775);
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:900,height:560}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8775/?notut&fast');await p.evaluate(()=>{try{localStorage.setItem('colossae-nums','0');localStorage.setItem('colossae-gems','1')}catch(e){}});await p.reload();await p.waitForFunction(()=>window.__ready,null,{timeout:200000}).catch(()=>{console.log('NOTREADY',errs);process.exit(0)});
console.log('CRATES',JSON.stringify(await p.evaluate(()=>window.__crates&&[window.__crates.low.length,window.__crates.high.length])));
for(const i of process.argv.slice(2).map(Number)){await p.evaluate(i=>window.__go(i),i);await p.waitForFunction(()=>!window.__state().moving,null,{timeout:90000}).catch(()=>{});await p.waitForTimeout(500);await p.screenshot({path:root+'/shots/c'+i+'.png'});console.log(i,await p.evaluate(()=>document.querySelector('#hud').innerText.replace(/\n/g,' | ')));}
console.log('ERR',errs);await b.close();srv.close();

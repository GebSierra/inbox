import { chromium } from '/home/claude/colossae/node_modules/playwright-core/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const root='/home/claude/colossae', out=root+'/shots/walk';fs.mkdirSync(out,{recursive:true});
const srv=http.createServer((q,r)=>{const u=q.url.split('?')[0];const f=path.join(root,decodeURIComponent(u==='/'?'index.html':u));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);return r.end()}const ct={'.js':'text/javascript','.json':'application/json','.gltf':'model/gltf+json','.bin':'application/octet-stream','.jpg':'image/jpeg','.png':'image/png'}[path.extname(f)]||'text/html';r.writeHead(200,{'content-type':ct});r.end(d)})}).listen(8771);
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:640,height:400}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8771/?notut&fast');await p.waitForFunction(()=>window.__ready,null,{timeout:240000});
const A=+(process.argv[2]||0),B=+(process.argv[3]||99);if(A===0)console.log('BLOCKERS',JSON.stringify(await p.evaluate(()=>window.__blockers()),null,1));
const n=await p.evaluate(()=>window.__state().n);
for(let i=A;i<Math.min(n,B);i++){await p.evaluate(i=>window.__go(i),i);await p.waitForFunction(()=>!window.__state().moving,null,{timeout:90000}).catch(()=>{});await p.waitForTimeout(600);await p.screenshot({path:`${out}/${String(i).padStart(2,'0')}.png`});console.log(i,(await p.evaluate(()=>window.__state().hud)));}


console.log('ERR',errs);await b.close();srv.close();

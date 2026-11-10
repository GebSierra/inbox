// Tiny static server with the content types three.js loaders need.
// Serves the REPOSITORY ROOT (the folder that holds ltm-engine/ and the town folders), so a town's
// page can reach ../ltm-engine/ exactly as it will on GitHub Pages (https://gebsierra.github.io/inbox/<town>/).
// Usage: import { serve } from './serve.mjs'; const { url, close } = serve(port);  // url ends with '/'; append '<town>/index.html'
import http from 'http'; import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
export const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.gltf': 'model/gltf+json', '.glb': 'model/gltf-binary', '.bin': 'application/octet-stream', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
// opts.root: directory to serve (default REPO); opts.patch(urlPath, buffer) -> buffer|undefined lets a test rewrite a response.
export function serve(port = 8790, opts = {}) { const root = opts.root || REPO;
  const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]); let f = path.join(root, u);
    if (u.endsWith('/')) f = path.join(f, 'index.html');
    if (!f.startsWith(root)) { r.writeHead(403); return r.end(); }
    fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } if (opts.patch) d = opts.patch(u, d) || d;
      r.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream', 'cache-control': 'no-store' }); r.end(d); }); }).listen(port);
  return { url: `http://localhost:${port}/`, close: () => srv.close() }; }

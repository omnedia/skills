import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {randomBytes} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {skillRoot, readJson, writeJson, loadConfig} from './core.mjs';

export function startGallery(runFile, {catalog = readJson(path.join(skillRoot, 'styles/catalog.json')), port = 0, onSelection = () => {}} = {}) {
  const token = randomBytes(24).toString('hex');
  readJson(runFile); // Fail early if the run is not readable.
  const config = loadConfig();
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    if (url.searchParams.get('token') !== token) {res.writeHead(403).end(); return;}
    res.setHeader('Cache-Control', 'no-store');
    if (req.method === 'GET' && url.pathname === '/') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(fs.readFileSync(path.join(skillRoot, 'assets/gallery/index.html'))); return;
    }
    if (req.method === 'GET' && url.pathname === '/catalog') {
      const run = readJson(runFile);
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({catalog: catalog.map(s => ({...s, previewAvailable: !!s.preview && fs.existsSync(path.join(skillRoot, s.preview))})),
        brandColors: run.brandColors ?? config.brandColors, selected: run.style, colors: run.colors})); return;
    }
    const style = catalog.find(s => s.id === url.searchParams.get('id'));
    if (req.method === 'GET' && url.pathname === '/preview' && style?.preview) {
      try {res.setHeader('Content-Type', 'image/gif'); res.end(fs.readFileSync(path.join(skillRoot, style.preview)));}
      catch {res.writeHead(404).end();} return;
    }
    if (req.method === 'GET' && url.pathname === '/font') {
      const selected = style ?? catalog.find(s => s.id === 'active-word-highlight');
      const role = url.searchParams.get('role') ?? 'primary';
      const entry = selected?.fontManifest ? readJson(path.join(skillRoot, selected.fontManifest)).fonts[role] : null;
      const file = entry ? `styles/${selected.id}/${entry.asset}` : selected?.font;
      if (!file) {res.writeHead(404).end(); return;}
      res.setHeader('Content-Type', file.endsWith('.ttf') ? 'font/ttf' : 'font/woff2'); res.end(fs.readFileSync(path.join(skillRoot, file))); return;
    }
    if (req.method === 'POST' && url.pathname === '/select') {
      if (req.headers.origin && req.headers.origin !== `http://127.0.0.1:${server.address().port}`) {res.writeHead(403).end(); return;}
      try {
        let body = '';
        for await (const chunk of req) {body += chunk; if (body.length > 8192) throw new Error('Selection too large');}
        const selection = JSON.parse(body);
        const selected = catalog.find(s => s.id === selection.style);
        if (!selected) throw new Error('Unknown style');
        for (const role of Object.keys(selected.colors)) if (!/^#[a-f0-9]{6}$/i.test(selection.colors?.[role])) throw new Error(`Choose a color for ${role}`);
        const current = readJson(runFile);
        current.style = selected.id;
        current.colors = Object.fromEntries(Object.keys(selected.colors).map(role => [role, selection.colors[role]]));
        current.colorsAccepted = true;
        writeJson(runFile, current);
        res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({saved: true, style: current.style}));
        onSelection({event:'selection-saved', runFile:path.resolve(runFile), style:current.style, colors:current.colors});
      } catch (error) {res.writeHead(400).end(error.message);}
      return;
    }
    res.writeHead(404).end();
  });
  return new Promise(resolve => server.listen(port, '127.0.0.1', () => resolve({server, url: `http://127.0.0.1:${server.address().port}/?token=${token}`})));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const {url} = await startGallery(process.argv[2], {onSelection: selection => console.log(JSON.stringify(selection))}); console.log(url);
}

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {randomBytes} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {skillRoot,readJson,writeJson,resolveSettings} from './core.mjs';
export async function startGallery(runFile,{port=0,onSelection=()=>{}}={}){
 const token=randomBytes(24).toString('hex'),catalog=readJson(path.join(skillRoot,'styles/catalog.json'));
 const run=readJson(runFile);run.pickerOpened=true;run.colorsAccepted=false;writeJson(runFile,run);
 const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url,'http://127.0.0.1');res.setHeader('Cache-Control','no-store');
  if(url.searchParams.get('token')!==token){res.writeHead(403).end();return;}
  if(req.method==='GET'&&url.pathname==='/'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(fs.readFileSync(path.join(skillRoot,'assets/gallery/index.html')));return;}
  if(req.method==='GET'&&url.pathname==='/catalog'){const r=readJson(runFile);res.setHeader('Content-Type','application/json');res.end(JSON.stringify({catalog,colors:resolveSettings({...r,pickerOpened:false}).colors,previewAvailable:fs.existsSync(path.join(skillRoot,catalog[0].preview))}));return;}
  if(req.method==='GET'&&url.pathname==='/preview'){const file=path.join(skillRoot,catalog[0].preview);if(!fs.existsSync(file)){res.writeHead(404).end();return;}res.setHeader('Content-Type','video/mp4');fs.createReadStream(file).pipe(res);return;}
  if(req.method==='POST'&&url.pathname==='/select'){
   if(req.headers.origin&&req.headers.origin!==`http://127.0.0.1:${server.address().port}`){res.writeHead(403).end();return;}
   try{let body='';for await(const chunk of req){body+=chunk;if(body.length>8192)throw Error('Selection too large');}const selection=JSON.parse(body),style=catalog[0];if(selection.style!==style.id)throw Error('Unsupported style');for(const role of Object.keys(style.colors))if(!/^#[a-f\d]{6}$/i.test(selection.colors?.[role]))throw Error(`Choose ${role}`);
    const r=readJson(runFile);r.style=style.id;r.colors=Object.fromEntries(Object.keys(style.colors).map(k=>[k,selection.colors[k]]));r.colorsAccepted=true;writeJson(runFile,r);res.setHeader('Content-Type','application/json');res.end(JSON.stringify({saved:true}));onSelection({event:'selection-saved',runFile:path.resolve(runFile),style:r.style});
   }catch(e){res.writeHead(400).end(e.message);}return;
  }res.writeHead(404).end();
 });
 await new Promise(resolve=>server.listen(port,'127.0.0.1',resolve));return {server,url:`http://127.0.0.1:${server.address().port}/?token=${token}`};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const {url}=await startGallery(process.argv[2],{onSelection:e=>console.log(JSON.stringify(e))});console.log(url);}

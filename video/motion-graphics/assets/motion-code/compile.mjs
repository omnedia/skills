import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {openBrowser} from '@remotion/renderer';
import {inputs} from './project.mjs';
import {writeJson,hash} from './io.mjs';
import {compileLayout} from './layout.mjs';
import {validatePlan} from './contract.mjs';
export async function compile(root){
  process.chdir(root);
  const data=inputs(root),font=data.font;
  if(validatePlan(data.plan,data.source,data.settings,data.catalog).status!=='validated')throw Error('Word timestamps required before synchronized compilation');
  const texts=data.plan.graphicsPlan.scenes.flatMap(s=>[s.content?.label,s.sourceLabel,...(s.content?.nodes??[]),...(s.annotations??[]).map(a=>a.label),...(s.titles??[]).map(t=>t.text)]).filter(Boolean);
  // The local font's cmap is recorded with its checksum; unsupported glyphs fail, never silently fall back.
  for(const text of texts)for(const c of text)if(!font.codepoints.includes(c.codePointAt(0)))throw Error(`Unsupported glyph ${c}; provide a licensed covering font and update its manifest`);
  const browser=await openBrowser('chrome');
  try{
    const page=await browser.newPage({context:()=>null,logLevel:'error',indent:false,pageIndex:0,onBrowserLog:null,onLog:()=>{}});
    const base64=fs.readFileSync(path.join(root,'public',font.asset)).toString('base64');
    const modules=Object.fromEntries(['contract.mjs','src/state.mjs','layout.mjs'].map(f=>[f,fs.readFileSync(path.join(root,'motion',f),'utf8')]));
    const graphicsPlan=await page.evaluate(async (data,base64,modules)=>{
      const font=new FontFace(data.font.family,`url(data:font/woff2;base64,${base64})`,{weight:'700'});document.fonts.add(await font.load());await document.fonts.ready;
      const uri=s=>'data:text/javascript;base64,'+btoa(unescape(encodeURIComponent(s)));
      const layout=modules['layout.mjs'].replace("'./src/state.mjs'",JSON.stringify(uri(modules['src/state.mjs']))).replace("'./contract.mjs'",JSON.stringify(uri(modules['contract.mjs'])));
      const {compileLayout}=await import(uri(layout)),ctx=document.createElement('canvas').getContext('2d');
      return compileLayout(data.plan,data.source,data.settings,data.catalog,(text,size)=>{for(const c of text)if(!data.font.codepoints.includes(c.codePointAt(0)))throw Error('Unsupported glyph '+c);ctx.font=`700 ${size}px "${data.font.family}"`;const m=ctx.measureText(text);return Math.max(m.width,m.actualBoundingBoxLeft+m.actualBoundingBoxRight);});
    },data,base64,modules);
    const project={schemaVersion:1,settings:data.settings,assets:data.assets,font,identity:data.identity,fingerprint:data.fingerprint,sourceFingerprint:hash(data.source),planFingerprint:hash(data.plan),graphicsPlan,compiledHash:hash(graphicsPlan)};
    writeJson(path.join(root,'project.json'),project);
    // Studio imports an immutable compiled snapshot. Its entry is refreshed only by compile.
    // Keep derived snapshots outside the fingerprinted renderer source directory.
    writeJson(path.join(root,'compiled-motion.json'),project);
    return project;
  }finally{await browser.close({silent:true});}
}
if(process.argv[1]===fileURLToPath(import.meta.url))await compile(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'));

// Runs once before Studio/export, writes shaped geometry to project.json. Never called by React.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {openBrowser} from '@remotion/renderer';
import {planYellow} from './src/captions/yellow.mjs';

export async function prepareYellowProject(root,{demonstrationPlan}={}){
  const file=path.join(root,'project.json'),data=JSON.parse(fs.readFileSync(file,'utf8'));
  if(data.settings.style!=='yellow-authority')return data;
  const fonts=data.settings.fonts;
  const module=fs.readFileSync(path.join(root,'src/captions/yellow.mjs'),'utf8');
  const fingerprint=createHash('sha256').update(module).update(JSON.stringify({sentences:data.sentences,options:data.settings.styleOptions,colors:data.settings.colors,fonts,demonstrationPlan})).digest('hex');
  for(const f of Object.values(fonts))if(createHash('sha256').update(fs.readFileSync(path.join(root,'public',f.asset))).digest('hex')!==f.sha256)throw Error(`Font checksum mismatch: ${f.asset}`);
  if(data.settings.yellowPlan?.fingerprint===fingerprint&&data.settings.yellowPlan.measured)return data;
  const plan=demonstrationPlan??planYellow(data.sentences,data.settings.styleOptions);
  const fontData=Object.fromEntries(Object.entries(fonts).map(([role,f])=>[role,{...f,base64:fs.readFileSync(path.join(root,'public',f.asset)).toString('base64')}]));
  const browser=await openBrowser('chrome');
  try{
    const page=await browser.newPage({context:()=>null,logLevel:'error',indent:false,pageIndex:0,onBrowserLog:null,onLog:()=>{}});
    const measured=await page.evaluate(async (source,plan,fontData,colors)=>{
      const {layoutYellow}=await import('data:text/javascript;base64,'+btoa(unescape(encodeURIComponent(source))));
      for(const f of Object.values(fontData)){
        const face=await new FontFace(f.family,`url(data:font/ttf;base64,${f.base64})`,{weight:String(f.weight),style:f.style}).load();document.fonts.add(face);
        await document.fonts.load(`${f.style} ${f.weight} 48px "${f.family}"`);
      }
      const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
      return layoutYellow(plan,(text,role,size,tracking)=>{
        const f=fontData[role],missing=[...new Set([...text].filter(c=>!f.codepoints.includes(c.codePointAt(0))))];
        if(missing.length)throw Error(`${f.family}: missing glyphs ${missing.map(c=>'U+'+c.codePointAt(0).toString(16).toUpperCase()).join(', ')}`);
        ctx.font=`${f.style} ${f.weight} ${size}px "${f.family}"`;ctx.fontKerning='normal';ctx.letterSpacing=`${tracking}px`;
        const m=ctx.measureText(text);return {width:m.width,left:m.actualBoundingBoxLeft,right:m.actualBoundingBoxRight,ascent:m.actualBoundingBoxAscent,descent:m.actualBoundingBoxDescent};
      },colors);
    },module,plan,fontData,data.settings.colors);
    measured.fingerprint=fingerprint;data.settings.yellowPlan=measured;
    data.settings.durationInFrames=Math.ceil((Math.max(...measured.groups.map(g=>g.endMs))+data.settings.sourceOffsetMs)*data.settings.fps/1000);
    const temp=file+'.planning.tmp';fs.writeFileSync(temp,JSON.stringify(data,null,2)+'\n');fs.renameSync(temp,file);
    return data;
  }finally{await browser.close({silent:true});}
}
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url)await prepareYellowProject(path.dirname(fileURLToPath(import.meta.url)));

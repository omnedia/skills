// Developer maintenance: node scripts/vermilion-gallery.mjs <exposed Remotion SKILL.md> <existing runtime>
// Runtime/dependencies and alpha output stay outside the installed skill.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {skillRoot,readJson,writeJson,loadConfig,prepareProject,attachProject,command} from './core.mjs';
const root=fs.mkdtempSync(path.join(os.tmpdir(),'vermilion-gallery-'));
const transcript=readJson(path.join(skillRoot,'preview-transcript.json'));
const sentences=[{words:transcript.words.map((w,i)=>({text:(i?' ':'')+w.text,startMs:Math.round(w.start*1000),endMs:Math.round(w.end*1000),timestampMs:null,confidence:null}))}];
writeJson(path.join(root,'transcript.json'),{sentences});
// Same gallery crop as Editorial / Brunson. Compact framing overrides only; exact source words/times.
const styleOptions={anchor:{x:.5,y:1150/1920},roles:{hero:{size:180},supporting:{size:125},emphasis:{size:175},connector:{size:130}},
  phrases:{0:{template:'overlap'},3:{mode:'stack',template:'downward',defaults:{size:110,travel:0}}}};
const run={plugin:{availableInApp:true,checkedAt:new Date().toISOString(),instructionPath:path.resolve(process.argv[2])},
  projectName:'vermilion-gallery',style:'vermilion-brush-editorial',colorsAccepted:true,normalizedPath:path.join(root,'transcript.json'),
  timing:{status:'word-timing-reviewed',provenance:'Shared preview-transcript.json supplied word timestamps in seconds'},
  width:1080,height:1920,fps:60,export:{scale:1},styleOptions};
const checkRuntime=()=>({node:process.version,purpose:'Reuse available Remotion runtime for gallery maintenance'});
const prepared=prepareProject(run,{saved:{...loadConfig(),projectFolder:root},checkRuntime});
const project=prepared.projectPath,runtime=path.resolve(process.argv[3]);
fs.mkdirSync(project,{recursive:true});
for(const file of ['package.json','tsconfig.json'])fs.copyFileSync(path.join(runtime,file),path.join(project,file));
const pkg=readJson(path.join(project,'package.json'));
for(const key of Object.keys(pkg.scripts??{}))if(key.startsWith('captions:'))delete pkg.scripts[key];
writeJson(path.join(project,'package.json'),pkg);
fs.symlinkSync(path.join(runtime,'node_modules'),path.join(project,'node_modules'),process.platform==='win32'?'junction':'dir');
attachProject({...run,...prepared},{checkRuntime});
writeJson(path.join(project,'run.json'),{...run,...prepared});
process.chdir(project);
command(process.execPath,[path.join(project,'node_modules/typescript/bin/tsc'),'--noEmit']);
const load=p=>import(pathToFileURL(path.join(project,'node_modules',p)));
const {bundle}=await load('@remotion/bundler/dist/index.js');
const {renderMedia,selectComposition,renderStill}=await load('@remotion/renderer/dist/index.js');
const serveUrl=await bundle({entryPoint:path.join(project,'src/captions/index.tsx'),publicDir:path.join(project,'public')});
const props=readJson(path.join(project,'project.json'));
const composition=await selectComposition({serveUrl,id:'Captions',inputProps:props});
console.log(JSON.stringify({project,frames:composition.durationInFrames}));
await renderMedia({serveUrl,composition,inputProps:props,outputLocation:path.join(project,'captions.mov'),codec:'prores',proResProfile:'4444',pixelFormat:'yuva444p10le',imageFormat:'png',concurrency:2});
const previewProps={...props,previewBackground:'#22242e'};
const previewComposition=await selectComposition({serveUrl,id:'Captions',inputProps:previewProps});
const outputLocation=path.join(project,'preview.mp4');
await renderMedia({serveUrl,composition:previewComposition,inputProps:previewProps,outputLocation,codec:'h264',crf:16,concurrency:2});
const gif=path.join(skillRoot,'styles/vermilion-brush-editorial/preview.gif');
command('ffmpeg',['-v','error','-y','-i',outputLocation,'-t',String(transcript.duration),'-vf','crop=1080:700:0:800,scale=540:350,fps=20,split[x][y];[x]palettegen[p];[y][p]paletteuse','-loop','0',gif]);
// Identical requested PNGs through sequential and shuffled seeks, including entrances, gap, and stack.
for(const [name,frames]of [['sequential',[3,90,156,390]],['shuffled',[390,3,156,90]]]){
  for(const frame of frames)await renderStill({serveUrl,composition,inputProps:props,frame,imageFormat:'png',output:path.join(project,`${name}-${frame}.png`)});
}
for(const frame of [3,90,156,390])if(!fs.readFileSync(path.join(project,`sequential-${frame}.png`)).equals(fs.readFileSync(path.join(project,`shuffled-${frame}.png`))))throw Error(`Seek mismatch: ${frame}`);
writeJson(path.join(project,'gallery.json'),{project,gif,alpha:path.join(project,'captions.mov'),width:540,height:350,background:'#22242e',gifFps:20,source: 'preview-transcript.json',words:transcript.words.length,seekFrames:[3,90,156,390]});
console.log(JSON.stringify({project,gif,alpha:path.join(project,'captions.mov'),verifiedSeeks:true}));

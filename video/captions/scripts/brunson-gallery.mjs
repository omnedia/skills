// Rebuild the gallery GIF with a plugin-created Remotion runtime outside this skill.
// Usage: node scripts/brunson-gallery.mjs <current Remotion SKILL.md> <runtime project>
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {skillRoot,writeJson,loadConfig,prepareProject,attachProject,command} from './core.mjs';

const root=fs.mkdtempSync(path.join(os.tmpdir(),'brunson-gallery-'));
const transcript=JSON.parse(fs.readFileSync(path.join(skillRoot,'styles/brunson-red-script/preview-transcript.json')));
const sentences=[[0,7],[7,11],[11,15],[15,22]].map(([from,to])=>({words:transcript.words.slice(from,to).map((w,i)=>({
  text:(i?' ':'')+w.text,startMs:Math.round(w.start*1000),endMs:Math.round(w.end*1000),timestampMs:null,confidence:null,
}))}));
const headline=(from,to,line,size=150)=>({from,to,line,size,role:'headline',region:'title'});
const regions={title:{anchor:{x:.5,y:.565},rowGap:22,wordGap:25},accent:{anchor:{x:.5,y:.649}}};
const styleOptions={anchors:{default:{x:.5,y:1150/1920}},sizes:{default:90},phrases:{
  0:{mode:'hero',regions,groups:[headline(0,1,0),headline(1,2,0),headline(2,3,0),
    headline(3,4,1,125),headline(4,5,1,125),headline(5,6,1,125),{from:6,to:7,role:'script',region:'accent',size:160}]},
  1:{mode:'default'},
  2:{mode:'default'},
  3:{mode:'hero',regions,groups:[headline(0,1,0,125),headline(1,2,0,125),headline(2,3,1),headline(3,4,1),
    headline(4,5,2,125),headline(5,6,2,125),{from:6,to:7,role:'script',region:'accent',size:160,offset:{x:180,y:20}}]},
}};
writeJson(path.join(root,'transcript.json'),{sentences});
const run={plugin:{availableInApp:true,checkedAt:new Date().toISOString(),instructionPath:path.resolve(process.argv[2])},
  projectName:'brunson-gallery',style:'brunson-red-script',colorsAccepted:true,normalizedPath:path.join(root,'transcript.json'),
  timing:{status:'word-timing-reviewed',provenance:'User supplied exact 9-second word timings'},
  width:1080,height:1920,fps:60,export:{scale:1},styleOptions};
const checkRuntime=()=>({node:process.version,purpose:'Reuse plugin-created Remotion runtime'});
const prepared=prepareProject(run,{saved:{...loadConfig(),projectFolder:root},checkRuntime});
const project=prepared.projectPath,runtime=path.resolve(process.argv[3]);
fs.mkdirSync(project,{recursive:true});
for(const file of ['package.json','tsconfig.json'])fs.copyFileSync(path.join(runtime,file),path.join(project,file));
const pkg=JSON.parse(fs.readFileSync(path.join(project,'package.json')));
for(const key of Object.keys(pkg.scripts??{}))if(key.startsWith('captions:'))delete pkg.scripts[key];
writeJson(path.join(project,'package.json'),pkg);
fs.symlinkSync(path.join(runtime,'node_modules'),path.join(project,'node_modules'),process.platform==='win32'?'junction':'dir');
attachProject({...run,...prepared},{checkRuntime});
const props=JSON.parse(fs.readFileSync(path.join(project,'project.json')));
props.previewBackground='#22242e';
writeJson(path.join(project,'project.json'),props);
writeJson(path.join(project,'run.json'),{...run,...prepared});
process.chdir(project);
const load=p=>import(pathToFileURL(path.join(project,'node_modules',p)));
const {bundle}=await load('@remotion/bundler/dist/index.js');
const {renderMedia,selectComposition}=await load('@remotion/renderer/dist/index.js');
const serveUrl=await bundle({entryPoint:path.join(project,'src/captions/index.tsx'),publicDir:path.join(project,'public')});
const composition=await selectComposition({serveUrl,id:'Captions'});
const outputLocation=path.join(project,'preview.mp4');
console.log(`Rendering ${composition.durationInFrames} frames: ${project}`);
await renderMedia({serveUrl,composition,outputLocation,codec:'h264',crf:16,concurrency:2});
const gif=path.join(skillRoot,'styles/brunson-red-script/preview.gif');
command('ffmpeg',['-v','error','-y','-i',outputLocation,'-vf',
  'crop=1080:700:0:800,scale=540:350,fps=20,split[x][y];[x]palettegen[p];[y][p]paletteuse','-loop','0',gif]);
writeJson(path.join(project,'gallery.json'),{duration:transcript.duration,width:540,height:350,sourceFps:60,gifFps:20,words:transcript.words.length,gif});
console.log(JSON.stringify({project,outputLocation,gif}));

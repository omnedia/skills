// Real-font / rendering verification against an already rendered maintenance project.
// node scripts/yellow-verify.mjs <yellow-gallery-project>
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {skillRoot,readJson,writeJson,command} from './core.mjs';
import {isolated,timedRows,plainEditorialPlan} from '../tests/fixtures/yellow-example.mjs';
import {treatmentDemo} from '../tests/fixtures/yellow-treatments.mjs';
import {yellowDiagnostics,yellowState} from '../assets/caption-code/src/yellow.mjs';
const project=path.resolve(process.argv[2]);
fs.cpSync(path.join(skillRoot,'assets/caption-code/src'),path.join(project,'src/captions'),{recursive:true});
fs.copyFileSync(path.join(skillRoot,'assets/caption-code/yellow-plan.mjs'),path.join(project,'captions-yellow-plan.mjs'));
process.chdir(project);
const {prepareYellowProject}=await import(pathToFileURL(path.join(project,'captions-yellow-plan.mjs')));
const base=readJson(path.join(project,'project.json'));
const measuredFixtures={};
for(const [name,sentences]of Object.entries(isolated)){
  writeJson(path.join(project,'project.json'),{...base,sentences,settings:{...base.settings,styleOptions:{editorialPlan:plainEditorialPlan(sentences)},yellowPlan:undefined}});
  if(name==='long'){await assert.rejects(()=>prepareYellowProject(project),/Unbreakable word/);measuredFixtures[name]='explicit unbreakable-word error';continue;}
  const data=await prepareYellowProject(project),p=data.settings.yellowPlan;
  assert.deepEqual(p.groups.flatMap(g=>g.units.map(u=>u.wordIndex)),p.words.map(w=>w.index));
  assert.ok(p.groups.every(g=>g.units.every(u=>u.ink.left>=48&&u.ink.right<=672)));
  for(const g of p.groups)for(const t of [g.startMs,g.startMs+125,g.endMs-1])assert.deepEqual(yellowState(p,t),yellowState(JSON.parse(JSON.stringify(p)),t));
  measuredFixtures[name]=p.diagnostics;
}
const unsupported=timedRows(['Unsupported 🦄.']);
writeJson(path.join(project,'project.json'),{...base,sentences:unsupported,settings:{...base.settings,styleOptions:{editorialPlan:plainEditorialPlan(unsupported)},yellowPlan:undefined}});
await assert.rejects(()=>prepareYellowProject(project),/missing glyphs U\+1F984/);
const demo=treatmentDemo();
writeJson(path.join(project,'project.json'),{...base,sentences:demo.sentences,settings:{...base.settings,styleOptions:{editorialPlan:plainEditorialPlan(sentences)},yellowPlan:undefined}});
const props=await prepareYellowProject(project,{demonstrationPlan:demo.plan});
command(process.execPath,[path.join(project,'node_modules/typescript/bin/tsc'),'--noEmit']);
const load=p=>import(pathToFileURL(path.join(project,'node_modules',p)));
const {bundle}=await load('@remotion/bundler/dist/index.js');
const {renderStill,selectComposition}=await load('@remotion/renderer/dist/index.js');
const serveUrl=await bundle({entryPoint:path.join(project,'src/captions/index.tsx'),publicDir:path.join(project,'public')});
const composition=await selectComposition({serveUrl,id:'Captions',inputProps:props});
const hero=props.settings.yellowPlan.groups.find(g=>g.template==='reverse-payoff');
const frames=[Math.round((hero.startMs+100)*30/1000),Math.round((hero.startMs+250)*30/1000),Math.round((hero.startMs+600)*30/1000)];
for(const [name,order]of [['linear',frames],['seek',[...frames].reverse()]])for(const frame of order)await renderStill({serveUrl,composition,inputProps:props,frame,imageFormat:'png',output:path.join(project,`${name}-hero-${frame}.png`)});
for(const frame of frames)assert.ok(fs.readFileSync(path.join(project,`linear-hero-${frame}.png`)).equals(fs.readFileSync(path.join(project,`seek-hero-${frame}.png`))));
for(const [name,previewBackground]of [['alpha',undefined],['black','#000000'],['white','#FFFFFF'],['checkerboard','checkerboard']]){
  const p={...props,previewBackground};await renderStill({serveUrl,composition:{...composition,props:p},inputProps:p,frame:frames[1],imageFormat:'png',output:path.join(project,`composite-${name}.png`)});
}
// Contact sheet sources use settled template frames, preserving the actual portrait composition.
for(const [i,g]of props.settings.yellowPlan.groups.entries()){
  const frame=Math.floor((Math.min(g.endMs-30,Math.max(...g.units.map(u=>u.startMs+u.duration))+90))*30/1000);
  const p={...props,previewBackground:'#22242e'};await renderStill({serveUrl,composition:{...composition,props:p},inputProps:p,frame,imageFormat:'png',output:path.join(project,`treatment-${String(i).padStart(2,'0')}.png`)});
}
const report=readJson(path.join(skillRoot,'styles/yellow-authority/verification.json'));
report.editorial=yellowDiagnostics(readJson(path.join(project,'editorial-plan.json')));
report.treatments=props.settings.yellowPlan.diagnostics;report.realFontFixtures=measuredFixtures;report.missingGlyphErrorVerified=true;report.scatteredSeekFrames=frames;
writeJson(path.join(skillRoot,'styles/yellow-authority/verification.json'),report);
console.log(JSON.stringify({project,realFontFixtures:Object.keys(measuredFixtures),missingGlyphErrorVerified:true,scatteredSeekFrames:frames}));

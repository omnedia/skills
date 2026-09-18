// Usage: node scripts/editorial-render-check.mjs <current plugin SKILL.md> [existing test runtime project]
// The optional runtime avoids reinstalling dependencies; output remains an isolated project.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {skillRoot, writeJson, loadConfig, prepareProject, attachProject, command} from './core.mjs';
import {scaffoldForTest} from '../tests/scaffold.mjs';
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'editorial-render-'));
const phrases = ['Alle meine Videos', 'sind meine Untertitel', 'Haupttitel das ist wie eine Überschrift', 'und dann noch Zusatztext'];
const sentences = phrases.map((text, p) => ({words: text.split(' ').map((text, i, all) => ({text: `${i ? ' ' : ''}${text}`, startMs: p*2300+300+i*260, endMs: p*2300+300+i*260+(i===all.length-1?600:230), timestampMs: null, confidence: null}))}));
writeJson(path.join(root, 'fixture.json'), {sentences});
const run = {
  plugin: {availableInApp: true, checkedAt: new Date().toISOString(), instructionPath: path.resolve(process.argv[2])},
  projectName: 'editorial-preview', style: 'editorial-kinetic', colorsAccepted: true,
  normalizedPath: path.join(root, 'fixture.json'), export: {scale: 1},
  timing: {status: 'word-timing-reviewed', provenance: 'Authored synthetic gallery fixture, not inferred speech'},
  styleOptions: {phrases: {
    0: {groupSizes: [1,1,1], underline: 'white'},
    1: {groupSizes: [2,1], underline: 'orange'},
    2: {emphasisIndex: 0, gradient: 'pink', lines: [{count:1,role:'primary'},{count:3,role:'sans'},{count:2,role:'serif'}], groupSizes:[1,3,2], directions:{0:'top',1:'right',4:'left'}},
    3: {gradient:'none', lines:[{count:3,role:'sans'},{count:1,role:'handwritten'}], groupSizes:[3,1]},
  }},
};
const opts = {saved: {...loadConfig(path.join(root, 'unused.json')), projectFolder:root}};
let project;
if (process.argv[3]) {
  const runtime = path.resolve(process.argv[3]);
  const prepared = prepareProject(run, opts);
  project = prepared.projectPath;
  fs.mkdirSync(project, {recursive:true});
  for (const file of ['package.json','tsconfig.json']) fs.copyFileSync(path.join(runtime,file),path.join(project,file));
  fs.symlinkSync(path.join(runtime,'node_modules'),path.join(project,'node_modules'), process.platform==='win32'?'junction':'dir');
  attachProject({...run,...prepared});
  command(process.execPath,[path.join(project,'node_modules/typescript/bin/tsc'),'--noEmit'],{cwd:project});
} else project = scaffoldForTest(run, opts);
process.chdir(project);
const moduleRoot = path.join(project,'node_modules');
const {bundle} = await import(pathToFileURL(path.join(moduleRoot,'@remotion/bundler/dist/index.js')));
const {renderMedia,renderStill,selectComposition} = await import(pathToFileURL(path.join(moduleRoot,'@remotion/renderer/dist/index.js')));
const serveUrl = await bundle({entryPoint:path.join(project,'src/captions/index.tsx'),publicDir:path.join(project,'public')});
const composition = await selectComposition({serveUrl,id:'Captions'});
const outputLocation = path.join(project,'editorial.mov');
console.log(`Rendering ${composition.durationInFrames} frames in ${project}`);
await renderMedia({serveUrl,composition,outputLocation,codec:'prores',proResProfile:'4444',pixelFormat:'yuva444p10le',imageFormat:'png',concurrency:2});
for (const frame of [9,13,20,34,103,155,185,244]) await renderStill({serveUrl,composition,frame,output:path.join(project,`frame-${frame}.png`),imageFormat:'png'});
// Verify an arbitrary backward seek returns byte-identical pixels.
await renderStill({serveUrl,composition,frame:34,output:path.join(project,'seek-34.png'),imageFormat:'png'});
if (!fs.readFileSync(path.join(project,'frame-34.png')).equals(fs.readFileSync(path.join(project,'seek-34.png')))) throw Error('Seek changed rendered pixels');
const gif = path.join(skillRoot,'styles/editorial-kinetic/preview.gif');
command('ffmpeg',['-v','error','-y','-i',outputLocation,'-filter_complex',
  '[0:v]crop=1080:700:0:800,split[a][b];[b]drawbox=c=0x22242e:t=fill:replace=1[bg];[bg][a]overlay=format=auto,scale=540:350,fps=15,split[x][y];[x]palettegen[p];[y][p]paletteuse',gif]);
console.log(JSON.stringify({project,outputLocation,gif}));

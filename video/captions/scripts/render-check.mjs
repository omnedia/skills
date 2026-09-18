// Reproducible integration exercise and shipped GIF generation from the real component.
// Usage: node scripts/render-check.mjs <current Remotion plugin SKILL.md>
import fs from 'node:fs';
import os from 'node:os';
import {scaffoldForTest} from '../tests/scaffold.mjs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {skillRoot, readJson, writeJson, loadConfig, command} from './core.mjs';
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'captions-render-check-'));
fs.mkdirSync(root, {recursive: true});
const run = {
  plugin: {availableInApp: true, checkedAt: new Date().toISOString(), instructionPath: path.resolve(process.argv[2])},
  projectName: 'render-check', style: 'active-word-highlight', colorsAccepted: true,
  export: {scale: 1}, // Gallery fixture stays at reference resolution; scaled export has a separate check.
  normalizedPath: path.join(skillRoot, 'tests/fixtures/normalized.json'),
  timing: {status: 'word-timing-reviewed', provenance: 'Authored timing fixture in tests/fixtures/timed-notes.txt'},
};
const project = scaffoldForTest(run, {saved: {...loadConfig(path.join(root, 'unused-config.json')), projectFolder: root}});
process.chdir(project);
const moduleRoot = path.join(project, 'node_modules');
const {bundle} = await import(pathToFileURL(path.join(moduleRoot, '@remotion/bundler/dist/index.js')));
const {renderMedia, renderStill, selectComposition} = await import(pathToFileURL(path.join(moduleRoot, '@remotion/renderer/dist/index.js')));
const serveUrl = await bundle({entryPoint: path.join(project, 'src/captions/index.tsx'), publicDir: path.join(project, 'public')});
const composition = await selectComposition({serveUrl, id: 'Captions'});
const outputLocation = path.join(project, 'captions.mov');
await renderMedia({serveUrl, composition, outputLocation, codec: 'prores', proResProfile: '4444', pixelFormat: 'yuva444p10le', imageFormat: 'png', concurrency: 2});
for (const frame of [0, 15, 20, 25, 36, 55, 63, 78]) {
  await renderStill({serveUrl, composition, frame, output: path.join(project, `frame-${frame}.png`), imageFormat: 'png'});
}
const data = readJson(path.join(project, 'project.json'));
// Full-size portrait and landscape wrapping samples, using authored test timing only.
const words = 'Readable captions keep punctuation, pauses, and repeated words in their original order, even when a sentence needs several separate caption blocks.'.split(' ').map((text, i) => ({text: `${i ? ' ' : ''}${text}`, startMs: 500 + i * 200, endMs: 650 + i * 200, timestampMs: null, confidence: null}));
for (const [width, height] of [[1080,1920], [1920,1080]]) {
  const inputProps = {...data, settings: {...data.settings, width, height}, sentences: [{words}]};
  await renderStill({serveUrl, composition: {...composition, width, height, props: inputProps}, inputProps, frame: 24, output: path.join(project, `wrap-${width}.png`), imageFormat: 'png'});
}
// Same rendered overlay, composited over a preview-only dark background and cropped to caption area.
const gif = path.join(skillRoot, 'styles/active-word-highlight/preview.gif');
command('ffmpeg', ['-v','error','-y','-i',outputLocation,'-filter_complex',
  '[0:v]crop=1080:640:0:1200,split[a][b];[b]drawbox=c=0x22242e:t=fill:replace=1[bg];[bg][a]overlay=format=auto,scale=540:320,fps=15,split[x][y];[x]palettegen[p];[y][p]paletteuse', gif]);
writeJson(path.join(root, 'latest-render.json'), {project, outputLocation, gif});
console.log(JSON.stringify({project, outputLocation, gif}));

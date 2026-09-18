// Copy only this skill, create a project from it, install from its lockfile, reproduce a MOV.
// Usage: node tests/portable.mjs <available plugin SKILL.md> [gallery-run.json]
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {pathToFileURL} from 'node:url';
import {skillRoot, command, readJson, writeJson} from '../scripts/core.mjs';
const output = fs.mkdtempSync(path.join(os.tmpdir(), 'captions-portable-'));
const copy = path.join(output, 'captions');
fs.mkdirSync(output, {recursive: true});
fs.cpSync(skillRoot, copy, {recursive: true, filter: source => !['node_modules','.venv','.test-output','__pycache__'].includes(path.basename(source))});
const core = await import(pathToFileURL(path.join(copy, 'scripts/core.mjs')));
const {scaffoldForTest} = await import(pathToFileURL(path.join(copy, 'tests/scaffold.mjs')));
const selected = process.argv[3] ? readJson(process.argv[3]) : {};
const run = {plugin: {availableInApp: true, checkedAt: new Date().toISOString(), instructionPath: path.resolve(process.argv[2])},
  projectName: 'portable-overlay', style: 'active-word-highlight', colorsAccepted: true, colors: selected.colors,
  width: 540, height: 960, fps: 24, sourceOffsetMs: 250, timelinePlacementMs: 7000,
  normalizedPath: path.join(copy, 'tests/fixtures/normalized.json'), timing: {status: 'word-timing-reviewed', provenance: 'Authored fixture copied with independently installed skill'}};
const project = scaffoldForTest(run, {saved: {...core.loadConfig(path.join(output, 'absent.json')), projectFolder: output}});
console.log(command('npm', ['run','captions:render'], {cwd: project}));
fs.copyFileSync(path.join(project, 'out/captions.mov'), path.join(project, 'out/first-render.mov'));
console.log(command('npm', ['run','captions:render'], {cwd: project}));
// Compare decoded pixels, since container metadata can vary across reproductions.
const checksum = file => command('ffmpeg', ['-v','error','-i',file,'-f','framemd5','-']);
if (checksum(path.join(project, 'out/captions.mov')) !== checksum(path.join(project, 'out/first-render.mov'))) throw new Error('Reproduced pixels differ');
writeJson(path.join(output, 'latest-portable.json'), {copy, project});
console.log(JSON.stringify({copy, project, identicalDecodedFrames: true}));

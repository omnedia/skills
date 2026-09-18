// Actual generated-project render at the shipped 2x scale.
// Usage: node tests/scaled-render.mjs <available-plugin-SKILL.md>
import fs from 'node:fs';
import os from 'node:os';
import {scaffoldForTest} from './scaffold.mjs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {skillRoot, readJson, writeJson, loadConfig, command} from '../scripts/core.mjs';
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'captions-scaled-check-'));
const normalizedPath = path.join(root, 'scaled-fixture.json');
const word = readJson(path.join(skillRoot, 'tests/fixtures/normalized.json')).sentences[0].words[0];
writeJson(normalizedPath, {sentences: [{words: [word]}]});
const run = {plugin: {availableInApp: true, instructionPath: path.resolve(process.argv[2]), checkedAt: new Date().toISOString()},
  projectName: 'scaled-render', style: 'active-word-highlight', colorsAccepted: true, normalizedPath,
  timing: {status: 'word-timing-reviewed', provenance: 'First word from authored fixture'}};
const project = scaffoldForTest(run, {saved: {...loadConfig(path.join(root, 'unused-config.json')), projectFolder: root}});
console.log(command('npm', ['run', 'captions:render'], {cwd: project}));
const movie = path.join(project, 'out/captions.mov');
const probe = JSON.parse(command('ffprobe', ['-v', 'error', '-show_streams', '-of', 'json', movie]));
const stream = probe.streams[0];
assert.equal(stream.width, 2160);
assert.equal(stream.height, 3840);
assert.match(stream.pix_fmt, /^yuva/);
assert.equal(stream.r_frame_rate, '30/1');
writeJson(path.join(root, 'latest-scaled.json'), {project, movie});
console.log(JSON.stringify({project, movie, width: stream.width, height: stream.height}));

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {skillRoot, readJson, writeJson, saveConfig, loadConfig, requirePlugin, requireTiming, resolveSettings, prepareProject, attachProject} from '../scripts/core.mjs';
import {startGallery} from '../scripts/gallery.mjs';
import {layoutSentences, segmentState} from '../assets/caption-code/src/layout.mjs';
import {exportOptions} from '../assets/caption-code/export-options.mjs';
import {plainEditorialPlan} from './fixtures/yellow-example.mjs';

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'captions-tests-'));
const fixture = path.join(skillRoot, 'tests/fixtures/normalized.json');
const pluginPath = path.join(temp, 'plugin.md');
fs.writeFileSync(pluginPath, '---\nname: remotion-test-instructions\n---\n');
const plugin = {availableInApp: true, instructionPath: pluginPath, checkedAt: new Date().toISOString()};
const good = {plugin, projectName: 'test', style: 'active-word-highlight', colorsAccepted: true,
  normalizedPath: fixture, timing: {status: 'word-timing-reviewed', provenance: 'Authored test fixture'}};
const saved = {...loadConfig(path.join(temp, 'absent.json')), projectFolder: path.join(temp, 'projects')};

// A minimal plugin-scaffold double; the real CLI is exercised by integration tests.
function createProject(run, options) {
  const prepared = prepareProject(run, options);
  const project = prepared.projectPath;
  writeJson(path.join(project, 'package.json'), {dependencies: {remotion: '4.0.526'}, scripts: {studio: 'original studio'}});
  fs.mkdirSync(path.join(project, 'src'), {recursive: true});
  fs.writeFileSync(path.join(project, 'src/index.ts'), 'original entry');
  return attachProject({...run, ...prepared}, {checkRuntime: options.checkRuntime});
}

test('plugin absence stops project creation even with a runtime present; resume retains choices', () => {
  let runtimeCalled = false;
  assert.throws(() => createProject({...good, plugin: null}, {saved, checkRuntime: () => {runtimeCalled = true;}}), /Remotion app plugin/);
  assert.equal(runtimeCalled, false);
  assert.equal(fs.existsSync(saved.projectFolder), false);
  requirePlugin(plugin);
  assert.equal(good.style, 'active-word-highlight');
});
test('runtime failure remains separate from plugin availability', () => {
  assert.throws(() => createProject(good, {saved, checkRuntime: () => {throw Error('Missing FFmpeg');}}), /Missing FFmpeg/);
  assert.equal(fs.existsSync(saved.projectFolder), false);
});
test('untimed and cue-only inputs stop; audio routes to alignment', () => {
  assert.throws(() => requireTiming({}), /cannot infer usable timing/);
  assert.throws(() => requireTiming({timing: {status: 'cue-only'}}), /Cue timing is usable/);
  assert.throws(() => requireTiming({audio: 'speech.wav'}), /Run local alignment/);
  assert.throws(() => requireTiming({audio: 'speech.wav', timing: {status: 'ambiguous', question: 'Does 01:02 mean minutes or frames?'}}), /Resolve ambiguous timecodes/);
});
test('first-run persistence, overrides and exclusion of font/position defaults', () => {
  const file = path.join(temp, 'config.json');
  const config = saveConfig({projectFolder: saved.projectFolder, brandColors: {Gold: '#123456'}, font: 'wrong', captionPosition: 'top'}, file);
  assert.equal(loadConfig(file).projectFolder, saved.projectFolder);
  assert.equal(config.width, 1080);
  assert.equal('font' in config, false);
  assert.equal('captionPosition' in config, false);
  const settings = resolveSettings({...good, width: 1920, colors: {active: '#ABCDEF'}}, config);
  assert.equal(settings.colors.active, '#ABCDEF');
  assert.equal(settings.colors.base, '#FFFFFF');
  assert.equal(loadConfig(file).width, 1080);
});
test('creation freezes choices/assets and safely resolves collisions', () => {
  const run = {...good, sourceOffsetMs: 1000, timelinePlacementMs: 4000};
  const first = createProject(run, {saved, checkRuntime: () => ({test: true})});
  fs.writeFileSync(path.join(first, 'keep.txt'), 'untouched');
  const second = createProject(run, {saved, checkRuntime: () => ({test: true})});
  assert.equal(second, `${first}-2`);
  assert.equal(fs.readFileSync(path.join(first, 'keep.txt'), 'utf8'), 'untouched');
  const project = readJson(path.join(first, 'project.json'));
  assert.deepEqual(project.sentences, readJson(fixture).sentences);
  assert.equal(project.settings.durationInFrames, 118);
  assert.equal(project.settings.timelinePlacementMs, 4000);
  assert.ok(fs.existsSync(path.join(first, 'public/fonts/Inter-Bold.woff2')));
  assert.equal(fs.readFileSync(path.join(first, 'src/index.ts'), 'utf8'), 'original entry');
  assert.equal(readJson(path.join(first, 'package.json')).scripts.studio, 'original studio');
  assert.equal(fs.existsSync(path.join(first, 'node_modules')), false);
});
test('attachment requires a plugin scaffold and refuses overwrites', () => {
  const run = {...good, projectName: 'attachment-test'};
  const prepared = prepareProject(run, {saved, checkRuntime: () => ({})});
  assert.equal(fs.existsSync(prepared.projectPath), false);
  assert.throws(() => attachProject({...run, ...prepared}, {checkRuntime: () => ({})}), /must scaffold/);
  const project = createProject(run, {saved, checkRuntime: () => ({})});
  assert.throws(() => attachProject({...run, ...prepared, projectPath: project}, {checkRuntime: () => ({})}), /already exist/);
});

test('export defaults merge by field, preserve overrides, and keep PNG alpha', () => {
  const file = path.join(temp, 'export-config.json');
  writeJson(file, {export: {codec: 'prores', profile: '4444', pixelFormat: 'yuva444p10le', container: 'mov'}});
  const config = loadConfig(file);
  assert.equal(config.export.scale, 2);
  assert.equal(config.export.jpegQuality, 90);
  const settings = resolveSettings(good, config);
  assert.equal(settings.width * exportOptions(settings).scale, 2160);
  assert.equal(settings.height * exportOptions(settings).scale, 3840);
  assert.equal('jpegQuality' in exportOptions(settings), false);
  const override = resolveSettings({...good, export: {scale: 1}}, config);
  assert.equal(exportOptions(override).scale, 1);
  assert.equal(override.export.profile, '4444');
  assert.equal(saveConfig({export: {jpegQuality: 95}}, file).export.scale, 2);
  assert.equal(loadConfig(file).export.jpegQuality, 95);
  assert.equal(exportOptions({width: 1080, height: 1920}).scale, 1);
  for (const invalid of [{scale: 0}, {scale: -1}, {scale: 17}, {jpegQuality: 101}, {jpegQuality: 90.5}, {imageFormat: 'jpeg'}]) {
    assert.throws(() => resolveSettings({...good, export: invalid}, config));
  }
});
test('timing handles boundaries, pauses, repeated words, short captions and seeking', () => {
  const sentences = readJson(fixture).sentences;
  const segments = layoutSentences(sentences, s => s.length * 10, 900);
  assert.equal(segmentState(segments, 499), null);
  assert.equal(segmentState(segments, 650).active.text, 'Every');
  assert.equal(segmentState(segments, 780).active, null);
  assert.equal(segmentState(segments, 1200).active.text, ' matters.');
  assert.equal(segmentState(segments, 1799).opacity, 1);
  assert.equal(segmentState(segments, 1850).active, null);
  assert.equal(segmentState(segments, 2400).active, null);
  assert.equal(segmentState(segments, 2600).active.text, ' go!');
  const again = segmentState(segments, 650);
  assert.deepEqual(again, segmentState(segments, 650));
  const adjacent = [{...segments[0], endMs: 2100}, segments[1]];
  assert.equal(segmentState(adjacent, 2100).segment, adjacent[1]);
  const short = [{...segments[0], startMs: 500, endMs: 550}];
  assert.equal(segmentState(short, 530).opacity, 1);
});
test('long text splits to two lines without losing punctuation, text or timing', () => {
  const words = Array.from({length: 30}, (_, i) => ({text: `${i ? ' ' : ''}word${i}${i % 5 === 4 ? ',' : ''}`, startMs: i * 200, endMs: i * 200 + 150}));
  for (const width of [400, 900]) {
    const blocks = layoutSentences([{words}], s => s.length * 10, width);
    assert.deepEqual(blocks.flatMap(b => b.lines.flat()), words);
    assert.ok(blocks.every(b => b.lines.length <= 2));
    assert.ok(blocks.flatMap(b => b.lines).every(l => l.map(w => w.text).join('').trim().length * 10 <= width));
  }
});
test('gallery placeholder stays selectable; selections persist into actual project', async () => {
  const runFile = path.join(temp, 'run.json');
  writeJson(runFile, {...good, style: undefined});
  const catalog = readJson(path.join(skillRoot, 'styles/catalog.json')).map(s => ({...s, preview: 'absent.gif'}));
  const events = [];
  const {server, url} = await startGallery(runFile, {catalog, onSelection: event => {
    assert.equal(readJson(runFile).colorsAccepted, true);
    events.push(event);
  }});
  try {
    const endpoint = route => url.replace('/?', `${route}?`);
    const data = await fetch(endpoint('/catalog')).then(r => r.json());
    assert.equal(data.catalog.length, catalog.length);
    assert.equal(data.catalog[0].previewAvailable, false);
    assert.equal((await fetch(url.split('?')[0])).status, 403);
    assert.equal((await fetch(endpoint('/select'), {method:'POST', body:JSON.stringify({style:'absent'})})).status, 400);
    assert.equal(events.length, 0);
    // Independent transcript work can finish while the picker remains open.
    writeJson(runFile, {...readJson(runFile), timingWork:'completed'});
    const colors = {base: '#123456', active: '#ABCDEF', shadow: '#000000'};
    const response = await fetch(endpoint('/select'), {method: 'POST', body: JSON.stringify({style: good.style, colors})});
    assert.equal(response.status, 200);
    const run = readJson(runFile);
    assert.equal(run.colorsAccepted, true);
    assert.equal(run.timingWork, 'completed');
    assert.deepEqual(events, [{event:'selection-saved', runFile, style:good.style, colors}]);
    const resumed = await fetch(endpoint('/catalog')).then(r => r.json());
    assert.equal(resumed.selected, good.style);
    assert.deepEqual(resumed.colors, colors);
    const project = createProject(run, {saved, checkRuntime: () => ({})});
    assert.deepEqual(readJson(path.join(project, 'project.json')).settings.colors, colors);
  } finally {await new Promise(resolve => server.close(resolve));}
});
test('Yellow Authority preparation requires and persists the AI editorial plan',()=>{
  const run={...good,projectName:'yellow-authored',style:'yellow-authority'};
  assert.throws(()=>prepareProject(run,{saved,checkRuntime:()=>({})}),/AI-authored/);
  const sentences=readJson(fixture).sentences;
  const editorialPlan=plainEditorialPlan(sentences);
  editorialPlan.groups[0].reason='The opening word is the contextual focus';
  editorialPlan.groups[0].spans[0].role='emphasis';
  const {prepared}=prepareProject({...run,styleOptions:{editorialPlan}},{saved,checkRuntime:()=>({})});
  assert.deepEqual(prepared.settings.styleOptions.editorialPlan,editorialPlan);
  assert.equal(prepared.settings.yellowPlan.groups[0].spans[0].role,'emphasis');
  assert.deepEqual(prepared.settings.yellowPlan.words.map(({index,...w})=>w),sentences.flatMap(s=>s.words));
});
process.on('exit', () => fs.rmSync(temp, {recursive: true, force: true}));

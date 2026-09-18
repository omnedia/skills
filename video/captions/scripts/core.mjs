import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {exportOptions} from '../assets/caption-code/export-options.mjs';

export const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
export function writeJson(file, value) {
  fs.mkdirSync(path.dirname(path.resolve(file)), {recursive: true});
  const temp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(value, null, 2) + '\n');
  fs.renameSync(temp, file);
}
export const configPath = () => path.join(os.homedir(), '.config', 'codex-captions', 'config.json');
const shared = ['projectFolder', 'brandColors', 'width', 'height', 'fps', 'export'];
export const sharedOnly = value => Object.fromEntries(shared.filter(key => key in value).map(key => [key, value[key]]));
const mergeShared = (base, overrides) => ({...base, ...sharedOnly(overrides), export: {...base.export, ...overrides.export}});
export function loadConfig(file = configPath()) {
  return mergeShared(readJson(path.join(skillRoot, 'config/defaults.json')), fs.existsSync(file) ? readJson(file) : {});
}
export function saveConfig(changes, file = configPath()) {
  const merged = mergeShared(loadConfig(file), changes);
  exportOptions(merged);
  writeJson(file, merged);
  return merged;
}

// App availability is established by the agent from its CURRENT exposed skills,
// never inferred from node_modules, a CLI binary, or a cache directory alone.
export function requirePlugin(evidence) {
  if (!evidence?.availableInApp || !evidence?.instructionPath ||
      !Number.isFinite(Date.parse(evidence.checkedAt)) || Date.now() - Date.parse(evidence.checkedAt) > 86400000) {
    throw new Error('Remotion app plugin is required. Install or enable Remotion in Codex Plugins, reload this task, and verify its exposed instructions before continuing. Standalone npm packages do not satisfy this prerequisite. Keep existing run choices.');
  }
  const instructions = fs.readFileSync(evidence.instructionPath, 'utf8');
  if (!/name:\s*remotion/.test(instructions)) throw new Error('Remotion plugin instruction evidence is unreadable or incorrect. Recheck the app integration.');
}
export function command(executable, args, options = {}) {
  // npm.cmd needs cmd.exe on Windows; all other commands use direct argument arrays.
  const windowsNpm = process.platform === 'win32' && executable === 'npm';
  const result = spawnSync(windowsNpm ? 'npm.cmd' : executable, args,
    {encoding: 'utf8', stdio: 'pipe', ...options, shell: windowsNpm});
  if (result.error || result.status !== 0) throw new Error(`${executable} failed: ${result.error?.message ?? ''}\n${result.stderr ?? ''}\n${result.stdout ?? ''}`);
  return result.stdout;
}
export function runtimeReady() {
  if (Number(process.versions.node.split('.')[0]) < 22) throw new Error('Node 22 or newer is required.');
  return {node: process.version, npm: command('npm', ['--version']).trim(),
    ffmpeg: command('ffmpeg', ['-version']).split('\n')[0], ffprobe: command('ffprobe', ['-version']).split('\n')[0]};
}
export function requireTiming(run) {
  // These are the agent's semantic assessment states, not a transcript schema.
  if (run.timing?.status === 'ambiguous') throw new Error(`Resolve ambiguous timecodes or offsets before continuing: ${run.timing.question ?? 'confirm units, frame rate and timeline origin'}`);
  if (run.timing?.status !== 'word-timing-reviewed') {
    if (run.audio) throw new Error('Word timing is unresolved. Run local alignment and review its result before project creation.');
    if (run.timing?.status === 'cue-only') throw new Error('Cue timing is usable, but it does not locate each spoken word. Provide matching audio or word timestamps.');
    throw new Error('I cannot infer usable timing from this transcript, and no audio was provided for synchronization. Please provide a transcript with timestamps or the corresponding audio to continue.');
  }
  if (!run.timing.provenance || !run.normalizedPath) throw new Error('Record reviewed timing provenance and normalizedPath before continuing.');
}
export function resolveSettings(run, saved) {
  const style = readJson(path.join(skillRoot, 'styles/catalog.json')).find(item => item.id === run.style);
  if (!style) throw new Error('Select a style from the catalog first.');
  if (!run.colorsAccepted) throw new Error('Resolve style color roles or accept their displayed defaults first.');
  const result = {...mergeShared(saved, run), style: style.id,
    colors: {...style.colors, ...run.colors}, styleOptions: run.styleOptions ?? {},
    sourceOffsetMs: run.sourceOffsetMs ?? 0, timelinePlacementMs: run.timelinePlacementMs ?? 0,
    timing: run.timing,
    font: {asset: 'fonts/Inter-Bold.woff2', family: 'CaptionsBundledInter', weight: 700}};
  for (const key of ['width', 'height', 'fps']) if (!Number.isFinite(result[key]) || result[key] <= 0) throw new Error(`Invalid output ${key}`);
  if (!Number.isInteger(result.width) || !Number.isInteger(result.height)) throw new Error('Dimensions must be whole pixels.');
  if (!Number.isFinite(result.sourceOffsetMs) || !Number.isFinite(result.timelinePlacementMs)) throw new Error('Resolve offsets in milliseconds before creating a project.');
  for (const color of Object.values(result.colors)) if (!/^#[0-9a-f]{6}$/i.test(color)) throw new Error('Colors must be explicit six-digit hex values.');
  if (result.export.codec !== 'prores' || result.export.profile !== '4444' || result.export.pixelFormat !== 'yuva444p10le' || result.export.container !== 'mov') throw new Error('This helper exports ProRes 4444 MOV with yuva444p10le alpha. Handle other explicitly requested formats separately.');
  exportOptions(result);
  return result;
}
export function prepareProject(run, {saved = loadConfig(), checkRuntime = runtimeReady} = {}) {
  requirePlugin(run.plugin);
  const runtime = checkRuntime();
  requireTiming(run);
  const settings = resolveSettings(run, saved);
  if (!settings.projectFolder) throw new Error('First run: collect and save the default project folder.');
  if (!run.projectName || !/^[\p{L}\p{N}][\p{L}\p{N} _-]{0,79}$/u.test(run.projectName) || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(run.projectName)) throw new Error('Use a project name containing letters, numbers, spaces, underscores or hyphens.');
  const data = readJson(run.normalizedPath);
  // Internal renderer invariants only, after semantic review; never parse user transcripts here.
  const words = data.sentences.flatMap(sentence => sentence.words);
  if (!words.length) throw new Error('No reviewed words to render.');
  if (words[0].startMs + settings.sourceOffsetMs < 0) throw new Error('Offset would truncate speech before frame zero. Resolve the timeline origin.');
  settings.durationInFrames = Math.ceil((Math.max(...words.map(w => w.endMs)) + settings.sourceOffsetMs + 120) * settings.fps / 1000);
  settings.runtimeAtCreation = runtime;
  const fontPath = path.join(skillRoot, 'styles/active-word-highlight/fonts/Inter-Bold.woff2');
  const font = fs.readFileSync(fontPath);
  const fontManifest = readJson(path.join(path.dirname(fontPath), 'source.json'));
  settings.font.sha256 = createHash('sha256').update(font).digest('hex');
  if (settings.font.sha256 !== fontManifest.sha256) throw new Error('Bundled font checksum mismatch: repair the skill package.');
  const base = path.resolve(settings.projectFolder);
  fs.mkdirSync(base, {recursive: true});
  const original = path.join(base, run.projectName);
  let target = original;
  for (let suffix = 2; fs.existsSync(target); suffix++) target = `${original}-${suffix}`;
  return {projectPath: target, prepared: {settings, sentences: data.sentences}};
}

export function attachProject(run, {checkRuntime = runtimeReady} = {}) {
  requirePlugin(run.plugin);
  checkRuntime();
  requireTiming(run);
  if (!run.projectPath || !run.prepared) throw new Error('Prepare the run, then let the Remotion plugin scaffold its selected project folder first.');
  const target = path.resolve(run.projectPath);
  const {settings, sentences} = run.prepared;
  const packageFile = path.join(target, 'package.json');
  if (!fs.existsSync(packageFile)) throw new Error('The Remotion plugin must scaffold the new project before captions are attached.');
  const pkg = readJson(packageFile);
  if (!(pkg.dependencies?.remotion ?? pkg.devDependencies?.remotion)) throw new Error('The selected folder is not a Remotion scaffold.');
  const files = ['src/captions', 'captions-render.mjs', 'captions-export-options.mjs', 'project.json', 'EDITOR.md', 'public/fonts/Inter-Bold.woff2', 'public/fonts/LICENSE.txt', 'public/fonts/source.json'];
  if (files.some(file => fs.existsSync(path.join(target, file))) || ['captions:studio', 'captions:render', 'captions:preview'].some(key => pkg.scripts?.[key])) throw new Error('Caption files or scripts already exist. Resume that project without attaching again; do not overwrite it.');
  fs.cpSync(path.join(skillRoot, 'assets/caption-code/src'), path.join(target, 'src/captions'), {recursive: true});
  fs.copyFileSync(path.join(skillRoot, 'assets/caption-code/render.mjs'), path.join(target, 'captions-render.mjs'));
  fs.copyFileSync(path.join(skillRoot, 'assets/caption-code/export-options.mjs'), path.join(target, 'captions-export-options.mjs'));
  const fontPath = path.join(skillRoot, 'styles/active-word-highlight/fonts/Inter-Bold.woff2');
  fs.mkdirSync(path.join(target, 'public/fonts'), {recursive: true});
  fs.copyFileSync(fontPath, path.join(target, 'public', settings.font.asset));
  fs.copyFileSync(path.join(path.dirname(fontPath), 'LICENSE.txt'), path.join(target, 'public/fonts/LICENSE.txt'));
  fs.copyFileSync(path.join(path.dirname(fontPath), 'source.json'), path.join(target, 'public/fonts/source.json'));
  writeJson(path.join(target, 'project.json'), {settings, sentences});
  pkg.scripts = {...pkg.scripts, 'captions:studio': 'remotion studio src/captions/index.tsx --no-open',
    'captions:render': 'node captions-render.mjs', 'captions:preview': 'node captions-render.mjs --preview'};
  writeJson(packageFile, pkg);
  fs.writeFileSync(path.join(target, 'EDITOR.md'), `# Caption overlay\n\nImport out/captions.mov above your footage; use its alpha channel (straight/unmatted). The overlay is silent.\n\nPlace the MOV at ${settings.timelinePlacementMs} ms on the editing timeline. A source timestamp t appears at t + ${settings.sourceOffsetMs} ms inside the MOV. Leading silence is retained. Match ${settings.fps} fps; rendered dimensions ${settings.width * settings.export.scale} × ${settings.height * settings.export.scale} (${settings.export.scale}× export scale; composition ${settings.width} × ${settings.height}).\n\nReproduce: npm ci, then npm run captions:render. Edit project.json for saved colors/timing/style settings. npm run captions:studio opens an editable preview.\n`);
  return target;
}

export function installCaptionDependencies(project) {
  // Follow the scaffold's installed version, rather than shipping a second dependency tree.
  const version = readJson(path.join(project, 'node_modules/remotion/package.json')).version;
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error('Resolve the scaffold Remotion version before adding matching caption dependencies.');
  return command('npm', ['install', '--save-exact', '--no-audit', '--no-fund',
    ...['remotion', '@remotion/cli', '@remotion/bundler', '@remotion/renderer', '@remotion/captions'].map(pkg => `${pkg}@${version}`)], {cwd: project});
}

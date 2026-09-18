import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {readFile, mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {exportOptions} from './captions-export-options.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
process.chdir(root);
const data = JSON.parse(await readFile(path.join(root, 'project.json'), 'utf8'));
const options = exportOptions(data.settings);
const preview = process.argv.includes('--preview');
const serveUrl = await bundle({entryPoint: path.join(root, 'src/captions/index.tsx'), publicDir: path.join(root, 'public')});
const composition = await selectComposition({serveUrl, id: 'Captions'});
await mkdir(path.join(root, 'out'), {recursive: true});
// Preview starts near the first spoken word; the final always retains leading silence.
const start = Math.max(0, Math.floor((data.sentences[0].words[0].startMs + data.settings.sourceOffsetMs - 200) * composition.fps / 1000));
const outputLocation = path.join(root, 'out', preview ? 'preview.mov' : 'captions.mov');
await renderMedia({serveUrl, composition, outputLocation, ...options, concurrency: 2,
  ...(preview ? {frameRange: [start, Math.min(composition.durationInFrames - 1, start + Math.ceil(composition.fps * 5) - 1)]} : {})});
console.log(JSON.stringify({outputLocation, preview, firstFrame: preview ? start : 0}));

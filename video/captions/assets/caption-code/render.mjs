import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {exportOptions} from './captions-export-options.mjs';
import {prepareYellowProject} from './captions-yellow-plan.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
process.chdir(root);
await prepareYellowProject(root);
const data = JSON.parse(await readFile(path.join(root, 'project.json'), 'utf8'));
// Gallery-only props must never leak into a production MOV or review excerpt.
delete data.previewBackground;
delete data.layer;
const options = exportOptions(data.settings);
const preview = process.argv.includes('--preview');
const serveUrl = await bundle({entryPoint: path.join(root, 'src/captions/index.tsx'), publicDir: path.join(root, 'public')});
const inputProps = {...data, previewBackground: 'transparent', layer: ''};
const composition = await selectComposition({serveUrl, id: 'Captions', inputProps});
await mkdir(path.join(root, 'out'), {recursive: true});
// Preview starts near the first spoken word; the final always retains leading silence.
const start = Math.max(0, Math.floor((data.sentences[0].words[0].startMs + data.settings.sourceOffsetMs - 200) * composition.fps / 1000));
const outputLocation = path.join(root, 'out', preview ? 'preview.mov' : 'captions.mov');
const range=preview ? {frameRange: [start, Math.min(composition.durationInFrames - 1, start + Math.ceil(composition.fps * 5) - 1)]} : {};
if(data.settings.style==='montserrat-difference' && data.settings.delivery?.mode==='layers') {
  const layers=[];
  for(const [phraseIndex,phrase] of Object.entries(data.settings.styleOptions.phrases)) for(const [index,group] of phrase.groups.entries()) {
    const layer=`${phraseIndex}-${index}`, file=`${preview?'preview-':''}layer-${layer}.mov`;
    const layerProps={...inputProps,layer};
    await renderMedia({serveUrl,composition:{...composition,props:layerProps},inputProps:layerProps,outputLocation:path.join(root,'out',file),...options,...range,concurrency:2});
    layers.push({file,blendMode:group.blendMode??(group.emphasis||group.number?'difference':'normal'),alpha:'straight',order:layers.length});
  }
  await writeFile(path.join(root,'out',preview?'preview-layers.json':'layers.json'),JSON.stringify({order:'bottom-to-top',firstFrame:preview?start:0,layers,instructions:'Place each source-color layer over the intended footage with its specified blend mode. Never flatten before Difference compositing.'},null,2));
} else {
  await renderMedia({serveUrl, composition, inputProps, outputLocation, ...options, ...range, concurrency: 2});
}
console.log(JSON.stringify({outputLocation:data.settings.style==='montserrat-difference'&&data.settings.delivery?.mode==='layers'?path.join(root,'out',preview?'preview-layers.json':'layers.json'):outputLocation, preview, firstFrame: preview ? start : 0}));

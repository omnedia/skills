import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {renderMedia,selectComposition} from '@remotion/renderer';
import {requireFresh} from './project.mjs';
import {exportProject,exactFpsArgs} from './export.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),project=requireFresh(root);
const serveUrl=await bundle({entryPoint:path.join(root,'motion/src/index.tsx'),publicDir:path.join(root,'public')});
if(process.argv.includes('--preview')){
 const inputProps={project,preview:true,sceneId:null};const composition=await selectComposition({serveUrl,id:'Motion',inputProps});
 await renderMedia({serveUrl,composition,inputProps,outputLocation:path.join(root,'preview.mp4'),codec:'h264',muted:true,scale:0.5,concurrency:2,ffmpegOverride:({args})=>exactFpsArgs(args,project.settings.fps)});
}else await exportProject(root,project,async({sceneId,outputLocation,options})=>{
 const inputProps={project,sceneId,preview:false};const composition=await selectComposition({serveUrl,id:'Motion',inputProps});
 await renderMedia({serveUrl,composition,inputProps,outputLocation,...options,concurrency:2,ffmpegOverride:({args})=>exactFpsArgs(args,project.settings.fps)});
});

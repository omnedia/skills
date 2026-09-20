import fs from 'node:fs';
import path from 'node:path';
import {hash,readJson,writeJson} from './io.mjs';
import {fpsRatio} from './contract.mjs';
export function exactFpsArgs(args,fps){const {n,d}=fpsRatio(fps);return args.map((arg,i)=>i>0&&['-r','-framerate'].includes(args[i-1])?n+'/'+d:arg);}
export const exportOptions=settings=>({codec:'prores',proResProfile:'4444',pixelFormat:'yuva444p10le',imageFormat:'png',muted:true,scale:settings.export.scale});
export function placements(project,mode){
  const {settings:s,graphicsPlan:g}=project,{n,d}=fpsRatio(s.fps),ms=f=>f*1000*d/n;
  return {schemaVersion:1,fingerprint:project.fingerprint,mode,fps:`${n}/${d}`,composition:{width:s.width,height:s.height},exported:{width:s.width*s.export.scale,height:s.height*s.export.scale},alpha:'straight/unmatted',audio:false,sequencePlacementFrame:g.scenes[0].frames.editorOrigin,sequencePlacementMs:ms(g.scenes[0].frames.editorOrigin),scenes:g.scenes.map(scene=>({id:scene.id,file:mode==='clips'?`${scene.id}.mov`:'sequence.mov',component:scene.component,sourceRanges:scene.sourceRanges??null,sourceInterval:scene.sourceInterval??null,sceneMode:scene.sceneMode,background:scene.background??'transparent',sequenceRange:[scene.frames.start,scene.frames.end],clipRange:[scene.frames.clipStart,scene.frames.clipEnd],localAnimationStart:scene.frames.localStart,durationFrames:scene.frames.duration,placementFrame:scene.frames.placementFrame,placementMs:ms(scene.frames.placementFrame),handles:scene.frames.handles,trackOrder:scene.order,rounding:scene.frames.rounding,editorOriginDeltaMs:scene.frames.editorOriginDeltaMs}))};
}
// Injectable encoder keeps recovery tests fast while exercising real files and hashes.
export async function exportProject(root,project,encode){
 const dir=path.join(root,'out');fs.mkdirSync(dir,{recursive:true});
 const stateFile=path.join(root,'export-state.json'),state=fs.existsSync(stateFile)?readJson(stateFile):{outputs:{}};
 const mode=project.settings.delivery,items=mode==='clips'?project.graphicsPlan.scenes.map(s=>({id:s.id,sceneId:s.id})): [{id:'sequence',sceneId:null}];
 const manifestFile=path.join(dir,'placement-manifest.json');
 if(fs.existsSync(manifestFile)){
   if(state.manifestHash!==hash(fs.readFileSync(manifestFile)))throw Error('Conflicting placement manifest; preserve or move it first');
   fs.unlinkSync(manifestFile);delete state.manifestHash;writeJson(stateFile,state);
 }
 for(const item of items){
   const file=path.join(dir,item.id+'.mov'),fingerprint=hash({project:project.fingerprint,compiled:project.compiledHash,item}),old=state.outputs[item.id];
   if(fs.existsSync(file)){
     const actual=hash(fs.readFileSync(file));
     if(!old?.outputHash||(actual!==old.outputHash&&actual!==old.previousHash))throw Error(`Conflicting output ${file}; preserve or move it first`);
     if(old.status==='encoded'&&actual===old.outputHash&&old.fingerprint===fingerprint){old.status='complete';writeJson(stateFile,state);continue;}
     if(old.status==='complete'&&old.fingerprint===fingerprint)continue;
   }
   const temp=path.join(dir,`${item.id}.partial.mov`);
   const previousHash=fs.existsSync(file)?hash(fs.readFileSync(file)):undefined;
   if(fs.existsSync(temp)&&old?.temporary!==temp)throw Error('Conflicting temporary render');
   state.outputs[item.id]={...old,status:'rendering',fingerprint,temporary:temp};writeJson(stateFile,state);
   try{
     await encode({sceneId:item.sceneId,outputLocation:temp,options:exportOptions(project.settings)});
     const outputHash=hash(fs.readFileSync(temp));
     // Journal success before rename so a crash can safely resume from the final owned hash.
     state.outputs[item.id]={status:'encoded',fingerprint,temporary:temp,outputHash,previousHash};writeJson(stateFile,state);
     fs.renameSync(temp,file);state.outputs[item.id].status='complete';writeJson(stateFile,state);
   }catch(error){state.outputs[item.id].error=error.message;writeJson(stateFile,state);throw error;}
 }
 const manifest=placements(project,mode);writeJson(manifestFile,manifest);state.manifestHash=hash(fs.readFileSync(manifestFile));writeJson(stateFile,state);return manifest;
}

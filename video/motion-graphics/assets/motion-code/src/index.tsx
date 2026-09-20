import {useEffect, useState} from 'react';
import {AbsoluteFill, Composition, Img, registerRoot, staticFile, useCurrentFrame, delayRender, continueRender} from 'remotion';
import compiled from '../../compiled-motion.json';
import {sceneState, layerState} from './state.mjs';

const Layers=({scene,project,frame}:any)=><>{scene.layers.map((l:any)=>{
  const t=layerState(scene,l,frame),r=l.rect;
  return <div key={l.id} style={{position:'absolute',left:r.x,top:r.y,width:r.width,height:r.height,transformOrigin:`${l.pivot[0]*100}% ${l.pivot[1]*100}%`,transform:`translate(${t.x}px,${t.y}px) scale(${t.scale})`,maskImage:l.mask?`url(${staticFile(project.assets[l.mask].path)})`:undefined,maskSize:'100% 100%'}}>
    <Img src={staticFile(project.assets[l.asset].path)} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:`${l.crop?.x??50}% ${l.crop?.y??50}%`}}/>
  </div>;
})}</>;
const Paper=({scene,project,frame}:any)=>{
 const p=scene.paperTreatment;
 return <><div style={{position:'absolute',inset:0,background:p.tint,boxShadow:`0 3px ${p.edgeShadow}px #0004`}}/>
 {p.backingSheet&&<div style={{position:'absolute',inset:4,background:p.tint,transform:'rotate(-1deg)'}}/>}
 <div style={{position:'absolute',inset:0,overflow:'hidden',background:p.tint}}>
 <div style={{position:'absolute',inset:0,opacity:p.internalPaperOpacity}}><Layers scene={scene} project={project} frame={frame}/></div>
 <div style={{position:'absolute',inset:0,background:p.tint,opacity:0.06}}/>
 {p.textureAsset?<Img src={staticFile(project.assets[p.textureAsset].path)} style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:p.textureStrength}}/>:
 <svg width="100%" height="100%" style={{position:'absolute',inset:0,opacity:p.textureStrength}}>{scene.fibers.map((f:any,i:number)=><line key={i} x1={f.x*scene.placement.width} y1={f.y*scene.placement.height} x2={f.x*scene.placement.width+f.length} y2={f.y*scene.placement.height+1} stroke={i%2?'#fff':'#202124'} strokeWidth="1" opacity={f.opacity}/>)}</svg>}
 </div></>;
};
const Diagram=({scene,project}:any)=><svg width="100%" height="100%" style={{position:'absolute',inset:0}}>{scene.labels.map((l:any,i:number)=><g key={i}><rect x={l.x-16} y={l.y-14} width={l.width+32} height={l.height+28} rx="12" fill={i%2?project.settings.colors.surface:project.settings.colors.highlight}/>{i<scene.labels.length-1&&<path d={`M ${scene.placement.width/2} ${l.y+l.height+15} v 35 l -8 -8 m 8 8 l 8 -8`} stroke={project.settings.colors.ink} strokeWidth="4" fill="none"/>}</g>)}</svg>;
// Registry names come from the same copied capability catalog used by validation/gallery.
const renderers:any={cutout:Layers,parallax:Layers,paper:Paper,callout:Layers,diagram:Diagram};
function Scene({scene,project,frame}:any){
  const st=sceneState(scene,frame);if(!st.active)return null;
  const Component=renderers[scene.renderer];if(!Component)throw Error('Unsupported compiled renderer');
  const p=scene.placement,colors=project.settings.colors;
  const fit=project.graphicsPlan.fit;
  return <>{scene.background&&<div style={{position:'absolute',left:-fit.x/fit.scale,top:-fit.y/fit.scale,width:project.settings.width/fit.scale,height:project.settings.height/fit.scale,background:scene.background,opacity:st.opacity}}/>}
  <div style={{position:'absolute',left:p.x,top:p.y,width:p.width,height:p.height,opacity:st.opacity,transform:`translateY(${st.y}px) rotate(${scene.renderer==='paper'?scene.paperTreatment.documentTilt:0}deg)`}}>
    <div style={{position:'absolute',inset:0,overflow:scene.renderer==='paper'?'visible':'hidden',borderRadius:scene.surface==='window'?24:0}}><Component scene={scene} project={project} frame={frame}/></div>
    <svg width="100%" height="100%" style={{position:'absolute',inset:0,overflow:'visible'}}>{(scene.annotations??[]).map((a:any,i:number)=>{
      const layer=scene.layers.find((l:any)=>l.id===a.layerId),t=layer?layerState(scene,layer,frame):{x:0,y:0,scale:1};
      const tx=layer?(a.to[0]-layer.rect.x-layer.rect.width*layer.pivot[0])*t.scale+layer.rect.x+layer.rect.width*layer.pivot[0]+t.x:a.to[0];
      const ty=layer?(a.to[1]-layer.rect.y-layer.rect.height*layer.pivot[1])*t.scale+layer.rect.y+layer.rect.height*layer.pivot[1]+t.y:a.to[1];
      const event=scene.frames.events.find((e:any)=>e.id===a.eventId),progress=event?Math.max(0,Math.min(1,(frame-event.frame)/Math.max(1,event.complete-event.frame))):1;
      return <g key={i} opacity={progress}><path d={`M ${a.from[0]} ${a.from[1]+60} L ${a.from[0]+(tx-a.from[0])*progress} ${a.from[1]+60+(ty-a.from[1]-60)*progress}`} stroke={colors.accent} strokeWidth="5" fill="none"/><circle cx={tx} cy={ty} r="9" fill={scene.highlight??colors.highlight}/></g>;
    })}</svg>
    {scene.labels.filter((l:any)=>!l.eventId||frame>=scene.frames.events.find((e:any)=>e.id===l.eventId).frame).map((l:any,i:number)=><div key={i} style={{position:'absolute',left:l.x,top:l.y,width:l.width,height:l.height,fontFamily:project.font.family,fontWeight:700,fontSize:l.fontSize,lineHeight:`${l.lineHeight}px`,color:colors.ink,whiteSpace:'pre'}}>{l.lines.join('\n')}</div>)}
  </div></>;
}
function Motion({project,sceneId=null,preview=false}:any){
 const frame=useCurrentFrame();const [handle]=useState(()=>delayRender('Load bundled font'));
 useEffect(()=>{const f=new FontFace(project.font.family,`url(${staticFile(project.font.asset)})`,{weight:'700'});f.load().then(loaded=>{document.fonts.add(loaded);continueRender(handle);});},[handle,project.font]);
 const scenes=project.graphicsPlan.scenes.filter((s:any)=>!sceneId||s.id===sceneId),offset=sceneId?scenes[0].frames.clipStart:0,fit=project.graphicsPlan.fit;
 return <AbsoluteFill>{preview&&<AbsoluteFill style={{background:'#B8B8B3'}}><svg viewBox="0 0 1080 1920" height="100%"><ellipse cx="540" cy="610" rx="170" ry="225" fill="#999A95"/><path d="M170 1800V1150Q540 820 910 1150V1800Z" fill="#8C8F89"/></svg></AbsoluteFill>}
 <div style={{position:'absolute',width:1080,height:1920,left:fit.x,top:fit.y,transformOrigin:'0 0',transform:`scale(${fit.scale})`}}>{scenes.map((s:any)=><Scene key={s.id} scene={s} project={project} frame={frame+offset}/>)}</div></AbsoluteFill>;
}
const Root=()=>{const p:any=compiled;const [n,d]=String(p.settings.fps).split('/').map(Number);return <Composition id="Motion" component={Motion} width={p.settings.width} height={p.settings.height} fps={n/(d||1)} durationInFrames={p.graphicsPlan.durationInFrames} defaultProps={{project:p,sceneId:null,preview:false}} calculateMetadata={({props}:any)=>({width:props.project.settings.width,height:props.project.settings.height,durationInFrames:props.sceneId?props.project.graphicsPlan.scenes.find((s:any)=>s.id===props.sceneId).frames.duration:props.project.graphicsPlan.durationInFrames})}/>;};
registerRoot(Root);

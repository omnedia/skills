import React, {useEffect,useState} from 'react';
import {AbsoluteFill,OffthreadVideo,staticFile,useCurrentFrame,useVideoConfig,delayRender,continueRender,cancelRender} from 'remotion';
import type {Props} from './CaptionOverlay';
import {montserratLayout,montserratState,type Segment,type MontserratOptions} from './montserrat.mjs';

export const MontserratDifference:React.FC<Props>=({settings,sentences,previewBackground,layer})=>{
  const frame=useCurrentFrame(),{fps,width,height}=useVideoConfig();
  const [handle]=useState(()=>delayRender('Verify and measure Montserrat compositions'));
  const [segments,setSegments]=useState<Segment[]|null>(null);
  useEffect(()=>{let mounted=true;(async()=>{
    const fonts=Object.values(settings.fonts??{});
    if(fonts.length!==8)throw Error('Montserrat requires bundled 100/200/300/700 upright and italic variants');
    for(const font of fonts){
      const response=await fetch(staticFile(font.asset));if(!response.ok)throw Error(`Missing font ${font.asset}`);
      const bytes=await response.arrayBuffer();
      const sha=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
      if(sha!==font.sha256)throw Error(`Font checksum mismatch: ${font.asset}`);
      const face=await new FontFace(font.family,bytes,{weight:String(font.weight),style:font.style}).load();
      (document.fonts as FontFaceSet & {add(font:FontFace):void}).add(face);
    }
    const ctx=document.createElement('canvas').getContext('2d')!;
    const result=montserratLayout(sentences,(text,weight,italic,size)=>{
      const font=fonts.find(f=>f.weight===weight && f.style===(italic?'italic':'normal'))!;
      if([...text].some(c=>!font.codepoints?.includes(c.codePointAt(0)!)))throw Error('Unsupported Montserrat glyph');
      ctx.font=`${italic?'italic':'normal'} ${weight} ${size}px "${font.family}"`;
      const m=ctx.measureText(text);return {width:m.width,left:m.actualBoundingBoxLeft,right:m.actualBoundingBoxRight,ascent:m.actualBoundingBoxAscent,descent:m.actualBoundingBoxDescent};
    },width,height,settings.styleOptions as MontserratOptions,settings.colors);
    if(mounted){setSegments(result);continueRender(handle);}
  })().catch(cancelRender);return()=>{mounted=false;};},[settings,sentences,width,height,handle]);
  const delivery=settings.delivery ?? {mode:'alpha'};
  if(!['alpha','footage','layers'].includes(delivery.mode))throw Error('Save delivery mode alpha, footage or layers');
  if(delivery.mode==='footage'&&!delivery.footage)throw Error('Footage delivery needs a public footage asset');
  if(!segments)return null;
  const state=montserratState(segments,frame*1000/fps-settings.sourceOffsetMs);
  return <AbsoluteFill style={{backgroundColor:layer?undefined:previewBackground}}>
    {!layer && delivery.mode==='footage' && <OffthreadVideo src={staticFile(delivery.footage!)} muted trimBefore={delivery.trimBeforeFrames??0} style={{width:'100%',height:'100%',objectFit:'cover'}}/>}
    {/* Each group is a sibling of the actual footage. No isolated/opaque caption wrapper. */}
    {state?.groups.filter(g=>!layer||layer===`${state.phraseIndex}-${g.index}`).map(g=>{
      return <svg key={g.index} data-montserrat-group={g.index} width={width} height={height}
        style={{position:'absolute',inset:0,overflow:'visible',mixBlendMode:layer||delivery.mode==='alpha'?'normal':g.blendMode,opacity:g.opacity}}>
        <text x={g.x+g.offsetX} y={g.y} fill={g.color} fontFamily="CaptionsMontserrat" fontSize={g.size} fontWeight={g.weight} fontStyle={g.italic?'italic':'normal'}
          style={{fontSynthesis:'none',filter:g.shadow&&g.blendMode==='normal'?`drop-shadow(0 ${2*Math.min(width,height)/1080}px ${3*Math.min(width,height)/1080}px #0009)`:undefined}}>{g.text}</text>
      </svg>;
    })}
  </AbsoluteFill>;
};

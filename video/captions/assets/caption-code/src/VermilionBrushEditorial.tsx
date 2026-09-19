import React,{useEffect,useState} from 'react';
import {AbsoluteFill,staticFile,useCurrentFrame,useVideoConfig,delayRender,continueRender,cancelRender} from 'remotion';
import type {Props} from './CaptionOverlay';
import {layoutVermilion,vermilionState,isVermilionScript,type Layout,type VermilionOptions} from './vermilion.mjs';
export const VermilionBrushEditorial:React.FC<Props>=({settings,sentences,previewBackground})=>{
  const frame=useCurrentFrame(),{width,height,fps}=useVideoConfig();
  const [handle]=useState(()=>delayRender('Validate Vermilion fonts and measure saved plan'));
  const [layout,setLayout]=useState<Layout|null>(null);
  useEffect(()=>{let mounted=true;(async()=>{
    const fonts=settings.fonts,plan=settings.layoutPlan;
    if(!fonts?.primary||!fonts.script||!plan)throw Error('Vermilion requires Brunson, BrushScriptMT and a persisted layoutPlan; prepare the project again');
    const words=sentences.flatMap(s=>s.words);
    if(plan.version!==1||words.length!==plan.words.length||words.some((w,i)=>w.text!==plan.words[i].text||w.startMs!==plan.words[i].startMs||w.endMs!==plan.words[i].endMs))throw Error('Vermilion layoutPlan is stale; replan from the current transcript');
    for(const font of [fonts.primary,fonts.script]){
      const response=await fetch(staticFile(font.asset));if(!response.ok)throw Error(`Missing font: ${font.asset}`);
      const bytes=await response.arrayBuffer();
      const sha=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
      if(sha!==font.sha256)throw Error(`Font checksum mismatch: ${font.asset}`);
      const face=await new FontFace(font.family,bytes,{weight:String(font.weight),style:font.style??'normal',featureSettings:'"calt" 0'}).load();
      (document.fonts as FontFaceSet&{add(f:FontFace):void}).add(face);
    }
    const ctx=document.createElement('canvas').getContext('2d')!;
    const result=layoutVermilion(plan,(text,role,size,tracking)=>{
      const font=fonts[isVermilionScript(role)?'script':'primary'];
      const missing=[...new Set([...text].filter(c=>!font.codepoints?.includes(c.codePointAt(0)!)))];
      if(missing.length)throw Error(`${font.family}: missing glyphs ${missing.map(c=>'U+'+c.codePointAt(0)!.toString(16).toUpperCase()).join(', ')}`);
      ctx.font=`${font.style??'normal'} ${font.weight} ${size}px "${font.family}"`;
      ctx.fontKerning='normal';ctx.letterSpacing=`${tracking*size}px`;
      const m=ctx.measureText(text);
      if(m.width>text.length*size*3)throw Error(`${font.family}: invalid original font shaping metrics`);
      return {width:m.width,left:m.actualBoundingBoxLeft,right:m.actualBoundingBoxRight,ascent:m.actualBoundingBoxAscent,descent:m.actualBoundingBoxDescent};
    },width,height,settings.styleOptions as VermilionOptions,settings.colors);
    if(mounted){setLayout(result);continueRender(handle);}
  })().catch(cancelRender);return()=>{mounted=false;};},[settings,sentences,width,height,handle]);
  const units=layout?vermilionState(layout,frame*1000/fps-settings.sourceOffsetMs):[];
  return <AbsoluteFill style={{backgroundColor:previewBackground}}><svg width={width} height={height} style={{overflow:'visible'}}>
    {units.map(u=>{const font=settings.fonts![isVermilionScript(u.role)?'script':'primary'];const id=`vermilion-${u.wordIndex}`;
      return <g key={id} data-word-index={u.wordIndex} opacity={u.opacity} transform={`translate(0 ${u.dy})`}>
        {u.motionBlur>0&&<defs><filter id={id} x="-50%" y="-200%" width="200%" height="500%"><feGaussianBlur stdDeviation={`0 ${u.motionBlur}`}/></filter></defs>}
        <text x={u.x} y={u.y} fill={u.color} fontSize={u.size} fontFamily={font.family} fontWeight={font.weight} fontStyle={font.style??'normal'}
          letterSpacing={u.tracking*u.size} filter={u.motionBlur>0?`url(#${id})`:undefined}
          style={{fontSynthesis:'none',fontKerning:'normal',fontFeatureSettings:'"calt" 0',fontVariantLigatures:'normal'}}>{u.text}</text>
      </g>;
    })}
  </svg></AbsoluteFill>;
};

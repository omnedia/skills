import React,{useEffect,useState} from 'react';
import {AbsoluteFill,staticFile,useCurrentFrame,useVideoConfig,delayRender,continueRender,cancelRender} from 'remotion';
import type {Props} from './CaptionOverlay';
import {brunsonLayout,brunsonState,type Segment,type BrunsonOptions} from './brunson.mjs';
export const BrunsonRedScript:React.FC<Props>=({settings,sentences,previewBackground})=>{
  const frame=useCurrentFrame(),{width,height,fps}=useVideoConfig();
  const [handle]=useState(()=>delayRender('Load exact Brunson and Brush Script MT fonts'));
  const [segments,setSegments]=useState<Segment[]|null>(null);
  useEffect(()=>{let mounted=true;(async()=>{
    const fonts=settings.fonts;
    if(!fonts?.primary||!fonts.script)throw Error('Brunson Red Script requires actual Brunson and Brush Script MT files');
    for(const font of [fonts.primary,fonts.script]){
      const response=await fetch(staticFile(font.asset));if(!response.ok)throw Error(`Missing font: ${font.asset}`);
      const bytes=await response.arrayBuffer();
      const sha=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
      if(sha!==font.sha256)throw Error(`Font checksum mismatch: ${font.asset}`);
      const face=await new FontFace(font.family,bytes,{weight:String(font.weight),style:font.style??'normal',featureSettings:'"calt" 0'}).load();
      (document.fonts as FontFaceSet&{add(f:FontFace):void}).add(face);
    }
    const ctx=document.createElement('canvas').getContext('2d')!;
    const result=brunsonLayout(sentences,(text,role,size)=>{
      const font=fonts[role==='script'?'script':'primary'];
      const missing=[...new Set([...text].filter(c=>!font.codepoints?.includes(c.codePointAt(0)!)))];
      if(missing.length)throw Error(`${font.family}: unsupported glyphs ${missing.join(' ')} (${missing.map(c=>'U+'+c.codePointAt(0)!.toString(16).toUpperCase()).join(', ')})`);
      ctx.font=`${font.style??'normal'} ${font.weight} ${size}px "${font.family}"`;
      const m=ctx.measureText(text);
      if(m.width>text.length*size*3)throw Error(`${font.family}: unusable shaping metrics for ${JSON.stringify(text)}; obtain a corrected original font file. No fallback was used.`);
      return {width:m.width,left:m.actualBoundingBoxLeft,right:m.actualBoundingBoxRight,ascent:m.actualBoundingBoxAscent,descent:m.actualBoundingBoxDescent};
    },width,height,settings.styleOptions as BrunsonOptions,settings.colors);
    if(mounted){setSegments(result);continueRender(handle);}
  })().catch(cancelRender);return()=>{mounted=false;};},[settings,sentences,width,height,handle]);
  const state=segments&&brunsonState(segments,frame*1000/fps-settings.sourceOffsetMs);
  const scale=Math.min(width,height)/1080;
  return <AbsoluteFill style={{backgroundColor:previewBackground}}><svg width={width} height={height} style={{overflow:'visible'}}>
    {state?.groups.map(g=>{const font=settings.fonts![g.role==='script'?'script':'primary'];const id=`brunson-${state.phraseIndex}-${g.index}`;
      return <g key={id} data-brunson-group={g.index} opacity={g.opacity} transform={`translate(0 ${g.dy})`}>
        {g.blur>0&&<defs><filter id={id} x="-50%" y="-200%" width="200%" height="500%"><feGaussianBlur stdDeviation={`0 ${g.blur}`}/></filter></defs>}
        <g style={{filter:g.shadow?`drop-shadow(${g.shadow.x*scale}px ${g.shadow.y*scale}px ${g.shadow.blur*scale}px ${g.shadow.color}${Math.round(g.shadow.opacity*255).toString(16).padStart(2,'0')})`:undefined}}><g filter={g.blur>0?`url(#${id})`:undefined}>
          {g.lines.map((l,i)=><text key={i} x={l.x} y={l.y} fill={g.color} fontSize={g.size} fontFamily={font.family} fontWeight={font.weight} fontStyle={font.style??'normal'} style={{fontSynthesis:'none',fontKerning:'normal',fontFeatureSettings:'"calt" 0',fontVariantLigatures:'normal'}}>{l.text}</text>)}
        </g></g>
      </g>;
    })}
  </svg></AbsoluteFill>;
};

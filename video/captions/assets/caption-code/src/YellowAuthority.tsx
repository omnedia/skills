import React, {useEffect,useState} from 'react';
import {AbsoluteFill,staticFile,useCurrentFrame,useVideoConfig,delayRender,continueRender,cancelRender} from 'remotion';
import type {Props} from './CaptionOverlay';
import {yellowState,yellowOptions,yellowPlanVersion,type YellowOptions} from './yellow.mjs';

export const YellowAuthority:React.FC<Props>=({settings,sentences,previewBackground})=>{
  const frame=useCurrentFrame(),{width,height,fps}=useVideoConfig();
  const [handle]=useState(()=>delayRender('Load exact Yellow Authority faces'));
  const [ready,setReady]=useState(false);
  const plan=settings.yellowPlan;
  useEffect(()=>{let mounted=true;(async()=>{
    if(!plan?.measured||plan.version!==yellowPlanVersion)throw Error('Run npm run captions:plan before rendering Yellow Authority');
    const words=sentences.flatMap(s=>s.words);
    if(words.length!==plan.words.length||words.some((w,i)=>JSON.stringify(w)!==JSON.stringify(Object.fromEntries(Object.entries(plan.words[i]).filter(([k])=>k!=='index')))))throw Error('Stale Yellow Authority transcript plan; run captions:plan');
    if(JSON.stringify(settings.colors)!==JSON.stringify(plan.palette))throw Error('Stale Yellow Authority palette; run captions:plan');
    if(JSON.stringify(yellowOptions(settings.styleOptions as YellowOptions))!==JSON.stringify(plan.options))throw Error('Stale Yellow Authority overrides; run captions:plan');
    for(const f of Object.values(settings.fonts!)){
      const response=await fetch(staticFile(f.asset));if(!response.ok)throw Error(`Missing font: ${f.asset}`);
      const bytes=await response.arrayBuffer();
      const sha=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
      if(sha!==f.sha256)throw Error(`Font checksum mismatch: ${f.asset}`);
      const face=await new FontFace(f.family,bytes,{weight:String(f.weight),style:f.style??'normal'}).load();
      (document.fonts as FontFaceSet&{add(f:FontFace):void}).add(face);
    }
    if(mounted){setReady(true);continueRender(handle);}
  })().catch(cancelRender);return()=>{mounted=false;};},[plan,settings,sentences,handle]);
  const scale=Math.min(width/720,height/1280);
  const units=ready?yellowState(plan!,frame*1000/fps-settings.sourceOffsetMs):[];
  return <AbsoluteFill style={previewBackground==='checkerboard'?{background:'repeating-conic-gradient(#ddd 0% 25%,#777 0% 50%) 0/32px 32px'}:{backgroundColor:previewBackground}}><svg width={width} height={height} style={{overflow:'visible'}}>
    <defs><filter id="yellow-shadow" x="-30%" y="-100%" width="160%" height="300%"><feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.18"/></filter></defs>
    <g transform={`translate(${(width-720*scale)/2} ${(height-1280*scale)/2}) scale(${scale})`}>
      {units.map(u=>{const f=settings.fonts![u.font];return <g key={u.wordIndex} data-word-index={u.wordIndex} opacity={u.opacity} transform={`translate(${u.dx} ${u.dy})`}>
        <text x={u.x} y={u.y} fill={u.color} fontFamily={f.family} fontWeight={f.weight} fontStyle={f.style??'normal'} fontSize={u.size} letterSpacing={u.tracking} filter="url(#yellow-shadow)" style={{fontSynthesis:'none',fontKerning:'normal',whiteSpace:'pre'}}>
          {u.glyphOpacity?u.graphemes.map((c,i)=><tspan key={i} fillOpacity={u.glyphOpacity![i]}>{c}</tspan>):u.text}
        </text>
      </g>;})}
    </g>
  </svg></AbsoluteFill>;
};

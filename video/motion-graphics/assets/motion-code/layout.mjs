import {layerState,layerBounds,contains,intersects,union,paperFibers} from './src/state.mjs';
import {compileTiming,validatePlan} from './contract.mjs';
// measure(text,size) is supplied by the installed runtime after exact local font loading.
export function wrapLabel(text,width,size,measure){
  if(typeof text!=='string'||!text.trim())throw Error('Empty label');
  for(let fontSize=size;fontSize>=36;fontSize-=2){
    const lines=[];let current='',bad=false;
    for(const word of text.trim().split(/\s+/)){if(measure(word,fontSize)>width){bad=true;break;}const candidate=current?`${current} ${word}`:word;if(measure(candidate,fontSize)>width){lines.push(current);current=word;}else current=candidate;}
    if(bad)continue;if(current)lines.push(current);
    if(lines.length<=3)return {lines,fontSize,lineHeight:fontSize*1.22,width,height:lines.length*fontSize*1.22};
  }throw Error(`Label cannot fit at 36px: ${text}. Simplify wording or enlarge placement.`);
}
export function compileLayout(plan,source,settings,catalog,measure){
  const validated=validatePlan(plan,source,settings,catalog);
  if(validated.status!=='validated')throw Error('Word timestamps required; keep the untimed scene plan and supply timing before export');
  const scale=Math.min(settings.width/1080,settings.height/1920),fit={scale,x:(settings.width-1080*scale)/2,y:(settings.height-1920*scale)/2};
  const exclusions=(settings.exclusions??[]).map(z=>(z.space??'canvas')==='design'?z:{...z,x:(z.x-fit.x)/scale,y:(z.y-fit.y)/scale,width:z.width/scale,height:z.height/scale});
  const scenes=validated.scenes.map(s=>{
    const frames=compileTiming(s,source,settings),[fpsN,fpsD=1]=String(settings.fps).split('/').map(Number),scene={...s,frames,fps:fpsN/fpsD,renderer:validated.style.components[s.component].renderer};
    const p=s.placement,local={x:0,y:0,width:p.width,height:p.height};
    const safe=s.sceneMode==='full-screen'?{x:0,y:0,width:1080,height:1920}:{x:64,y:64,width:952,height:1792};
    const shadow=s.component==='paper-clipping'?s.paperTreatment.edgeShadow:0,angle=s.component==='paper-clipping'?Math.abs(s.paperTreatment.documentTilt)*Math.PI/180:0;
    const tiltedWidth=p.width*Math.cos(angle)+p.height*Math.sin(angle),tiltedHeight=p.height*Math.cos(angle)+p.width*Math.sin(angle);
    const bounds={x:p.x-(tiltedWidth-p.width)/2-shadow,y:p.y-(tiltedHeight-p.height)/2-shadow-12,width:tiltedWidth+shadow*2,height:tiltedHeight+shadow*2+36};
    if(s.sceneMode!=='full-screen'&&!contains(safe,bounds))throw Error(`${s.id}: complete motion/shadow bounds exceed safe canvas`);
    for(const z of exclusions)if((z.startMs===undefined||z.startMs<s.endMs&&z.endMs>s.startMs)&&intersects(bounds,z))throw Error(`${s.id}: protected region collision; reposition, simplify or omit`);
    const layers=(s.layers??[]).map(l=>{
      // Camera + independently timed reveal can peak between camera endpoints.
      const samples=Array.from({length:frames.end-frames.start},(_,i)=>layerBounds(l,layerState(scene,l,frames.start+i))),motionBounds=samples.reduce(union);
      if(l.coverage==='window'){
        if(samples.some(b=>!contains(b,local)))throw Error(`${s.id}/${l.id}: insufficient prepared backing coverage for camera travel`);
      }else if(l.coverage!=='bleed'&&!contains(local,motionBounds))throw Error(`${s.id}/${l.id}: subject motion exceeds protected window`);
      if(l.coverage==='window'&&!l.preparedBacking)throw Error('Window coverage requires preparedBacking provenance');
      return {...l,motionBounds,resolvedTransforms:{start:layerState(scene,l,frames.start),end:layerState(scene,l,frames.end-1)}};
    });
    const labels=[];
    const add=(text,x,y,width,size=48)=>{const m=wrapLabel(text,width,size,measure);if(!contains(local,{x,y,width:m.width,height:m.height}))throw Error(`${s.id}: labels overflow; simplify content`);labels.push({...m,text,x,y});};
    if(s.content?.label)add(s.content.label,40,p.height-160,p.width-80);
    if(s.sourceLabel)add(s.sourceLabel,40,p.height-70,p.width-80,36);
    for(const t of s.titles??[]){add(t.text,t.x,t.y,t.width,t.fontSize);if(labels.at(-1).height>t.height)throw Error('Title exceeds reserved height');Object.assign(labels.at(-1),{eventId:t.eventId,color:t.color});}
    const nodes=s.content?.nodes??[];
    nodes.forEach((text,i)=>add(text,48,64+i*(p.height-128)/nodes.length,p.width-96,52));
    for(const a of s.annotations??[]){add(a.label,a.from[0],a.from[1],Math.min(a.width??240,p.width-a.from[0]),44);labels.at(-1).eventId=a.eventId;if(a.eventId&&!frames.events.some(e=>e.id===a.eventId))throw Error('Annotation eventId is not a saved event');}
    for(const a of s.annotations??[])for(const pt of [a.from,a.to])if(pt[0]<0||pt[1]<0||pt[0]>p.width||pt[1]>p.height)throw Error('Annotation outside scene');
    for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++)if(intersects(labels[i],labels[j]))throw Error(`${s.id}: label collision; simplify or reposition text`);
    const hold=validated.style.components[s.component].readingHoldMs;
    if(hold){const ready=Math.max(frames.entranceEnd,...frames.events.map(e=>e.complete));const [n,d=1]=String(settings.fps).split('/').map(Number);if((frames.exitStart-ready)*1000*d/n<hold-1)throw Error('Delayed reveal leaves insufficient reading hold');}
    const sourceWords=(s.sourceRanges??[]).flatMap(([a,b])=>source.words.slice(a,b));
    return {...scene,layers,labels,bounds,sourceInterval:sourceWords.length?[Math.min(...sourceWords.map(w=>w.startMs)),Math.max(...sourceWords.map(w=>w.endMs))]:null,fibers:paperFibers(s.paperTreatment.textureSeed),cameraInterval:[frames.entranceEnd,frames.exitStart]};
  });
  for(let i=0;i<scenes.length;i++)for(let j=i+1;j<scenes.length;j++)if(scenes[i].frames.start<scenes[j].frames.end&&scenes[j].frames.start<scenes[i].frames.end&&scenes[i].order===scenes[j].order)throw Error('Overlapping scenes require distinct layer order');
  return {style:plan.style,fit,scenes:scenes.sort((a,b)=>a.order-b.order),durationInFrames:Math.max(...scenes.map(s=>s.frames.clipEnd))};
}

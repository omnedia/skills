// Dependency-free authored-plan validation and exact end-exclusive frame compilation.
export const IDENTITY={schema:1,compiler:'editorial-collage-2',renderer:'editorial-collage-2'};
const assert=(value,message)=>{if(!value)throw Error(message);};
export const finite=(x)=>typeof x==='number'&&Number.isFinite(x);
export function fpsRatio(value) {
  const match=String(value).match(/^(\d+)(?:\/(\d+))?$/);
  assert(match,'fps must be an exact integer or numerator/denominator, not 29.97');
  const n=Number(match[1]),d=Number(match[2]??1);assert(Number.isSafeInteger(n)&&Number.isSafeInteger(d)&&n>0&&d>0&&n/d<=240,'Invalid fps');return {n,d};
}
function decimal(value){assert(finite(value),'Time must be finite milliseconds');const s=value.toString();assert(!/[eE]/.test(s),'Time must use ordinary millisecond precision');const [a,b='']=s.split('.');return [BigInt(a+b),10n**BigInt(b.length)];}
export function Qsum(ms,offset,fps) {const [a,b]=decimal(ms),[c,e]=decimal(offset),total=a*e+c*b;assert(total>=0,'Negative file-time boundary: adjust origin explicitly');const {n,d}=fpsRatio(fps),num=total*BigInt(n),den=b*e*1000n*BigInt(d);const result=Number((2n*num+den)/(2n*den));assert(Number.isSafeInteger(result),'Frame count exceeds safe range');return result;}
export function Q(ms,fps){return Qsum(ms,0,fps);}
const addMs=(a,b)=>{const [x,y]=decimal(a),[z,w]=decimal(b);return Number(x*w+z*y)/Number(y*w);};
export function merge(a,b){const out=structuredClone(a);for(const [k,v]of Object.entries(b??{}))out[k]=v&&typeof v==='object'&&!Array.isArray(v)?merge(out[k]??{},v):structuredClone(v);return out;}
export function validateSettings(s){
  for(const k of ['width','height'])assert(Number.isInteger(s[k])&&s[k]>0,`Invalid ${k}`);fpsRatio(s.fps);
  for(const k of ['sourceOffsetMs','timelinePlacementMs'])assert(finite(s[k]),`Invalid ${k}`);assert(s.timelinePlacementMs>=0,'Negative editor origin');
  assert(['clips','sequence'].includes(s.delivery),'delivery must be clips or sequence');
  const e=s.export;assert(e?.codec==='prores'&&e.profile==='4444'&&e.pixelFormat==='yuva444p10le'&&e.container==='mov'&&e.imageFormat==='png','Use silent ProRes 4444 MOV with PNG frames');
  assert(finite(e.scale)&&e.scale>0&&[s.width*e.scale,s.height*e.scale].every(Number.isInteger),'Export scale must produce whole pixel dimensions');
  for(const c of Object.values(s.colors??{}))assert(/^#[a-f\d]{6}$/i.test(c),'Colors must be six-digit hex');
  for(const z of s.exclusions??[]){rect(z,'exclusion');assert(['design','canvas'].includes(z.space??'canvas'),'Invalid exclusion space');if(z.startMs!==undefined)assert(finite(z.startMs)&&finite(z.endMs)&&z.endMs>z.startMs,'Invalid exclusion track interval');}
  return s;
}
export function rect(r,name){assert(r&&['x','y','width','height'].every(k=>finite(r[k]))&&r.width>0&&r.height>0,`Invalid ${name} rectangle`);return r;}
const overrideKeys=['sceneMode','background','surface','depthStrength','camera','motion','paperTreatment','highlight','sourceLabel','asset','layers','annotations','strokes','titles','crop','cameraTravel'];
function overrides(o){for(const key of Object.keys(o??{}))assert(overrideKeys.includes(key),`Unsupported override: ${key}`);for(const [key,allowed]of Object.entries({camera:['x','y','zoom','from','easing'],motion:['entranceMs','exitMs','transition'],paperTreatment:['textureAsset','textureSeed','textureStrength','internalPaperOpacity','tint','edgeShadow','documentTilt','backingSheet']}))for(const k of Object.keys(o?.[key]??{}))assert(allowed.includes(k),`Unsupported ${key} override: ${k}`);}
export function validatePlan(plan,source,settings,catalog) {
  validateSettings(settings);assert(plan.schemaVersion===1,'Unsupported scene schema');
  const style=catalog.find(s=>s.id===plan.style);assert(style,'Unsupported style');
  assert(['standalone','transcript'].includes(plan.mode),'Declare standalone or transcript timing');
  const scenes=plan.graphicsPlan?.scenes;assert(Array.isArray(scenes)&&scenes.length,'No selected scenes');
  const words=source?.words??[];
  if(plan.mode==='transcript')assert(words.length&&words.every(w=>typeof w.text==='string'),'Preserve normalized source.words, even when untimed');
  const timed=words.length&&words.every(w=>finite(w.startMs)&&finite(w.endMs)&&w.startMs>=0&&w.endMs>w.startMs);
  if(timed)words.forEach((w,i)=>assert(!i||w.startMs>=words[i-1].startMs,'Source word order must be preserved'));
  const ids=new Set(),assets=new Set();
  for(const a of plan.assets??[]){assert(/^[a-z][a-z0-9-]*$/.test(a.id)&&!assets.has(a.id),'Invalid/duplicate asset ID');assets.add(a.id);assert(a.path&&a.provenance&&a.license&&['illustration','supplied','documentary','mask','texture'].includes(a.kind),'Record local asset path, provenance, kind and license');}
  const project=plan.authoredOverrides?.project??{};overrides(project);
  for(const [id,o]of Object.entries(plan.authoredOverrides?.scenes??{})){assert(scenes.some(s=>s.id===id),`Unknown override scene ${id}`);overrides(Object.fromEntries(Object.entries(o).filter(([k])=>k!=='components')));for(const [type,v]of Object.entries(o.components??{})){assert(scenes.find(s=>s.id===id).component===type,'Override targets wrong component');overrides(v);}}
  const resolved=scenes.map(original=>{
    assert(/^[a-z][a-z0-9-]*$/.test(original.id)&&!ids.has(original.id),'Invalid/duplicate scene ID');ids.add(original.id);
    const capability=style.components[original.component];assert(capability,`Unsupported component: ${original.component}`);
    const override=plan.authoredOverrides?.scenes?.[original.id]??{}, {components,...sceneOverride}=override;
    const s=merge(merge(merge(merge(style.defaults,original),project),sceneOverride),components?.[original.component]);
    // An overlay is a deliberate local treatment; retain its old transition unless authored.
    if(s.sceneMode==='overlay'&&!original.motion?.transition&&!project.motion?.transition&&!sceneOverride.motion?.transition&&!components?.[original.component]?.motion?.transition)s.motion.transition='fade-slide';
    assert(s.selectionReason&&s.selectionReason.trim(),'Explain the selected moment');
    assert(style.parameterSchema.sceneMode.includes(s.sceneMode),'Unsupported scene mode');
    assert(style.parameterSchema.surface.includes(s.surface),'Unsupported surface');
    if(s.background)assert(s.sceneMode==='full-screen'&&/^#[a-f\d]{6}$/i.test(s.background),'A background requires explicit full-screen mode');
    if(s.sceneMode==='full-screen'&&!s.background)s.background=settings.colors?.surface??style.colors.surface;
    rect(s.placement,'placement');assert(Number.isInteger(s.order),'Save explicit compositing order');
    if(plan.mode==='transcript'){
      assert(s.sourceRanges?.length,'Missing global source ranges');
      for(const range of s.sourceRanges){assert(Array.isArray(range)&&range.length===2,'Invalid end-exclusive word range');const [a,b]=range;assert(Number.isInteger(a)&&Number.isInteger(b)&&a>=0&&b>a&&b<=words.length,'Invalid end-exclusive word range');}
      assert(Number.isInteger(s.anchorWord)&&s.sourceRanges.some(([a,b])=>s.anchorWord>=a&&s.anchorWord<b),'Use an exact anchor word occurrence within the range');
    }else assert(!s.sourceRanges&&!('anchorWord'in s),'Standalone timing cannot claim word synchronization');
    const layers=s.layers??[];assert(layers.length>=capability.minLayers&&layers.length<=capability.maxLayers,'Wrong layer count');
    if(s.crop&&layers.length===1)layers[0].crop=s.crop;
    const layerIds=new Set();
    for(const l of layers){assert(l.id&&!layerIds.has(l.id),'Unique layer IDs required');layerIds.add(l.id);assert(assets.has(l.asset),'Missing layer asset');if(l.mask)assert(assets.has(l.mask),'Missing layer mask');rect(l.rect,'layer');assert(finite(l.depth)&&l.depth>=0&&l.depth<=4,'Invalid layer depth');assert(Array.isArray(l.pivot)&&l.pivot.length===2&&l.pivot.every(v=>finite(v)&&v>=0&&v<=1),'Save normalized layer pivot');if(l.crop)assert(['x','y'].every(k=>finite(l.crop[k])&&l.crop[k]>=0&&l.crop[k]<=100),'Crop uses percentage x/y');}
    for(const l of layers){
      if(l.opacity!==undefined)assert(finite(l.opacity)&&l.opacity>=0&&l.opacity<=1,'Invalid layer opacity');
      if(l.grayscale!==undefined)assert(finite(l.grayscale)&&l.grayscale>=0&&l.grayscale<=1,'Invalid grayscale');
      if(l.coverage!==undefined)assert(['window','bleed'].includes(l.coverage),'Invalid coverage mode');
      if(l.coverage==='bleed')assert(s.sceneMode==='full-screen'&&l.bleedReason,'Intentional cropped edges need full-screen mode and bleedReason');
      if(l.reveal)assert(l.reveal.eventId&&finite(l.reveal.x??0)&&finite(l.reveal.y??0),'Invalid layer reveal');
    }
    if(s.asset)assert(assets.has(s.asset),'Missing asset override');
    if(s.asset&&layers.length===1)layers[0].asset=s.asset;
    if(s.component==='layered-parallax')assert(new Set(layers.map(l=>l.depth)).size>1,'Parallax needs distinct depths');
    const camera=s.camera??{x:0,y:0,zoom:0};assert(['x','y','zoom'].every(k=>finite(camera[k]))&&Math.abs(camera.zoom)<=0.15,'Invalid/restrained camera path');
    if(camera.from)assert(['x','y','zoom'].every(k=>finite(camera.from[k]))&&Math.abs(camera.from.zoom)<=.15,'Invalid camera start');
    assert(['linear','in','out','in-out'].includes(camera.easing??'linear'),'Invalid camera easing');
    assert(layers.every(l=>1+(camera.from?.zoom??0)*l.depth*s.depthStrength>0),'Camera start collapses a layer');
    assert(finite(s.depthStrength)&&s.depthStrength>=0&&s.depthStrength<=2,'Invalid depthStrength');s.camera=camera;
    assert(layers.every(l=>1+camera.zoom*l.depth*s.depthStrength>0),'Camera collapses a layer');
    if(s.cameraTravel!==undefined){assert(finite(s.cameraTravel),'Invalid cameraTravel');s.camera.x=s.cameraTravel;}
    if(s.component==='layered-parallax')assert(s.depthStrength>0&&['x','y','zoom'].some(k=>camera[k] !== (camera.from?.[k]??0)),'Parallax requires relative motion');
    for(const k of ['entranceMs','exitMs'])assert(finite(s.motion[k])&&s.motion[k]>0,`Invalid ${k}`);
    assert(['cut','fade-slide'].includes(s.motion.transition),'Unsupported transition');
    const paper=s.paperTreatment;assert(finite(paper.textureStrength)&&paper.textureStrength>=0&&paper.textureStrength<=0.3&&finite(paper.internalPaperOpacity)&&paper.internalPaperOpacity>=0.85&&paper.internalPaperOpacity<=1,'Invalid paper material strength/opacity');assert(Number.isInteger(paper.textureSeed)&&finite(paper.documentTilt)&&Math.abs(paper.documentTilt)<=5&&finite(paper.edgeShadow)&&paper.edgeShadow>=0&&paper.edgeShadow<=24,'Invalid paper material geometry');if(paper.textureAsset)assert(assets.has(paper.textureAsset),'Missing texture asset');
    assert(/^#[a-f\d]{6}$/i.test(paper.tint)&&typeof paper.backingSheet==='boolean','Invalid paper tint/backing');
    if(s.highlight)assert(/^#[a-f\d]{6}$/i.test(s.highlight),'Invalid highlight color');
    if(s.component==='text-diagram')assert(s.content?.nodes?.length>=2&&s.content.nodes.length<=3,'Diagrams support 2–3 nodes');
    if(s.component==='object-callout')assert(s.annotations?.length>=1&&s.annotations.length<=2,'Callout needs 1–2 annotations');
    for(const a of s.annotations??[]){assert(a.label&&a.from?.length===2&&a.to?.length===2&&[...a.from,...a.to].every(finite),'Invalid annotation');if(a.layerId)assert(layerIds.has(a.layerId),'Unknown attached layer');}
    const referencedEvents=[...layers.map(l=>l.reveal?.eventId),...(s.strokes??[]).map(l=>l.eventId),...(s.titles??[]).map(l=>l.eventId)].filter(Boolean);
    assert(referencedEvents.every(id=>(s.events??[]).some(e=>e.id===id)),'Unknown reveal event');
    for(const t of s.titles??[]){rect(t,'title');assert(typeof t.text==='string'&&t.text.trim()&&finite(t.fontSize)&&t.fontSize>=36,'Invalid title');if(t.color)assert(/^#[a-f\d]{6}$/i.test(t.color),'Invalid title color');}
    for(const stroke of s.strokes??[]){
      const paths=stroke.variants??[stroke.path];
      assert(Array.isArray(paths)&&paths.length>0&&paths.every(p=>typeof p==='string'&&/^M[\d\s.,+eE\-MLCQSTZmlcqstz]+$/.test(p)),'Use local SVG stroke paths');
      assert(finite(stroke.width)&&stroke.width>0&&stroke.width<=24,'Invalid stroke width');
      assert(finite(stroke.boilFps??0)&&(stroke.boilFps??0)>=0&&(stroke.boilFps??0)<=12,'Invalid line boil rate');
      if(stroke.color)assert(/^#[a-f\d]{6}$/i.test(stroke.color),'Invalid stroke color');
      if(stroke.layerId)assert(layerIds.has(stroke.layerId),'Unknown stroke layer');
    }
    if(plan.mode==='transcript'&&!timed)return s;
    if(plan.mode==='transcript')assert(s.startMs===words[s.anchorWord].startMs,'Scene onset must match its exact anchor word');
    assert(finite(s.startMs)&&finite(s.endMs)&&s.endMs>s.startMs,'Invalid scene interval');
    const exit=s.exitStartMs??s.endMs-s.motion.exitMs,ready=s.startMs+s.motion.entranceMs;
    assert(exit>=ready&&exit<s.endMs,'Motion does not fit: simplify the scene');
    if(capability.readingHoldMs)assert(exit-ready>=capability.readingHoldMs,'Insufficient completed reading hold: simplify or omit');
    const eventIds=new Set();for(const e of s.events??[]){assert(e.id&&!eventIds.has(e.id),'Unique event ID required');eventIds.add(e.id);assert(finite(e.durationMs??0)&&(e.durationMs??0)>=0,'Invalid event duration');if(plan.mode==='transcript')assert(Number.isInteger(e.anchorWord)&&s.sourceRanges.some(([a,b])=>e.anchorWord>=a&&e.anchorWord<b),'Event anchor must be an exact source occurrence');else assert(finite(e.timeMs),'Authored event needs timeMs');const t=plan.mode==='transcript'?words[e.anchorWord].startMs:e.timeMs;assert(t>=s.startMs&&t+(e.durationMs??0)<=exit,'Reveal must fit before exit');}
    s.exitStartMs=exit;return s;
  });
  return {style,scenes:resolved,status:plan.mode==='transcript'&&!timed?'needs-word-timing':'validated'};
}
export function compileTiming(s,source,settings) {
  const {fps,sourceOffsetMs:offset,timelinePlacementMs:origin}=settings;
  const rounding=[];
  const event=(id,t)=>{const frame=Qsum(t,offset,fps),{n,d}=fpsRatio(fps);rounding.push({id,sourceMs:t,frame,deltaMs:frame*1000*d/n-addMs(t,offset)});return frame;};
  const start=event('start',s.startMs),end=event('end',s.endMs),entranceEnd=event('entranceEnd',addMs(s.startMs,s.motion.entranceMs)),exitStart=event('exitStart',s.exitStartMs);
  assert(start<entranceEnd&&entranceEnd<=exitStart&&exitStart<end,'Collapsed required frame interval');
  const handles=s.handles??{leadingMs:0,trailingMs:0};assert([handles.leadingMs,handles.trailingMs].every(v=>finite(v)&&v>=0),'Invalid explicit handles');
  const clipStart=event('clipStart',addMs(s.startMs,-handles.leadingMs)),clipEnd=event('clipEnd',addMs(s.endMs,handles.trailingMs));
  const events=(s.events??[]).map(e=>{const t=e.anchorWord===undefined?e.timeMs:source.words[e.anchorWord].startMs;const frame=event(e.id,t),complete=event(`${e.id}:complete`,addMs(t,e.durationMs??0));if(e.durationMs)assert(complete>frame,'Collapsed event interval');return {...e,frame,complete,localFrame:frame-clipStart,localComplete:complete-clipStart};});
  const editorOrigin=Q(origin,fps),{n,d}=fpsRatio(fps);
  return {start,end,clipStart,clipEnd,entranceEnd,exitStart,duration:clipEnd-clipStart,localStart:start-clipStart,localExit:exitStart-clipStart,placementFrame:editorOrigin+clipStart,editorOrigin,editorOriginDeltaMs:editorOrigin*1000*d/n-origin,handles,events,rounding};
}

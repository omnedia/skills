export const clamp=x=>Math.max(0,Math.min(1,x));
export const ease=(x,kind='linear')=>kind==='in'?x*x*x:kind==='out'?1-(1-x)**3:kind==='in-out'?(x<.5?4*x*x*x:1-(-2*x+2)**3/2):x;
export function eventProgress(scene,eventId,frame){
  const event=scene.frames.events.find(e=>e.id===eventId);
  if(!event)return 1;
  return event.complete===event.frame?(frame>=event.frame?1:0):clamp((frame-event.frame)/(event.complete-event.frame));
}
export function sceneState(scene,frame){
  const t=scene.frames,active=frame>=t.start&&frame<t.end;
  const enter=clamp((frame-t.start)/Math.max(1,t.entranceEnd-t.start));
  // Settle to transparent on the final visible frame, before unmounting.
  const exit=clamp((frame-t.exitStart)/Math.max(1,t.end-1-t.exitStart));
  const cut=scene.motion?.transition==='cut';
  // The cut boundary is end-exclusive: reach the endpoint at the next shot's first
  // frame, not one frame early (which would duplicate the pose across the cut).
  const camera=ease(clamp((frame-(cut?t.start:t.entranceEnd))/((cut?t.end:t.exitStart)-(cut?t.start:t.entranceEnd)||1)),scene.camera?.easing);
  const smooth=x=>x*x*(3-2*x);
  return {active,opacity:active?(cut?1:smooth(enter)*(1-smooth(exit))):0,y:cut?0:24*Math.pow(1-enter,3)-12*smooth(exit),camera};
}
export function layerState(scene,layer,frame){
  const {camera}=sceneState(scene,frame),strength=layer.depth*scene.depthStrength;
  const from=scene.camera.from??{x:0,y:0,zoom:0},reveal=ease(eventProgress(scene,layer.reveal?.eventId,frame),'out');
  return {x:(from.x+(scene.camera.x-from.x)*camera)*strength+(layer.reveal?.x??0)*(1-reveal),y:(from.y+(scene.camera.y-from.y)*camera)*strength+(layer.reveal?.y??0)*(1-reveal),scale:1+(from.zoom+(scene.camera.zoom-from.zoom)*camera)*strength,opacity:(layer.opacity??1)*reveal};
}
// Hand-drawn line variants are preauthored geometry; only their discrete selection changes.
export function strokeState(scene,stroke,frame){
  const progress=eventProgress(scene,stroke.eventId,frame),paths=stroke.variants??[stroke.path];
  const tick=Math.floor(Math.max(0,frame-scene.frames.start)*(stroke.boilFps??0)/(scene.fps??30));
  return {path:paths[tick%paths.length],progress};
}
export function layerBounds(layer,transform){const r=layer.rect,[px,py]=layer.pivot;return {x:r.x+transform.x-r.width*(transform.scale-1)*px,y:r.y+transform.y-r.height*(transform.scale-1)*py,width:r.width*transform.scale,height:r.height*transform.scale};}
export const intersects=(a,b)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
export const contains=(a,b)=>b.x>=a.x&&b.y>=a.y&&b.x+b.width<=a.x+a.width&&b.y+b.height<=a.y+a.height;
export function union(a,b){const x=Math.min(a.x,b.x),y=Math.min(a.y,b.y);return {x,y,width:Math.max(a.x+a.width,b.x+b.width)-x,height:Math.max(a.y+a.height,b.y+b.height)-y};}
export function paperFibers(seed,count=160){let v=seed>>>0;const next=()=>{v=(Math.imul(v,1664525)+1013904223)>>>0;return v/4294967296;};return Array.from({length:count},()=>({x:next(),y:next(),length:2+next()*13,opacity:0.1+next()*0.4}));}

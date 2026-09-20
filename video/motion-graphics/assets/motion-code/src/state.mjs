export const clamp=x=>Math.max(0,Math.min(1,x));
export function sceneState(scene,frame){
  const t=scene.frames,active=frame>=t.start&&frame<t.end;
  const enter=clamp((frame-t.start)/(t.entranceEnd-t.start));
  const exit=clamp((frame-t.exitStart)/(t.end-t.exitStart));
  const camera=clamp((frame-t.entranceEnd)/(t.exitStart-t.entranceEnd||1));
  return {active,opacity:active?Math.min(enter*3,1)*(1-exit):0,y:24*Math.pow(1-enter,3)-12*exit,camera};
}
export function layerState(scene,layer,frame){
  const {camera}=sceneState(scene,frame),strength=layer.depth*scene.depthStrength;
  return {x:scene.camera.x*strength*camera,y:scene.camera.y*strength*camera,scale:1+scene.camera.zoom*strength*camera};
}
export function layerBounds(layer,transform){const r=layer.rect,[px,py]=layer.pivot;return {x:r.x+transform.x-r.width*(transform.scale-1)*px,y:r.y+transform.y-r.height*(transform.scale-1)*py,width:r.width*transform.scale,height:r.height*transform.scale};}
export const intersects=(a,b)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
export const contains=(a,b)=>b.x>=a.x&&b.y>=a.y&&b.x+b.width<=a.x+a.width&&b.y+b.height<=a.y+a.height;
export function union(a,b){const x=Math.min(a.x,b.x),y=Math.min(a.y,b.y);return {x,y,width:Math.max(a.x+a.width,b.x+b.width)-x,height:Math.max(a.y+a.height,b.y+b.height)-y};}
export function paperFibers(seed,count=160){let v=seed>>>0;const next=()=>{v=(Math.imul(v,1664525)+1013904223)>>>0;return v/4294967296;};return Array.from({length:count},()=>({x:next(),y:next(),length:2+next()*13,opacity:0.1+next()*0.4}));}

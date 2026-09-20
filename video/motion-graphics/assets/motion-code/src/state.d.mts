export function clamp(value:number):number;
export function sceneState(scene:any,frame:number):{active:boolean;opacity:number;y:number;camera:number};
export function layerState(scene:any,layer:any,frame:number):{x:number;y:number;scale:number};
export function layerBounds(layer:any,transform:any):{x:number;y:number;width:number;height:number};
export function intersects(a:any,b:any):boolean;
export function contains(a:any,b:any):boolean;
export function union(a:any,b:any):{x:number;y:number;width:number;height:number};
export function paperFibers(seed:number,count?:number):Array<{x:number;y:number;length:number;opacity:number}>;

import type {Caption} from '@remotion/captions';
export type Role='hero'|'supporting'|'connector'|'emphasis'|'ordinary'|'ordinary-script';
export type Group={from:number;to:number;role:Role;size:number;color:string;explicitColor:boolean;casing:'upper'|'lower'|'preserve';travel:number;blur:number;tracking:number;lineSpacing:number;align:string;zIndex:number;index:number;entrance:'instant'|'rise-fade';entranceMs:number;easing:'ease-out-cubic';exit:'cut'|'fade';exitMs:number;behavior:'replacement'|'accumulation';line?:number;maxWidthRatio?:number;breakAfter?:number[];endMs?:number;offset?:{x:number;y:number};anchor?:{x:number;y:number}};
export type Phrase={index:number;from:number;to:number;mode:'ordinary'|'decorative'|'stack';template:string;startMs:number;endMs:number;anchor:{x:number;y:number};groups:Group[]};
export type Plan={version:number;words:{index:number;text:string;startMs:number;endMs:number}[];phrases:Phrase[]};
export type VermilionOptions={phraseRanges?:[number,number][];scriptShare?:number;gapMs?:number;maxPhraseWords?:number;decorationIntervalMs?:number;holdMs?:number;maxWidthRatio?:number;anchor?:{x:number;y:number};entranceMs?:number;exitMs?:number;roles?:Partial<Record<Role,Partial<Group>>>;phrases?:Record<number,Partial<Omit<Phrase,'groups'>> & {groups?:Partial<Group>[];defaults?:Partial<Group>}>};
export type Metrics={width:number;left:number;right:number;ascent:number;descent:number};
export type Unit=Group & {wordIndex:number;text:string;startMs:number;endMs:number;x:number;y:number;metrics:Metrics};
export type Layout=(Phrase & {units:Unit[]})[];
export const vermilionDefaults:VermilionOptions;
export function vermilionOptions(options?:VermilionOptions):VermilionOptions;
export function displayText(text:string,casing:string):string;
export function planVermilion(sentences:{words:Caption[]}[],options?:VermilionOptions):Plan;
export function layoutVermilion(plan:Plan,measure:(text:string,role:Role,size:number,tracking:number)=>Metrics,width:number,height:number,options?:VermilionOptions,colors?:Record<string,string>):Layout;
export function vermilionState(layout:Layout,timeMs:number):(Unit & {opacity:number;dy:number;motionBlur:number})[];

export function isVermilionScript(role:string):boolean;

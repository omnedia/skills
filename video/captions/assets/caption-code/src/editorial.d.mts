import type {Caption} from '@remotion/captions';
export function underlineMetrics(treatment: string, scale: number): {thickness: number; gap: number; curve: number; extraHeight: number};
export type Role = 'primary' | 'sans' | 'serif' | 'handwritten';
export type EditorialOptions = {
  sizes?: Partial<Record<Role, number>>; centerRatio?: number; minFitScale?: number;
  travel?: number; entranceMs?: number; drawMs?: number; drawDelayMs?: number; exitMs?: number;
  phrases?: Record<number, {emphasisIndex?: number; lines?: {count: number; role: Role}[];
    groupSizes?: number[]; directions?: Record<number, 'left'|'right'|'top'|'bottom'>;
    gradient?: 'cream'|'pink'|'none'; underline?: 'orange'|'white'|'none'}>;
};
export type Metrics = {width: number; left: number; right: number; ascent: number; descent: number};
export type Group = Metrics & {from: number; to: number; text: string; direction: string; startMs: number; endMs: number; emphasis: boolean; role: Role; size: number; x: number; y: number};
export type EditorialSegment = {words: Caption[]; groups: Group[]; startMs: number; endMs: number; template: string; gradient: string; underline: string; travel: number; scale: number};
export function editorialLayout(sentences: {words: Caption[]}[], measure: (text: string, role: Role, size: number) => Metrics, width: number, height: number, options?: EditorialOptions): EditorialSegment[];
export function editorialState(segments: EditorialSegment[], timeMs: number, options?: EditorialOptions): {segment: EditorialSegment; opacity: number; groups: (Group & {opacity: number; dx: number; dy: number; draw: number})[]} | null;

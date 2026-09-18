import type {Caption} from '@remotion/captions';
export type Segment = {lines: Caption[][]; startMs: number; endMs: number};
export function layoutSentences(sentences: {words: Caption[]}[], measure: (text: string) => number, maxWidth: number): Segment[];
export function segmentState(segments: Segment[], timeMs: number, fadeMs?: number): {segment: Segment; opacity: number; active: Caption | null} | null;

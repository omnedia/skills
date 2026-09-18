import React, {useEffect, useState} from 'react';
import {AbsoluteFill, cancelRender, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Caption} from '@remotion/captions';
import {layoutSentences, segmentState} from './layout.mjs';

export type Settings = {
  width: number; height: number; fps: number; durationInFrames: number;
  sourceOffsetMs: number; timelinePlacementMs: number;
  colors: {base: string; active: string; shadow: string};
  font: {asset: string; family: string; weight: number};
  styleOptions?: {fontSize?: number; bottomRatio?: number};
};
export type Props = {settings: Settings; sentences: {words: Caption[]}[]; previewBackground?: string};

export const CaptionOverlay: React.FC<Props> = ({settings, sentences, previewBackground}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const [handle] = useState(() => delayRender('Load exact bundled font and measure captions'));
  const [segments, setSegments] = useState<ReturnType<typeof layoutSentences> | null>(null);
  const scale = Math.min(width, height) / 1080;
  const fontSize = settings.styleOptions?.fontSize ?? 64 * scale;
  useEffect(() => {
    let mounted = true;
    const font = new FontFace(settings.font.family, `url("${staticFile(settings.font.asset)}")`, {weight: String(settings.font.weight)});
    font.load().then(async face => {
      (document.fonts as FontFaceSet & {add(font: FontFace): void}).add(face);
      await document.fonts.load(`${settings.font.weight} ${fontSize}px "${settings.font.family}"`);
      const context = document.createElement('canvas').getContext('2d')!;
      context.font = `${settings.font.weight} ${fontSize}px "${settings.font.family}"`;
      const result = layoutSentences(sentences, (s: string) => context.measureText(s).width, width * 0.84);
      if (mounted) {setSegments(result); continueRender(handle);}
    }).catch(cancelRender);
    return () => {mounted = false;};
  }, [sentences, settings.font.asset, settings.font.family, settings.font.weight, fontSize, width, handle]);
  if (!segments) return null;
  const state = segmentState(segments, frame * 1000 / fps - settings.sourceOffsetMs);
  return <AbsoluteFill style={{backgroundColor: previewBackground}}>
    {state && <div data-caption-block style={{position: 'absolute', left: '8%', width: '84%',
      bottom: `${100 * (settings.styleOptions?.bottomRatio ?? 0.18)}%`, textAlign: 'center',
      fontFamily: settings.font.family, fontWeight: settings.font.weight, fontSize,
      lineHeight: 1.2, opacity: state.opacity,
      textShadow: `0 ${2 * scale}px ${4 * scale}px ${settings.colors.shadow}99`,
      WebkitTextStroke: `${scale}px ${settings.colors.shadow}66`, paintOrder: 'stroke fill'}}>
      {state.segment.lines.map((line: Caption[], lineIndex: number) => <div key={lineIndex} style={{whiteSpace: 'pre'}}>
        {line.map((word, i) => <span key={i} data-active={word === state.active}
          style={{color: word === state.active ? settings.colors.active : settings.colors.base}}>
          {i === 0 ? word.text.replace(/\s+/gu, ' ').trimStart() : word.text.replace(/\s+/gu, ' ')}
        </span>)}
      </div>)}
    </div>}
  </AbsoluteFill>;
};

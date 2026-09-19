import React, {useEffect, useState} from 'react';
import {AbsoluteFill, cancelRender, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {editorialLayout, editorialState, underlineMetrics, type EditorialSegment, type Role, type EditorialOptions} from './editorial.mjs';
import type {Props} from './CaptionOverlay';

export const EditorialKinetic: React.FC<Props> = ({settings, sentences, previewBackground}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const [handle] = useState(() => delayRender('Load Editorial Kinetic fonts and measure complete phrases'));
  const [segments, setSegments] = useState<EditorialSegment[] | null>(null);
  const fonts = settings.fonts!;
  const options = settings.styleOptions as EditorialOptions;
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!fonts?.primary || !fonts.serif || !fonts.handwritten) throw Error('Editorial Kinetic requires all three bundled fonts');
      for (const font of Object.values(fonts)) {
        const response = await fetch(staticFile(font.asset));
        if (!response.ok) throw Error(`Missing font: ${font.asset}`);
        const bytes = await response.arrayBuffer();
        const digest = await crypto.subtle.digest('SHA-256', bytes);
        const sha = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
        if (sha !== font.sha256) throw Error(`Font checksum mismatch: ${font.asset}`);
        const face = await new FontFace(font.family, bytes, {weight: String(font.weight), style: font.style ?? 'normal'}).load();
        (document.fonts as FontFaceSet & {add(font: FontFace): void}).add(face);
      }
      const context = document.createElement('canvas').getContext('2d')!;
      const result = editorialLayout(sentences, (text, role, size) => {
        const font = fonts[role === 'sans' ? 'primary' : role];
        if (font.codepoints && [...text].some(c => !font.codepoints!.includes(c.codePointAt(0)!))) throw Error(`Text contains a glyph absent from ${font.family}; choose another role or a licensed font override`);
        context.font = `${font.style ?? 'normal'} ${font.weight} ${size}px "${font.family}"`;
        const m = context.measureText(text);
        return {width: m.width, left: m.actualBoundingBoxLeft, right: m.actualBoundingBoxRight,
          ascent: m.actualBoundingBoxAscent, descent: m.actualBoundingBoxDescent};
      }, width, height, options);
      if (mounted) {setSegments(result); continueRender(handle);}
    })().catch(cancelRender);
    return () => {mounted = false;};
  }, [fonts, sentences, width, height, options, handle]);
  if (!segments) return null;
  const state = editorialState(segments, frame * 1000 / fps - settings.sourceOffsetMs, options);
  const colors = settings.colors;
  const fontFor = (role: Role) => fonts[role === 'sans' ? 'primary' : role];
  return <AbsoluteFill style={{backgroundColor: previewBackground}}>
    {state && <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{opacity: state.opacity}}>
      <defs>
        <linearGradient id="editorial-cream" x1="0" y1="0" x2="0" y2="1"><stop stopColor={colors.creamTop}/><stop offset="1" stopColor={colors.creamBottom}/></linearGradient>
        <linearGradient id="editorial-pink" x1="0" y1="0" x2="0" y2="1"><stop stopColor={colors.pinkTop}/><stop offset="1" stopColor={colors.pinkBottom}/></linearGradient>
      </defs>
      {state.groups.map(group => {
        const font = fontFor(group.role);
        const underline = underlineMetrics(state.segment.underline, state.segment.scale);
        const strokeWidth = underline.thickness;
        const left = group.x - group.left, right = group.x + group.right;
        const y = group.y + group.descent + underline.gap + strokeWidth / 2 + underline.curve / 2;
        return <g key={group.from} data-editorial-group={group.from} opacity={group.opacity}
          transform={`translate(${group.dx} ${group.dy})`}>
          <text x={group.x} y={group.y} xmlSpace="preserve" fontFamily={font.family} fontSize={group.size}
            fontWeight={font.weight} fontStyle={font.style ?? 'normal'} style={{fontSynthesis: 'none', filter: `drop-shadow(0 ${2*state.segment.scale}px ${3*state.segment.scale}px ${colors.shadow}99)`}}
            fill={group.emphasis && state.segment.gradient !== 'none' ? `url(#editorial-${state.segment.gradient})` : group.role === 'handwritten' ? colors.accent : colors.base}>{group.text}</text>
          {group.emphasis && state.segment.underline !== 'none' && <>
            <defs><clipPath id={`underline-${group.from}`}><rect x={left - strokeWidth} y={y - strokeWidth * 3} width={(right - left + strokeWidth * 2) * group.draw} height={strokeWidth * 6}/></clipPath></defs>
            <path d={state.segment.underline === 'orange' ? `M ${left} ${y} H ${right}` : `M ${left} ${y} Q ${(left+right)/2} ${y-underline.curve} ${right} ${y}`}
              fill="none" stroke={state.segment.underline === 'orange' ? colors.accent : colors.stroke}
              strokeWidth={strokeWidth} strokeLinecap="round" clipPath={`url(#underline-${group.from})`}/>
          </>}
        </g>;
      })}
    </svg>}
  </AbsoluteFill>;
};
